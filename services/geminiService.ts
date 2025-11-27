
import { GoogleGenAI, Type } from "@google/genai";
import { StoryContent, Language, NearbyInfo, DietaryPlaces } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for the structured text response
const storySchema = {
  type: Type.OBJECT,
  properties: {
    location: { type: Type.STRING },
    emotion: { type: Type.STRING },
    history: { type: Type.STRING, description: "Summarized historical facts used for the content." },
    contentType: { type: Type.STRING, description: "e.g., Documentary, Immersive Exhibition, Webtoon, Play" },
    contentTitle: { type: Type.STRING },
    targetAudience: { type: Type.STRING },
    plot: { type: Type.STRING, description: "Detailed content structure or plot summary." },
    effect: { type: Type.STRING, description: "Expected emotional or cultural effect." },
    consolationMessage: { type: Type.STRING, description: "A message validating the user's emotion connected to the history." },
    posterSlogan: { type: Type.STRING, description: "Short, punchy, witty slogan in 'Nano Banana' style (under 20 chars)." },
    visualPrompt: { type: Type.STRING, description: "A detailed visual description to generate a watercolor painting. MUST BE IN ENGLISH." },
  },
  required: ["location", "emotion", "history", "contentType", "contentTitle", "targetAudience", "plot", "effect", "consolationMessage", "posterSlogan", "visualPrompt"],
};

// Schema for Nearby Info
const nearbySchema = {
  type: Type.OBJECT,
  properties: {
    restaurants: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          description: { type: Type.STRING },
          price: { type: Type.STRING, description: "Price range or average price if available" },
        },
        required: ["name", "category", "description"]
      }
    },
    accommodations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          description: { type: Type.STRING },
          price: { type: Type.STRING, description: "Price per night (approximate)" },
        },
        required: ["name", "category", "description"]
      }
    },
    attractions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          description: { type: Type.STRING },
          price: { type: Type.STRING, description: "Ticket price if applicable" },
        },
        required: ["name", "category", "description"]
      }
    }
  },
  required: ["restaurants", "accommodations", "attractions"]
};

// Schema for Dietary Places
const dietarySchema = {
  type: Type.OBJECT,
  properties: {
    vegan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          description: { type: Type.STRING },
          price: { type: Type.STRING },
          url: { type: Type.STRING, description: "Website URL or Google Maps Link if available" },
        },
        required: ["name", "category", "description"]
      }
    },
    halal: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          description: { type: Type.STRING },
          price: { type: Type.STRING },
          url: { type: Type.STRING, description: "Website URL or Google Maps Link if available" },
        },
        required: ["name", "category", "description"]
      }
    },
    kosher: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          description: { type: Type.STRING },
          price: { type: Type.STRING },
          url: { type: Type.STRING, description: "Website URL or Google Maps Link if available" },
        },
        required: ["name", "category", "description"]
      }
    }
  },
  required: ["vegan", "halal", "kosher"]
};

// Helper to get full language name for prompts
const getLanguageName = (lang: Language): string => {
  const map: Record<Language, string> = {
    en: 'English',
    ko: 'Korean',
    ja: 'Japanese',
    zh: 'Chinese',
    ru: 'Russian',
    fr: 'French',
    ar: 'Arabic',
    he: 'Hebrew',
    fa: 'Persian',
  };
  return map[lang] || 'English';
};

// Step 1: Search for History (Uses Tools, returns Text)
export const getHistoricalFact = async (location: string, language: Language): Promise<string> => {
  const langName = getLanguageName(language);
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find verified historical facts about "${location}" in Busan, South Korea. Summarize the key historical events, origins, and cultural significance in ${langName}. Focus on facts that can evoke emotions.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return response.text || "Could not find specific historical records for this location.";
  } catch (error) {
    console.error("History Search Error:", error);
    throw new Error("Error occurred while searching for history.");
  }
};

// Step 2: Plan Content (Uses Schema, returns JSON)
export const planContent = async (location: string, emotion: string, history: string, language: Language): Promise<StoryContent> => {
  const langName = getLanguageName(language);
  try {
    const prompt = `
      You are a "Busan Historical Storytelling Cultural Content Planner".
      
      [INPUTS]
      Location: ${location}
      Emotion: ${emotion}
      History Context: ${history}
      Target Language: ${langName}

      [TASK]
      Create a cultural content plan that connects the history of the location with the user's emotion.
      
      [NANO BANANA STYLE GUIDE]
      - Tone: Witty, Concise, Punchy, Trendy.
      - Visuals: High Contrast, Pop Art, Bold Colors, but here we will create a Watercolor style description.
      - Slogan: Must be short, impactful, and touch the heart or make the user chuckle.
      
      [REQUIREMENTS]
      1. Develop a content title and type (exhibition, play, etc.) in ${langName}.
      2. Write a synopsis (plot) linking the history and emotion in ${langName}.
      3. Write a consolation message to the user in ${langName}.
      4. Create a 'posterSlogan' in Nano Banana style in ${langName}.
      5. Write a 'visualPrompt' for an image generator. **IMPORTANT: The visualPrompt MUST be written in ENGLISH**, to ensure the image generator understands it best. It should describe a beautiful watercolor painting scene.

      Output strictly in JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: storySchema,
      },
    });

    if (!response.text) {
      throw new Error("No planning response generated.");
    }

    return JSON.parse(response.text) as StoryContent;
  } catch (error) {
    console.error("Content Planning Error:", error);
    throw new Error("Error occurred while planning content.");
  }
};

// Step 3a: Generate Watercolor Art (Artistic)
export const generateWatercolorImage = async (visualPrompt: string): Promise<string | undefined> => {
  try {
    const stylePrompt = `
      Create a soft, artistic watercolor painting.
      Style definition: Wet-on-wet technique, pastel tones, dreamy, emotional, hand-painted texture on paper.
      
      Subject: ${visualPrompt}
      
      The image should evoke the feeling of memory and history.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: stylePrompt }],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error) {
    console.error("Watercolor Gen Error:", error);
    return undefined;
  }
};

// Step 3b: Generate Realistic Landscape Image
export const generateLandscapeImage = async (location: string): Promise<string | undefined> => {
  try {
    const prompt = `
      Take a photorealistic, high-resolution travel photography shot of "${location}" in Busan, South Korea.
      It should look like a real photo taken by a professional photographer.
      Daytime, clear weather, wide angle, capturing the essence of the location.
      No text, no filters, just the pure scenery.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error) {
    console.error("Landscape Gen Error:", error);
    return undefined;
  }
};

// Step 4: Get Nearby Places & Prices (Uses Tools then Schema)
export const getNearbyPlaces = async (location: string, language: Language): Promise<NearbyInfo> => {
  const langName = getLanguageName(language);
  try {
    // 1. Search for data first
    const searchPrompt = `
      Find recommended places near "${location}" in Busan, South Korea.
      I need 3 of each:
      1. Popular Restaurants/Cafes.
      2. Accommodations (Hotels/Motels/Guesthouses). **Crucial: Find approximate price per night for these.**
      3. Other Tourist Attractions or things to do.
      
      Return detailed information in ${langName}.
    `;
    
    const searchResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: searchPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const searchResultText = searchResponse.text || "No specific places found.";

    // 2. Format into JSON
    const formatPrompt = `
      Extract nearby place information from the text below and format it into JSON.
      Language: ${langName}.
      
      [Source Text]
      ${searchResultText}
      
      Requirements:
      - restaurants: 3 items
      - accommodations: 3 items. **Make sure to fill the 'price' field if mentioned (e.g., "approx $50" or "약 50,000원"). If unknown, indicate it in ${langName}.**
      - attractions: 3 items
    `;

    const formatResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formatPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: nearbySchema,
      },
    });

    if (!formatResponse.text) {
      throw new Error("Failed to format nearby info.");
    }

    return JSON.parse(formatResponse.text) as NearbyInfo;

  } catch (error) {
    console.error("Nearby Places Error:", error);
    return { restaurants: [], accommodations: [], attractions: [] };
  }
};

// Step 5: Get Special Dietary Places (Vegan, Halal, Kosher)
export const getDietaryPlaces = async (location: string, language: Language): Promise<DietaryPlaces> => {
  const langName = getLanguageName(language);
  try {
    const searchPrompt = `
      Find Vegan, Halal, and Kosher options near "${location}" in Busan, South Korea.
      Include both Restaurants and Grocery Stores/Marts.
      If specific places are not found near the immediate location, find the closest ones in Busan.
      
      Return detailed information in ${langName}.
    `;

    const searchResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: searchPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const searchResultText = searchResponse.text || "No specific dietary places found.";

    const formatPrompt = `
      Extract dietary place information from the text below and format it into JSON.
      Language: ${langName}.
      
      [Source Text]
      ${searchResultText}
      
      Requirements:
      - vegan: list of Vegan restaurants or groceries found (max 3)
      - halal: list of Halal restaurants or groceries found (max 3)
      - kosher: list of Kosher restaurants or groceries found (max 3)
      - **Include the website URL or Google Maps link in the 'url' field if available.**
      
      If none found for a category, return an empty array.
    `;

    const formatResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formatPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: dietarySchema,
      },
    });

    if (!formatResponse.text) {
      throw new Error("Failed to format dietary info.");
    }

    return JSON.parse(formatResponse.text) as DietaryPlaces;
  } catch (error) {
    console.error("Dietary Places Error:", error);
    return { vegan: [], halal: [], kosher: [] };
  }
};
