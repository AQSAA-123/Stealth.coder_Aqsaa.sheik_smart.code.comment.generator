import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CommentResult, CommentStyle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const schema: Schema = {
  type: Type.OBJECT,
  properties: {
    comment: {
      type: Type.STRING,
      description: "The generated comment content. Do not include outer opening/closing comment delimiters (like /** or //).",
    },
    plausibilityScore: {
      type: Type.NUMBER,
      description: "A score from 0 to 100 indicating how plausible and high-quality this comment is according to standard coding practices.",
    },
    reasoning: {
      type: Type.STRING,
      description: "A brief explanation of why this comment was generated in this specific way.",
    },
  },
  required: ["comment", "plausibilityScore", "reasoning"],
};

export const generateCodeComment = async (
  code: string,
  language: string,
  style: CommentStyle
): Promise<CommentResult> => {
  try {
    const styleInstructions = {
        [CommentStyle.Concise]: "Generate a single, ultra-concise sentence summarizing the function's purpose. Focus on the 'what' and 'why'.",
        [CommentStyle.Detailed]: "Generate a detailed explanation. Include descriptions for parameters, return values, and briefly explain the internal logic or edge cases.",
        [CommentStyle.Docstring]: `Generate a formal documentation block content standard for ${language}. For JS/TS/Java use JSDoc/Javadoc format (lines starting with *). For Python use standard docstring format (Args/Returns sections). Do NOT include the outer delimiters (/** */ or \"\"\").`,
        [CommentStyle.Inline]: "Generate a short, informal explanation suitable for being placed directly above a complex line of code. Keep it conversational but professional."
    };

    const prompt = `
      You are an expert software engineer and documentation specialist.
      
      Task: Generate a ${style} comment for the provided ${language} function code.
      
      Instruction: ${styleInstructions[style]}
      
      Rules:
      1. Adhere strictly to the requested Style.
      2. For 'Docstring', format the internal content correctly (e.g., @param for JSDoc), but exclude the enclosing syntax.
      3. For 'Concise' or 'Inline', do not use bullet points, just plain text.
      4. Assess your own confidence/plausibility score (0-100) based on how well-formed the function is and how accurate your summary is.
      
      Code Input:
      \`\`\`${language}
      ${code}
      \`\`\`
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.2, // Low temperature for deterministic, concise results
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("No response text received from Gemini.");
    }

    const result = JSON.parse(text) as CommentResult;
    return result;
  } catch (error) {
    console.error("Error generating comment:", error);
    throw error;
  }
};