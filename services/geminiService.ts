import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MEMOIR_DIRECTOR_SYSTEM_PROMPT, TRANSCRIPTION_PROMPT } from "../constants";
import { ScriptResponse } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing");
  return new GoogleGenAI({ apiKey });
};

export const transcribeAudio = async (
  audioBase64: string,
  mimeType: string
): Promise<string> => {
  const client = getClient();
  
  // Using flash for fast and accurate audio understanding
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: audioBase64,
          },
        },
        {
          text: TRANSCRIPTION_PROMPT,
        },
      ],
    },
  });

  return response.text || "Transcription failed.";
};

export const generateVideoScript = async (
  transcription: string,
  isRetry: boolean = false
): Promise<ScriptResponse> => {
  const client = getClient();

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "A poetic title for the video memoir",
      },
      scenes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sceneNumber: { type: Type.INTEGER },
            duration: { type: Type.STRING, description: "e.g., '5s'" },
            visual: { type: Type.STRING, description: "Detailed visual description" },
            voiceover: { type: Type.STRING, description: "First person narration text. If original is not Chinese, include Chinese translation." },
            mood: { type: Type.STRING, description: "Emotion or production note" },
          },
          required: ["sceneNumber", "duration", "visual", "voiceover", "mood"],
        },
      },
    },
    required: ["title", "scenes"],
  };

  // Using pro-preview for better creative writing and reasoning
  const response = await client.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `
    TRANSCRIPT (May contain multiple source files):
    ${transcription}
    
    INSTRUCTION:
    Based on the transcript above, generate a 3-minute video memoir script.
    If multiple sources are provided, integrate them into a single cohesive narrative.
    
    ${isRetry ? "IMPORTANT: The user wants a different version. Please change the narrative style, pacing, or emotional focus significantly from a standard documentary style. Try to be more creative." : ""}

    LANGUAGE REQUIREMENT:
    1. The 'voiceover' must be in the first person ("I").
    2. If the generated voiceover is NOT in Simplified Chinese (e.g., it is in English, Japanese, Dialect), you MUST append the Simplified Chinese translation immediately below it within the same string.
       Format: 
       [Original Language Text]
       (Translation: [Simplified Chinese Text])

    Follow the system instructions strictly.
    Output JSON.
    `,
    config: {
      systemInstruction: MEMOIR_DIRECTOR_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: schema,
      // Give it some thinking room to structure the story arc
      thinkingConfig: { thinkingBudget: 2048 },
    },
  });

  if (response.text) {
    return JSON.parse(response.text) as ScriptResponse;
  }
  
  throw new Error("Failed to generate script");
};