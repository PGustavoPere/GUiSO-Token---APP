import { GoogleGenAI } from "@google/genai";
import fs from "fs";

async function generateImages() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const prompts = [
    {
      name: "comedor",
      text: "A warm, inviting community dining room in a modest neighborhood, people sharing a meal together, bright sunlight coming through windows, realistic style, cinematic lighting, high quality."
    },
    {
      name: "becas",
      text: "Children in a rural school setting, smiling, holding new school supplies like notebooks and pencils, bright and hopeful atmosphere, realistic style, cinematic lighting, high quality."
    },
    {
      name: "impact",
      text: "A close-up of hands holding a small plant sprouting from soil, representing growth and impact, soft natural lighting, realistic style, high quality."
    }
  ];

  for (const prompt of prompts) {
    console.log(`Generating ${prompt.name}...`);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt.text,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates![0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        fs.writeFileSync(`${prompt.name}.txt`, base64EncodeString);
        console.log(`Saved ${prompt.name}.txt`);
      }
    }
  }
}

generateImages().catch(console.error);
