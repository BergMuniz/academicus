import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. Configuração de CORS (Permite que o site fale com o backend)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Tratamento da pré-requisição do navegador
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 2. Verifica se a chave existe no Vercel
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('A variável GEMINI_API_KEY não está configurada no Vercel Settings.');
    }

    // 3. Configura a IA
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 4. Recebe o prompt do site
    const { prompt } = req.body;

    // 5. Gera o conteúdo
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 6. Devolve a resposta
    res.status(200).json({ text });

  } catch (error) {
    console.error("Erro detalhado do Backend:", error);
    // Devolve o erro exato para aparecer no seu navegador
    res.status(500).json({ error: error.message || "Erro interno na API" });
  }
}
