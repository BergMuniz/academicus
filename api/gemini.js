module.exports = async (req, res) => {
  // 1. Permissões de Acesso (CORS)
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

    // --- O PULO DO GATO ---
    // Usamos 'v1beta' (Canal de testes/gratuito) com o modelo 'gemini-1.5-flash' (Padrão)
    // Essa combinação é a que tem cota gratuita liberada.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${cleanKey}`;
    
    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error("Erro Google:", JSON.stringify(data));
      // Se der erro 429 de novo, o script avisa para esperar
      if (data.error?.code === 429) {
         throw new Error("Limite de uso gratuito atingido. Espere 1 minuto e tente novamente.");
      }
      throw new Error(data.error?.message || "Erro na resposta da IA");
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("IA não retornou texto.");

    res.status(200).json({ text });

  } catch (error) {
    console.error("Erro Fatal no Backend:", error);
    res.status(500).json({ error: error.message });
  }
};
