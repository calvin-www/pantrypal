import { collection, addDoc } from 'firebase/firestore';
import { Button, Loader } from '@mantine/core';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { OperationSummary } from './OperationSummary';
import { generativeModel } from '../utils/vertexAI';

interface VoiceRecognitionComponentProps {
  onClose: () => void;
}

interface DatabaseOperation {
  type: 'add' | 'remove' | 'update';
  item: string;
  quantity?: number;
  action?: string;
}

const VoiceRecognitionComponent: React.FC<VoiceRecognitionComponentProps> = ({ onClose }) => {
  const [isListening, setIsListening] = useState(true);
  const [aiInterpretation, setAIInterpretation] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [operations, setOperations] = useState<DatabaseOperation[]>([]);
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
    console.log('Transcript to interpret:', transcript);
    try {
      const response = await fetch('/api/interpretTranscript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });
      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);
      if (data.interpretedOperations) {
        console.log('Interpreted operations:', data.interpretedOperations);
        setOperations(data.interpretedOperations);
        setAIInterpretation(JSON.stringify(data.interpretedOperations));
        setShowConfirmation(true);
      } else {
        console.error('No valid content in the response');
      }
    } catch (error) {
      console.error('Error interpreting transcript:', error);
    }
  } else {
    console.log('No transcript to interpret');
  }
};

  const handleConfirmOperations = async () => {
    for (const operation of operations) {
      try {
        switch (operation.type) {
          case 'add':
            await addDoc(collection(db, 'pantryItems'), {
              name: operation.item,
              quantity: operation.quantity || 1,
              createdAt: new Date().toISOString()
            });
            break;
          case 'remove':
            // Implement remove logic
            break;
          case 'update':
            // Implement update logic
            break;
        }
      } catch (error) {
        console.error(`Error performing operation: ${operation.type}`, error);
      }
    }
    resetTranscript();
    onClose();
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
        <Button onClick={handleInterpretTranscript} disabled={!transcript}>
          Interpret Voice Command
        </Button>
        {showConfirmation && (
            <OperationSummary
                operations={operations}
                onConfirm={handleConfirmOperations}
                onCancel={() => setShowConfirmation(false)}
            />
        )}
      </div>
  );
};

export default VoiceRecognitionComponent;