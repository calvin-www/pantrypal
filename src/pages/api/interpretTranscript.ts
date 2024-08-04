import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from "@google/generative-ai";
export const maxDuration = 20
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { transcript } = req.body;
    console.log('Received transcript:', transcript);
    try {
      console.log('Sending transcript to Gemini...');
      const prompt = `
Interpret the following transcript and extract operations (add, remove, or edit) for a pantry inventory system:
"${transcript}"

For each operation, provide:
- operation: "add", "remove", or "edit"
- item: name of the item
- quantity: number (positive for add, negative for remove)

Example output:
[
  {"operation": "add", "item": "apples", "quantity": 5},
  {"operation": "remove", "item": "bananas", "quantity": 2},
  {"operation": "edit", "item": "milk", "quantity": 1}
]
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();

      console.log('Raw Gemini response:', text);

      // Extract JSON array from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in the response');
      }

      const cleanedJson = jsonMatch[0].replace(/```json\n|\n```/g, '').trim();
      const interpretedOperations = JSON.parse(cleanedJson);

      res.status(200).json({ interpretedOperations });
    } catch (error) {
      console.error('Error interpreting transcript:', error);
      res.status(500).json({ error: 'Error interpreting transcript' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}