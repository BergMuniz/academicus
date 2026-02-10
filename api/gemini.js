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

    // --- PASSO 1: AUTO-DESCOBERTA DE MODELOS ---
    // Em vez de chutar um nome, perguntamos ao Google o que temos disponível.
    console.log("Consultando lista de modelos disponíveis...");
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`;
    
    const listResp = await fetch(listUrl);
    const listData = await listResp.json();

    if (!listResp.ok) {
        throw new Error(`Erro ao listar modelos: ${listData.error?.message || 'Erro desconhecido'}`);
    }

    // Filtra apenas modelos que sabem "gerar conteúdo" (generateContent)
    const availableModels = listData.models.filter(m => 
        m.supportedGenerationMethods && 
        m.supportedGenerationMethods.includes("generateContent")
    );

    if (availableModels.length === 0) {
        throw new Error("Sua chave é válida, mas não tem acesso a nenhum modelo de texto.");
    }

    // Tenta encontrar um modelo 'Flash' ou 'Pro', ou pega o primeiro que tiver
    let selectedModel = availableModels.find(m => m.name.includes("flash")); // Tenta Flash
    if (!selectedModel) selectedModel = availableModels.find(m => m.name.includes("pro")); // Tenta Pro
    if (!selectedModel) selectedModel = availableModels[0]; // Pega o que tiver

    console.log(`Modelo escolhido automaticamente: ${selectedModel.name}`);

    // --- PASSO 2: GERAÇÃO COM O MODELO ESCOLHIDO ---
    // O nome do modelo já vem completo (ex: models/gemini-1.5-flash-001)
    const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${selectedModel.name}:generateContent?key=${cleanKey}`;

    const googleResponse = await fetch(generateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error(`Erro no modelo ${selectedModel.name}:`, JSON.stringify(data));
      throw new Error(data.error?.message || "Erro na resposta da IA");
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("A IA respondeu mas o texto veio vazio.");

    res.status(200).json({ text });

  } catch (error) {
    console.error("Erro Fatal no Backend:", error);
    // Envia o erro detalhado para aparecer no seu navegador
    res.status(500).json({ error: error.message });
  }
};
