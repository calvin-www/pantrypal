import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
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

    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categories = categoriesSnapshot.docs.map(doc => doc.data());
    const categoryNames = categories.map((cat: any) => cat.name).join(', ');
    // Generate content based on the image and categories
    const result = await model.generateContent([
      `Analyze the image and identify food items. For each item, provide:
1. Name of the item
2. Estimated quantity as a number (no units)
3. Applicable categories from this list: ${categoryNames}, if none are applicable generate new ones.

Format each item as a valid JSON object on a single line:
{"name": "item name", "amount": number, "categories": ["category1", "category2"]}

Return a list of these JSON objects, one per line, with no additional text or explanation.
Examples:
{"name": "banana", "amount": 2, "categories": ["fruits", "fresh"]}`,
      imagePart,
    ]);

    const generatedResponse = await result.response;
    const text = await generatedResponse.text();

// Parse the text response into a structured format
    const recognizedItems = text.split('\n').map((line: string) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        console.error("Error parsing line:", line);
        return null;
      }
    }).filter(item => item !== null);

    res.status(200).json({ recognizedItems });
  } catch (error) {
    console.error("Error recognizing items in image:", error);
    res.status(500).json({ error: 'Failed to process image' });
  }
}