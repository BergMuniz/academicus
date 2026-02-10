const { GoogleGenAI } = require("@google/genai");

exports.handler = async (event) => {
  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const { prompt } = JSON.parse(event.body);
    const result = await model.generateContent(prompt);
    return {
      statusCode: 200,
      body: JSON.stringify({ text: result.response.text() }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: "Erro na IA" }) };
  }
};
