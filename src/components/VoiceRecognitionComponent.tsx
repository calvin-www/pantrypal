import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { db, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { Button, Loader } from '@mantine/core';

interface VoiceRecognitionComponentProps {
    onClose: () => void;
}

const VoiceRecognitionComponent: React.FC<VoiceRecognitionComponentProps> = ({ onClose }) => {
    const [isListening, setIsListening] = useState(true);
    const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

    useEffect(() => {
        if (!browserSupportsSpeechRecognition) {
            console.error("Browser doesn't support speech recognition.");
            return;
        }

        SpeechRecognition.startListening({ continuous: true })
            .then(() => {
                console.log("Listening started");
                setIsListening(true);
            })
            .catch((error) => console.error("Error starting to listen:", error));

        return () => {
            SpeechRecognition.stopListening()
                .then(() => console.log("Listening stopped"))
                .catch((error) => console.error("Error stopping listening:", error));
        };
    }, [browserSupportsSpeechRecognition]);

    const handleUploadTranscript = async () => {
        if (transcript) {
            try {
                console.log('Starting transcript upload...');

                const storageRef = ref(storage, `transcripts/${Date.now()}.txt`);
                console.log('Uploading to storage...');
                await uploadString(storageRef, transcript);

                console.log('Getting download URL...');
                const downloadURL = await getDownloadURL(storageRef);

                console.log('Saving to Firestore...');
                await addDoc(collection(db, 'transcripts'), {
                    text: transcript,
                    url: downloadURL,
                    createdAt: new Date().toISOString()
                });

                console.log('Transcript uploaded successfully');
                resetTranscript();
                onClose();
            } catch (error) {
                console.error('Error uploading transcript:', error);
            }
        } else {
            console.log('No transcript to upload');
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            {isListening && (
                <div className="flex items-center space-x-2">
                    <Loader size="sm" />
                    <span>Listening...</span>
                </div>
            )}
            <p className="text-center">{transcript}</p>
            <Button onClick={handleUploadTranscript} disabled={!transcript}>
                Upload Transcript
            </Button>
        </div>
    );
};

export default VoiceRecognitionComponent;