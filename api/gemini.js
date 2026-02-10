const { GoogleGenAI } = require("@google/genai");

export default async function handler(request, response) {
  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const { prompt } = JSON.parse(request.body);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return response.status(200).json({ text });
  } catch (error) {
    return response.status(500).json({ error: "Erro na comunicação com a IA." });
  }
}
