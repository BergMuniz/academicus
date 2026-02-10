import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  runtime: 'edge', // Usa o runtime mais rápido e moderno do Vercel
};

export default async function handler(req) {
  // 1. Configuração de CORS (Permite que seu site converse com o backend)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 2. Validação da Chave API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Chave de API (GEMINI_API_KEY) não configurada no Vercel.');
    }

    // 3. Processamento da Requisição
    const { prompt } = await req.json();
    
    // 4. Chamada à IA do Google
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. Resposta de Sucesso
    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error("Erro no Backend:", error);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno na IA' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
