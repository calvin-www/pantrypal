import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, Part } from "@google/generative-ai";

// Initialize the Gemini model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { imageUrl } = req.body;

  try {
    // Fetch the image data
    const imageResponse = await fetch(imageUrl);
    const imageData = await imageResponse.arrayBuffer();

    // Create a part for the image
    const imagePart: Part = {
      inlineData: {
        data: Buffer.from(imageData).toString('base64'),
        mimeType: imageResponse.headers.get('content-type') || 'image/jpeg',
      },
    };

    // Generate content based on the image
    const result = await model.generateContent([
      "Identify and list the food items in this image. For each item, provide its name and an estimated quantity.",
      imagePart,
    ]);

    const generatedResponse = await result.response;
    const text = await generatedResponse.text();

    // Parse the text response into a structured format
    const recognizedItems = text.split('\n').map((line: string) => {
      const [name, amount] = line.split(':');
      return { name: name.trim(), amount: amount ? amount.trim() : '1', categories: [] };
    });

    res.status(200).json({ recognizedItems });
  } catch (error) {
    console.error("Error recognizing items in image:", error);
    res.status(500).json({ error: 'Failed to process image' });
  }
}