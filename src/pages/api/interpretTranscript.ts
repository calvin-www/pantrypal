import { NextApiRequest, NextApiResponse } from 'next';
import { generativeModel } from '../../utils/vertexAI';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { transcript } = req.body;
    try {
      const result = await generativeModel.generateContent(
        `Interpret the following voice command for a pantry tracking app and return a JSON array of operations: "${transcript}"`
      );
      if (result.response?.candidates?.[0]?.content) {
        const content = result.response.candidates[0].content;
        if (typeof content === 'string') {
          const interpretedOperations = JSON.parse(content);
          res.status(200).json({ interpretedOperations });
        } else {
          res.status(400).json({ error: 'Content is not a string' });
        }
      } else {
        res.status(400).json({ error: 'No valid content in the response' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error interpreting transcript' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}