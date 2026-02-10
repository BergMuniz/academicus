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

    // --- A CORREÇÃO PARA 2026 ---
    // Substituímos o antigo 'gemini-pro' ou '1.5-flash' pelo 'gemini-2.0-flash'
    // Se este falhar futuramente, tente 'gemini-2.0-flash-lite'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${cleanKey}`;
    
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
      // Tratamento específico para erro de modelo
      if (data.error?.code === 404) {
         throw new Error("Modelo descontinuado. Tente atualizar para gemini-2.5-flash no código.");
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
