import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

const apiKey = process.env.API_KEY || ''; // In a real app, ensure this is set
const ai = new GoogleGenAI({ apiKey });

export const getStylistAdvice = async (
  userQuery: string,
  products: Product[],
  history: { role: string; content: string }[] = []
): Promise<string> => {
  if (!apiKey) {
    return "I'm sorry, I cannot provide advice at the moment (API Key missing). However, feel free to browse our collection!";
  }

  try {
    const productContext = products.map(p => `${p.name} (${p.category}) - $${p.price}`).join(', ');
    
    const systemInstruction = `You are "Sika", the expert fashion stylist for SIKAWOFIE COLLECTION. 
    The brand sells Sneakers, Tops, and Jeans. 
    Your goal is to help customers choose outfits from our inventory.
    
    Here is our current inventory list:
    ${productContext}

    1. Be friendly, stylish, and concise.
    2. Suggest specific products from our inventory by name if relevant.
    3. If the user asks about something we don't sell (like hats or watches), politely steer them back to our Sneakers, Tops, and Jeans.
    4. Keep responses under 100 words.
    `;

    const model = 'gemini-2.5-flash';
    
    const contents = [
      { role: 'user', parts: [{ text: systemInstruction }] }, // Prime the context
      ...history.map(h => ({ role: h.role === 'ai' ? 'model' : 'user', parts: [{ text: h.content }] })),
      { role: 'user', parts: [{ text: userQuery }] }
    ];

    // Note: In a production chat, we would use ai.chats.create for proper history management.
    // For this simple single-turn or simple accumulation implementation:
    const response = await ai.models.generateContent({
      model,
      contents: userQuery, 
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I'm thinking about the best look for you...";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having a little trouble connecting to the fashion mainframe. Please ask again in a moment.";
  }
};
