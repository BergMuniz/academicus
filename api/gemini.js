module.exports = async (req, res) => {
  // 1. Configuração de Segurança (CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Chave API não configurada.");
    const cleanKey = apiKey.trim();
    const { prompt } = req.body;

    // --- LISTA DE MODELOS PARA TENTAR (EM ORDEM) ---
    // Se o 'flash' genérico falhar, ele tenta o '002', depois o '001', depois o '8b', etc.
    const modelsToTry = [
      "gemini-1.5-flash",          // Padrão atual
      "gemini-1.5-flash-002",      // Versão específica atualizada
      "gemini-1.5-flash-001",      // Versão específica original
      "gemini-1.5-flash-8b",       // Versão leve (alta disponibilidade)
      "gemini-1.5-pro",            // Versão mais potente
    ];

    let lastError = null;
    let successText = null;

    // Loop que tenta conectar em cada modelo até conseguir
    for (const model of modelsToTry) {
      try {
        console.log(`Tentando modelo: ${model}...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();

        // Se deu erro, lança exceção para tentar o próximo
        if (!response.ok) {
            const msg = data.error?.message || "Erro desconhecido";
            // Se for cota (429) ou não encontrado (404), vai pro próximo
            throw new Error(`Falha no ${model}: ${msg}`);
        }

        // Se chegou aqui, funcionou!
        successText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (successText) break; // Sai do loop

      } catch (err) {
        console.error(err.message);
        lastError = err;
        // Continua para o próximo modelo da lista...
      }
    }

    // Se nenhum modelo funcionou após todas as tentativas
    if (!successText) {
      throw new Error(`Todos os modelos falharam. Último erro: ${lastError?.message}`);
    }

    res.status(200).json({ text: successText });

  } catch (error) {
    console.error("Erro Fatal no Backend:", error);
    res.status(500).json({ error: error.message });
  }
};
