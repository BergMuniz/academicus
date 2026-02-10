module.exports = async (req, res) => {
  // 1. Permissões de Acesso (CORS) - Fundamental para o site funcionar
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. Resposta rápida para o navegador
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 3. Pega a chave e limpa espaços
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Chave API não configurada no Vercel.");
    const cleanKey = apiKey.trim();

    const { prompt } = req.body;

    // 4. CONEXÃO DIRETA (Sem Biblioteca Antiga)
    // Aqui acessamos o Google diretamente pelo link oficial
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${cleanKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    // 5. Verifica se o Google deu erro
    if (!response.ok) {
      console.error("Erro do Google:", JSON.stringify(data));
      throw new Error(data.error?.message || "Erro na resposta da IA");
    }

    // 6. Devolve o texto para o seu site
    const text = data.candidates[0].content.parts[0].text;
    res.status(200).json({ text });

  } catch (error) {
    console.error("Erro Fatal no Backend:", error);
    res.status(500).json({ error: error.message });
  }
};
