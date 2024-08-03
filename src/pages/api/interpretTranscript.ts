import { NextApiRequest, NextApiResponse } from 'next';
import { generativeModel } from '../../utils/vertexAI';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { transcript } = req.body;
    console.log('Received transcript:', transcript);
    try {
      console.log('Sending transcript to Gemini...');
      const result = await generativeModel.generateContent(
        `Interpret the following voice command for a pantry tracking app and return a JSON array of operations: "${transcript}"`
      );

      console.log('Received response from Gemini');
      if (result.response?.candidates?.[0]?.content) {
        const content = result.response.candidates[0].content;
        console.log('Raw Gemini response:', content);
        res.status(200).json({ rawResponse: content });
      } else {
        console.error('No valid content in the response');
        res.status(400).json({ error: 'No valid content in the response' });
      }
    } catch (error) {
      console.error('Error interpreting transcript:', error);
      res.status(500).json({ error: 'Error interpreting transcript' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}