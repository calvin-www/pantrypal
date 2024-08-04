import { storage, db } from '../firebase';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { collection, getDocs } from 'firebase/firestore';
import { VertexAI, GenerateContentRequest } from '@google-cloud/vertexai';

interface TranscriptData {
    text: string;
    url: string;
}

interface ProcessedData {
    images: string[];
    transcripts: string[];
}

export async function fetchImages(): Promise<string[]> {
    const images: string[] = [];
    try {
        const imagesRef = ref(storage, 'itemImages');
        const imagesList = await listAll(imagesRef);
        for (const imageRef of imagesList.items) {
            const url = await getDownloadURL(imageRef);
            images.push(url);
        }
        return images;
    } catch (error) {
        console.error('Error fetching images:', error);
        throw error;
    }
}

export async function fetchTranscripts(): Promise<string[]> {
    const transcripts: string[] = [];
    try {
        const transcriptsSnapshot = await getDocs(collection(db, 'transcripts'));
        transcriptsSnapshot.forEach((doc) => {
            const data = doc.data() as TranscriptData;
            transcripts.push(data.text);
        });
        return transcripts;
    } catch (error) {
        console.error('Error fetching transcripts:', error);
        throw error;
    }
}

export async function processDataForVertexAI(images: string[], transcripts: string[]): Promise<ProcessedData> {
    return {
        images: images,
        transcripts: transcripts
    };
}
const vertexAI = new VertexAI({project: 'expense-tracker-a8458', location: 'us-central1'});
export async function sendToVertexAI(data: ProcessedData): Promise<any> {
    try {
        const vertexAI = new VertexAI({project: 'expense-tracker-a8458', location: 'us-central1'});
        const model = vertexAI.preview.getGenerativeModel({model: 'gemini-1.0-pro'});

        const request: GenerateContentRequest = {
            contents: [{
                role: 'user',
                parts: [{ text: JSON.stringify(data) }]
            }]
        };

        const response = await model.generateContent(request);
        return response;
    } catch (error) {
        console.error('Error sending data to Vertex AI:', error);
        throw error;
    }
}

export async function analyzeItemsWithVertexAI(): Promise<any> {
    try {
        const images = await fetchImages();
        const transcripts = await fetchTranscripts();
        const processedData = await processDataForVertexAI(images, transcripts);
        const vertexAIResponse = await sendToVertexAI(processedData);

        console.log('Vertex AI Response:', vertexAIResponse);
        return vertexAIResponse;
    } catch (error) {
        console.error('Error analyzing items with Vertex AI:', error);
        throw error;
    }
}

export const generativeModel = vertexAI.preview.getGenerativeModel({model: 'gemini-1.5-flash'});
