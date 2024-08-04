import React, { useState, useEffect } from 'react';
import { Button, Table, Select, Badge, ActionIcon } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import EditModal from "./EditModal";
import { db } from '../firebase';
import { doc, addDoc, updateDoc, deleteDoc, collection, DocumentReference, Firestore } from 'firebase/firestore';

interface Operation {
    type: 'add' | 'delete' | 'edit';
    item: {
        name: string;
        amount: string;
        categories: { name: string; color: string }[];
    };
}

const VoiceRecognitionComponent: React.FC = () => {
    const { transcript, listening, resetTranscript } = useSpeechRecognition();
    const [isListening, setIsListening] = useState(false);
    const [isInterpreting, setIsInterpreting] = useState(false);
    const [operations, setOperations] = useState<Operation[]>([]);

    useEffect(() => {
        if (listening !== isListening) {
            setIsListening(listening);
        }
    }, [listening]);

    const handleInterpretTranscript = async () => {
        if (transcript) {
            try {
                setIsInterpreting(true);
                SpeechRecognition.stopListening();
                setIsListening(false);
                
                // Simulating API call for interpretation
                const interpretedOperations: Operation[] = [
                    { type: 'add', item: { name: 'Apples', amount: '5', categories: [{ name: 'Fruit', color: 'green' }] } },
                    { type: 'delete', item: { name: 'Bananas', amount: '3', categories: [{ name: 'Fruit', color: 'yellow' }] } },
                ];
                setOperations(interpretedOperations);
            } catch (error) {
                console.error('Error interpreting transcript:', error);
            } finally {
                setIsInterpreting(false);
            }
        }
    };

    const handleOperationTypeChange = (index: number, value: 'add' | 'delete' | 'edit') => {
        const updatedOperations = [...operations];
        updatedOperations[index].type = value;
        setOperations(updatedOperations);
    };

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Operation | null>(null);

    const handleEdit = (index: number) => {
        setEditingItem(operations[index]);
        setEditModalOpen(true);
    };
    const handleSave = async (updatedItem: Operation["item"]): Promise<void> => {
        setOperations(currentOperations =>
            currentOperations.map((operation, idx) =>
                idx === operations.indexOf(editingItem!)
                    ? { ...operation, item: updatedItem }
                    : operation
            )
        );
        setEditModalOpen(false);
    };
    
    const handleDelete = (index: number) => {
        const updatedOperations = operations.filter((_, i) => i !== index);
        setOperations(updatedOperations);
    };

    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            for (const operation of operations) {
                const { type, item } = operation;
                switch (type) {
                    case 'add':
                        await addDoc(collection(db, 'items'), item);
                        break;
                    case 'edit':
                        if ('id' in item && typeof item.id === 'string') {
                            const docRef = doc(db as Firestore, 'items', item.id);
                            await updateDoc(docRef, item);
                        } else {
                            console.error('Cannot edit item without a valid ID');
                        }
                        break;
                    case 'delete':
                        if ('id' in item && typeof item.id === 'string') {
                            const docRef = doc(db as Firestore, 'items', item.id);
                            await deleteDoc(docRef);
                        } else {
                            console.error('Cannot delete item without a valid ID');
                        }
                        break;
                    default:
                        console.error('Unknown operation type:', type);
                }
            }
            console.log('Operations confirmed and database updated');
            setOperations([]);
            resetTranscript();
        } catch (error) {
            console.error('Error updating database:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Button onClick={() => SpeechRecognition.startListening()} disabled={isListening}>
                {isListening ? 'Listening...' : 'Start Listening'}
            </Button>
            <Button onClick={handleInterpretTranscript} disabled={!transcript || isInterpreting}>
                {isInterpreting ? 'Interpreting...' : 'Interpret Transcript'}
            </Button>
            
            {operations.length > 0 && (
                <>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Operation</Table.Th>
                                <Table.Th>Name</Table.Th>
                                <Table.Th>Amount</Table.Th>
                                <Table.Th>Categories</Table.Th>
                                <Table.Th>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {operations.map((op, index) => (
                                <Table.Tr key={index}>
                                    <Table.Td>
                                        <Select
                                            value={op.type}
                                            onChange={(value) => handleOperationTypeChange(index, value as 'add' | 'delete' | 'edit')}
                                            data={[
                                                { value: 'add', label: 'Add' },
                                                { value: 'delete', label: 'Delete' },
                                                { value: 'edit', label: 'Edit' },
                                            ]}
                                        />
                                    </Table.Td>
                                    <Table.Td>{op.item.name}</Table.Td>
                                    <Table.Td>{op.item.amount}</Table.Td>
                                    <Table.Td>
                                        {op.item.categories.map((category, catIndex) => (
                                            <Badge
                                                key={catIndex}
                                                color={category.color}
                                                variant="light"
                                                className="mr-1 mb-1"
                                            >
                                                {category.name}
                                            </Badge>
                                        ))}
                                    </Table.Td>
                                    <Table.Td>
                                        <ActionIcon onClick={() => handleEdit(index)} className="mr-2">
                                            <IconPencil size={18} />
                                        </ActionIcon>
                                        <ActionIcon onClick={() => handleDelete(index)} color="red">
                                            <IconTrash size={18} />
                                        </ActionIcon>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                    <Button onClick={handleConfirm} className="mt-4">
                        Confirm Changes
                    </Button>
                </>
            )}
            {editingItem && (
                <EditModal
                    item={editingItem.item}
                    isModalOpen={editModalOpen}
                    setIsModalOpen={setEditModalOpen}
                    onSave={handleSave}
                    existingCategories={[]} // You might want to pass existing categories if available
                />
            )}
        </div>
    );
};
export default VoiceRecognitionComponent;