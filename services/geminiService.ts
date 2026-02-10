import { GoogleGenAI } from "@google/genai";
import { GenerationRequest } from "../types";
import { SYSTEM_INSTRUCTION, PROMPT_TEMPLATES } from "../constants";

// The API key is injected via window.process.env in index.html
const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const generateExamQuestion = async (request: GenerationRequest): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key not found. Please check your configuration.");
  }

  const promptGenerator = PROMPT_TEMPLATES[request.type];
  if (!promptGenerator) {
    throw new Error("Invalid question type.");
  }

  const prompt = promptGenerator(request.course, request.content, {
    multipleRange: request.multipleRange,
    bloomLevel: request.bloomLevel,
    difficulty: request.difficulty,
    correctAlternative: request.correctAlternative,
    quantity: request.quantity,
    learningObjective: request.learningObjective
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
    });

    if (!response.text) {
        throw new Error("No content generated.");
    }
    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate question.");
  }
};

export const auditQuestion = async (input: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key not found.");
  }

  const auditorPrompt = `
Role: Especialista em Psicometria INEP/ENADE.
Task: Analise as questões abaixo. Gere Relatório de Auditoria Técnica.
Critérios: Anatomia, Bloom, Distratores, Viés.

Questões:
${input}

Saída Markdown para CADA questão:
## 📋 Relatório de Auditoria Técnica - Questão [N]
**Veredito:** [Status]
**1. Análise da Estrutura:** [Detalhes]
**2. Análise Pedagógica:** [Detalhes]
**3. Pontos de Atenção:** [Detalhes]
**💡 Sugestão:** [Texto]
Separe com ---
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: auditorPrompt,
      config: {
        temperature: 0.2,
      },
    });

    if (!response.text) {
        throw new Error("No audit generated.");
    }
    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to audit question.");
  }
};