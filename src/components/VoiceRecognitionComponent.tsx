import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { db, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { Button } from '@mantine/core';

interface VoiceRecognitionComponentProps {
    onClose: () => void;
}

const VoiceRecognitionComponent: React.FC<VoiceRecognitionComponentProps> = ({ onClose }) => {
    const [isListening, setIsListening] = useState(false);
    const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

    useEffect(() => {
        if (!browserSupportsSpeechRecognition) {
            console.error("Browser doesn't support speech recognition.");
        }
    }, [browserSupportsSpeechRecognition]);

    const startListening = () => {
        setIsListening(true);
        SpeechRecognition.startListening({ continuous: true })
            .then(() => console.log("Listening started"))
            .catch((error) => console.error("Error starting to listen:", error));
    };

    const stopListening = () => {
        setIsListening(false);
        SpeechRecognition.stopListening()
            .then(() => console.log("Listening stopped"))
            .catch((error) => console.error("Error stopping listening:", error));
    };

    const handleUploadTranscript = async () => {
        if (transcript) {
            try {
                console.log('Starting transcript upload...');

                // Upload transcript to Firebase Storage
                const storageRef = ref(storage, `transcripts/${Date.now()}.txt`);
                console.log('Uploading to storage...');
                await uploadString(storageRef, transcript);

                console.log('Getting download URL...');
                const downloadURL = await getDownloadURL(storageRef);

                // Save reference to Firestore
                console.log('Saving to Firestore...');
                await addDoc(collection(db, 'transcripts'), {
                    text: transcript,
                    url: downloadURL,
                    createdAt: new Date().toISOString()
                });

                console.log('Transcript uploaded successfully');
                resetTranscript();
                onClose(); // Close the modal after successful upload
            } catch (error) {
                console.error('Error uploading transcript:', error);
                // You might want to show an error message to the user here
            }
        } else {
            console.log('No transcript to upload');
        }
    };
    return (
        <div>
            <Button onClick={isListening ? stopListening : startListening}>
                {isListening ? 'Stop Listening' : 'Start Listening'}
            </Button>
            <p>{transcript}</p>
            <Button onClick={handleUploadTranscript} disabled={!transcript}>
                Upload Transcript
            </Button>
        </div>
    );
};

export default VoiceRecognitionComponent;