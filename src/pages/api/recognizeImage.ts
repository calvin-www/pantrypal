import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import NodeCache from 'node-cache';
import sharp from 'sharp';

const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { imageUrl } = req.body;

  try {
    const [imageData, categories] = await Promise.all([
      fetchAndProcessImageData(imageUrl),
      getCachedCategories()
    ]);

    const imagePart: Part = createImagePart(imageData);
    const prompt = generatePrompt(categories);

    const result = await Promise.race([
      model.generateContent([prompt, imagePart]),
      new Promise((_, reject) => setTimeout(() => reject(new Error('API Timeout')), 30000))
    ]);

    const text = await (result as any).response.text();
    const recognizedItems = parseResponse(text);

    res.status(200).json({ recognizedItems });
  } catch (error) {
    console.error("Error recognizing items in image:", error);
    res.status(500).json({ error: 'Failed to process image' });
  }
}
async function getCachedCategories(): Promise<string> {
  if (typeof window !== 'undefined') {
    const localCategories = localStorage.getItem('categories');
    if (localCategories) {
      return JSON.parse(localCategories).map((cat: any) => cat.name).join(', ');
    }
  }

  const categoriesSnapshot = await getDocs(collection(db, 'categories'));
  const categories = categoriesSnapshot.docs.map(doc => doc.data().name).join(', ');
  return categories;
}

async function fetchAndProcessImageData(imageUrl: string): Promise<Buffer> {
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  return sharp(Buffer.from(arrayBuffer))
      .resize(800) // Resize to max width of 800px
      .jpeg({ quality: 80 }) // Compress as JPEG
      .toBuffer();
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
  return `Identify food items in the image. For each:
- Name
- Estimated quantity (number only)
- Categories from: ${categories} (if none fit, generate new categories)

Format: {"name": "item", "amount": number, "categories": ["category1", "category2"]}
One JSON object per line, no extra text.`;
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