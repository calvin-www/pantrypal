import { NextApiRequest, NextApiResponse } from 'next';
import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { imageUrl } = req.body;

  try {
    const [result] = await client.labelDetection(imageUrl);
    const labels = result.labelAnnotations;

    const recognizedItems = labels?.map(label => ({
      name: label.description,
      amount: '1',
      categories: []
    })) || [];

    res.status(200).json({ recognizedItems });
  } catch (error) {
    console.error("Error recognizing items in image:", error);
    res.status(500).json({ error: 'Failed to process image' });
  }
}