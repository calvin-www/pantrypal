import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import sharp from 'sharp';

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

    const compressedImageBuffer = await sharp(Buffer.from(imageData))
        .resize({ width: 1024, height: 1024, fit: 'inside' })
        .jpeg({ quality: 85 })
        .toBuffer();

    const imagePart: Part = {
      inlineData: {
        data: compressedImageBuffer.toString('base64'),
        mimeType: 'image/jpeg',
      },
    };

    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categories = categoriesSnapshot.docs.map(doc => doc.data());
    const categoryNames = categories.map((cat: any) => cat.name).join(', ');
    // Generate content based on the image and categories
//     const result = await model.generateContent([
//       `Analyze the image and identify food items. For each item, provide:
// 1. Name of the item
// 2. Estimated quantity as a number (no units)
// 3. Applicable categories from this list: ${categoryNames}, if none are applicable generate new ones.
//
// Format each item as a valid JSON object on a single line:
// {"name": "item name", "amount": number, "categories": ["category1", "category2"]}
//
// Return a list of these JSON objects, one per line, with no additional text or explanation.
// Example:
// {"name": "banana", "amount": 2, "categories": ["fruits", "fresh"]}
// `,
//       imagePart,
//     ]);

const result = await model.generateContentStream([
  `Analyze the image and identify food items. For each item, provide:
1. Name of the item
2. Estimated quantity as a number (no units)
3. Applicable categories from this list: ${categoryNames}, if none are applicable generate new ones.

Format each item as a valid JSON object on a single line:
{"name": "item name", "amount": number, "categories": ["category1", "category2"]}

Return a list of these JSON objects, one per line, with no additional text or explanation.
Example:
{"name": "banana", "amount": 2, "categories": ["fruits", "fresh"]}
`,
  imagePart,
]);

let recognizedItems = [];
for await (const chunk of result.stream) {
  const chunkText = await chunk.text();
  const items = chunkText.split('\n')
    .map(line => {
      try {
        return JSON.parse(line);
      } catch (error) {
        return null;
      }
    })
    .filter(item => item !== null);
  recognizedItems.push(...items);
}
    res.status(200).json({ recognizedItems });
  } catch (error) {
    console.error("Error recognizing items in image:", error);
    res.status(500).json({ error: 'Failed to process image' });
  }
}