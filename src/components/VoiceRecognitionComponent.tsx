import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Button, Loader } from '@mantine/core';

interface VoiceRecognitionComponentProps {
    onClose: () => void;
}

const VoiceRecognitionComponent: React.FC<VoiceRecognitionComponentProps> = ({ onClose }) => {
    const [isListening, setIsListening] = useState(true);
    const [isInterpreting, setIsInterpreting] = useState(false);
    const [operations, setOperations] = useState<any[]>([]); // Add this line
    const [showConfirmation, setShowConfirmation] = useState(false); // Add this line
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

    const handleInterpretTranscript = async () => {
        if (transcript) {
            try {
                setIsInterpreting(true);
                console.log('Sending transcript for interpretation...');
                const response = await fetch('/api/interpretTranscript', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ transcript }),
                });

                if (!response.ok) {
                    console.error('Failed to interpret transcript');
                    return;
                }

                const data = await response.json();
                console.log('Interpreted data:', data);
                if (data.interpretedOperations) {
                    console.log('Interpreted operations:', data.interpretedOperations);
                    setOperations(JSON.parse(data.interpretedOperations));
                    setShowConfirmation(true);
                } else {
                    console.error('No valid content in the response');
                }
            } catch (error) {
                console.error('Error interpreting transcript:', error);
            } finally {
                setIsInterpreting(false);
            }
        } else {
            console.log('No transcript to interpret');
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            {!browserSupportsSpeechRecognition ? (
                <p className="text-center text-red-500">
                    Sorry, your browser is not supported. Please try using Chrome or Safari!
                </p>
            ) : isListening ? (
                <div className="flex items-center space-x-2">
                    <Loader size="sm" />
                    <span>Listening...</span>
                </div>
            ) : null}
            <p className="text-center">{transcript}</p>
            <Button onClick={handleInterpretTranscript} disabled={!transcript || isInterpreting}>
                {isInterpreting ? 'Interpreting...' : 'Interpret Transcript'}
            </Button>
            {showConfirmation && (
                <div className="confirmation-message">
                    Interpretation complete! {operations.length} operations found.
                </div>
            )}
        </div>
    );
};

export default VoiceRecognitionComponent;