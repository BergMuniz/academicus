module.exports = async (req, res) => {
  // 1. Configurações de Segurança (CORS)
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
    if (!apiKey) throw new Error("Chave API não configurada no Vercel.");
    
    const cleanKey = apiKey.trim();
    const { prompt } = req.body;

    // --- MUDANÇA CRÍTICA AQUI ---
    // 1. Usando API 'v1' (Estável) em vez de 'v1beta'
    // 2. Usando o nome padrão 'gemini-1.5-flash'
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${cleanKey}`;
    
    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error("Erro do Google:", JSON.stringify(data));
      // Se der erro de modelo, tentamos o fallback automático para o 1.0 Pro
      if (data.error?.code === 404) {
         throw new Error("Modelo 1.5 Flash indisponível na sua conta. Tente criar uma nova chave no Google AI Studio.");
      }
      throw new Error(data.error?.message || "Erro na resposta da IA");
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("A IA processou mas não retornou texto.");

    res.status(200).json({ text });

  } catch (error) {
    console.error("Erro Fatal no Backend:", error);
    res.status(500).json({ error: error.message });
  }
};
