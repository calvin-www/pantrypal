import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { imageUrl } = req.body;

  try {
    const [imageData, categories] = await Promise.all([
      fetchImageData(imageUrl),
      fetchCategories()
    ]);

    const imagePart: Part = createImagePart(imageData);
    const prompt = generatePrompt(categories);
    
    const result = await model.generateContent([prompt, imagePart]);
    const text = await result.response.text();

    const recognizedItems = parseResponse(text);

    res.status(200).json({ recognizedItems });
  } catch (error) {
    console.error("Error recognizing items in image:", error);
    res.status(500).json({ error: 'Failed to process image' });
  }
}

async function fetchImageData(imageUrl: string): Promise<ArrayBuffer> {
  const response = await fetch(imageUrl);
  return response.arrayBuffer();
}

async function fetchCategories(): Promise<string> {
  const categoriesSnapshot = await getDocs(collection(db, 'categories'));
  const categories = categoriesSnapshot.docs.map(doc => doc.data().name);
  return categories.join(', ');
}

function createImagePart(imageData: ArrayBuffer): Part {
  return {
    inlineData: {
      data: Buffer.from(imageData).toString('base64'),
      mimeType: 'image/jpeg',
    },
  };
}

function generatePrompt(categories: string): string {
  return `Analyze the image and identify food items. For each item, provide:
1. Name of the item
2. Estimated quantity as a number (no units)
3. Applicable categories from this list: ${categories}, if none are applicable generate new ones.

Format each item as a valid JSON object on a single line:
{"name": "item name", "amount": number, "categories": ["category1", "category2"]}

Return a list of these JSON objects, one per line, with no additional text or explanation.
Examples:
{"name": "banana", "amount": 2, "categories": ["fruits", "fresh"]}`;
}

function parseResponse(text: string): any[] {
  return text.split('\n')
    .map(line => {
      try {
        return JSON.parse(line);
      } catch (error) {
        console.error("Error parsing line:", line);
        return null;
      }
    })
    .filter(Boolean);
}