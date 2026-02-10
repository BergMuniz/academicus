const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // 1. Configuração CORS (Permite conexão)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. Pré-conexão (Ping)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 3. Verificação e Limpeza da Chave
    const rawKey = process.env.GEMINI_API_KEY;
    if (!rawKey) {
      throw new Error("ERRO CRÍTICO: Variável GEMINI_API_KEY não encontrada no Vercel.");
    }
    
    // .trim() remove espaços vazios ou 'enters' acidentais no início/fim
    const apiKey = rawKey.trim(); 

    // 4. Conexão com Google
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 5. Execução
    const { prompt } = req.body;
    if (!prompt) throw new Error("O Prompt chegou vazio no backend.");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ text });

  } catch (error) {
    // ISSO VAI MOSTRAR O ERRO REAL NO LOG DO VERCEL
    console.error("ALERTA DE ERRO NO BACKEND:", error);
    
    res.status(500).json({ 
      error: "Erro no processamento da IA.", 
      details: error.message // Envia o detalhe para o seu navegador
    });
  }
};
