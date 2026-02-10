module.exports = async (req, res) => {
  // 1. Permissões (CORS)
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

    // --- A SOLUÇÃO FINAL ---
    // Trocamos para o modelo 'gemini-pro' (O mais estável e compatível de todos)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${cleanKey}`;
    
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
      throw new Error(data.error?.message || "Erro na IA");
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("IA não retornou texto.");

    res.status(200).json({ text });

  } catch (error) {
    console.error("Erro Backend:", error);
    res.status(500).json({ error: error.message });
  }
};
