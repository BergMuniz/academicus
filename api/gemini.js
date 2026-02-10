const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // 1. Configurações de Segurança (CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. Responde rápido se for apenas uma verificação do navegador
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 3. Pega a chave do Vercel
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Chave GEMINI_API_KEY não encontrada no Vercel.");
    }

    // 4. Conecta no Google
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 5. Recebe o pedido do site
    const { prompt } = req.body;
    
    // 6. Gera a resposta
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 7. Envia de volta para o site
    res.status(200).json({ text });

  } catch (error) {
    console.error("Erro no Backend:", error);
    res.status(500).json({ error: error.message || "Erro interno na API" });
  }
};
