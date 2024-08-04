// import { NextApiRequest, NextApiResponse } from 'next';
// import { GoogleGenerativeAI } from "@google/generative-ai";
// export const maxDuration = 20
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//
// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'POST') {
//     const { transcript } = req.body;
//     console.log('Received transcript:', transcript);
//     try {
//       console.log('Sending transcript to Gemini...');
//       const result = await model.generateContent(
//           `Interpret the following voice command for a pantry tracking app and return a JSON array of operations: "${transcript}"`
//       );
//
//       const response = await result.response;
//       const text = await response.text();
//
//       console.log('Raw Gemini response:', text);
//
//       // Clean and parse the response
//       const cleanedJson = text.replace(/```json\n|\n```/g, '').trim();
//       const parsedOperations = JSON.parse(cleanedJson);
//
//       res.status(200).json({ interpretedOperations: parsedOperations });
//     } catch (error) {
//       console.error('Error interpreting transcript:', error);
//       res.status(500).json({ error: 'Error interpreting transcript' });
//     }
//   } else {
//     res.status(405).end(); // Method Not Allowed
//   }
// }