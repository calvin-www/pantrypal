import React, { useState, useEffect } from 'react';
import { Button, Table, Select, Badge, ActionIcon, Loader, Combobox, InputBase, useCombobox  } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import EditModal from "./EditModal";
import { db } from '../firebase';
import { doc, addDoc, updateDoc, deleteDoc, collection, getDocs , getDoc, query } from 'firebase/firestore';

interface Operation {
    type: 'add' | 'delete' | 'edit';
    item: {
        id?: string;
        name: string;
        amount: string;
        categories: { name: string; color: string }[];
    };
}

interface VoiceRecognitionComponentProps {
    onClose: () => void;
}

const VoiceRecognitionComponent: React.FC<VoiceRecognitionComponentProps> = ({ onClose }) => {
    const [state, setState] = useState<'listening' | 'interpreting' | 'reviewing'>('listening');
    const [operations, setOperations] = useState<Operation[]>([]);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Operation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [databaseItems, setDatabaseItems] = useState<{ id: string; name: string }[]>([]);
    const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

    useEffect(() => {
        if (!browserSupportsSpeechRecognition) {
            console.error("Browser doesn't support speech recognition.");
            return;
        }

        SpeechRecognition.startListening({ continuous: true });

        return () => {
            SpeechRecognition.stopListening();
        };
    }, [browserSupportsSpeechRecognition]);

    useEffect(() => {
        const fetchItems = async () => {
            const itemsSnapshot = await getDocs(collection(db, 'items'));
            const items = itemsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
            setDatabaseItems(items);
        };
        fetchItems();
    }, []);

    const handleInterpretTranscript = async () => {
        if (transcript) {
            try {
                setState('interpreting');
                const response = await fetch('/api/interpretTranscript', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transcript }),
                });

                if (!response.ok) {
                    throw new Error('Failed to interpret transcript');
                }

                const data = await response.json();
                const transformedOperations = data.interpretedOperations.map((op: any) => ({
                    type: op.operation,
                    item: {
                        name: op.item,
                        amount: op.quantity ? op.quantity.toString() : '0',
                        categories: []
                    }
                }));

                setOperations(transformedOperations);
                setState('reviewing');
                resetTranscript();
                SpeechRecognition.stopListening();
            } catch (error) {
                console.error('Error interpreting transcript:', error);
                setState('listening');
            }
        }
    };

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const handleOperationTypeChange = (index: number, value: 'add' | 'delete' | 'edit') => {
        setOperations(prev => prev.map((op, i) => i === index ? { ...op, type: value } : op));
    };

    const handleItemNameChange = (index: number, value: string | null) => {
        if (value !== null) {
            setOperations(prev => prev.map((op, i) => i === index ? { ...op, item: { ...op.item, name: value } } : op));
        }
    };

    const handleEdit = (index: number) => {
        setEditingItem(operations[index]);
        setEditModalOpen(true);
    };

    const handleSave = async (updatedItem: Operation['item']): Promise<void> => {
        setOperations(prev => prev.map(op => op === editingItem ? { ...op, item: updatedItem } : op));
        setEditModalOpen(false);
    };

    const handleDelete = (index: number) => {
        setOperations(prev => prev.filter((_, i) => i !== index));
    };

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            for (const operation of operations) {
                const { type, item } = operation;
                const itemRef = databaseItems.find(dbItem => dbItem.name === item.name);

                switch (type) {
                    case 'add':
                        if (itemRef) {
                            const docRef = doc(db, 'items', itemRef.id);
                            const docSnap = await getDoc(docRef);
                            if (docSnap.exists()) {
                                const existingItem = docSnap.data();
                                const newAmount = parseFloat(existingItem.amount) + parseFloat(item.amount);
                                await updateDoc(docRef, { amount: newAmount.toString() });
                            }
                        } else {
                            await addDoc(collection(db, 'items'), item);
                        }
                        break;
                    case 'edit':
                        if (itemRef) {
                            const docRef = doc(db, 'items', itemRef.id);
                            await updateDoc(docRef, item);
                        } else {
                            console.error('Cannot edit item without a valid ID');
                        }
                        break;
                    case 'delete':
                        if (itemRef) {
                            const docRef = doc(db, 'items', itemRef.id);
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
            onClose();
        } catch (error) {
            console.error('Error updating database:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (state === 'listening') {
        return (
            <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-2">
                    <Loader size="sm" />
                    <span>Listening...</span>
                </div>
                <p className="text-center">{transcript}</p>
                <Button onClick={handleInterpretTranscript} disabled={!transcript}>
                    Interpret Transcript
                </Button>
            </div>
        );
    }

    if (state === 'interpreting') {
        return (
            <div className="flex flex-col items-center space-y-4">
                <Loader size="md" />
                <span>Interpreting transcript...</span>
            </div>
        );
    }

    interface TableRowProps {
        op: Operation;
        index: number;
        handleOperationTypeChange: (index: number, value: 'add' | 'delete' | 'edit') => void;
        handleItemNameChange: (index: number, value: string | null) => void;
        handleEdit: (index: number) => void;
        handleDelete: (index: number) => void;
        databaseItems: { id: string; name: string }[];
    }

    const TableRow: React.FC<TableRowProps> = ({
                                                   op,
                                                   index,
                                                   handleOperationTypeChange,
                                                   handleItemNameChange,
                                                   handleEdit,
                                                   handleDelete,
                                                   databaseItems
                                               }) => {
        const [comboboxValue, setComboboxValue] = useState(op.item.name);
        const combobox = useCombobox({
            onDropdownClose: () => combobox.resetSelectedOption(),
        });
        const filterSimilarItems = (items: { id: string; name: string }[], query: string) => {
            return items.filter(item =>
                item.name.toLowerCase().includes(query.toLowerCase())
            );
        };

        // Check if item already exists
        const itemExists = databaseItems.some(item => item.name.toLowerCase() === comboboxValue.toLowerCase());

        return (
            <Table.Tr>
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
                <Table.Td>
                    <Combobox
                        store={combobox}
                        onOptionSubmit={(value) => {
                            setComboboxValue(value);
                            handleItemNameChange(index, value);
                            combobox.closeDropdown();
                        }}
                    >
                        <Combobox.Target>
                            <InputBase
                                component="button"
                                type="button"
                                pointer
                                rightSection={<Combobox.Chevron />}
                                rightSectionPointerEvents="none"
                                onClick={() => combobox.toggleDropdown()}
                            >
                                {comboboxValue || 'Select item'}
                            </InputBase>
                        </Combobox.Target>

                        <Combobox.Dropdown>
                            <Combobox.Options>
                                {filterSimilarItems(databaseItems, comboboxValue).map((item) => (
                                    <Combobox.Option value={item.name} key={item.id}>
                                        {item.name}
                                    </Combobox.Option>
                                ))}
                                {!itemExists && (
                                    <Combobox.Option value={comboboxValue}>
                                        + Create {comboboxValue}
                                    </Combobox.Option>
                                )}
                        </Combobox.Options>
                    </Combobox.Dropdown>
                </Combobox>
            </Table.Td>
        <Table.Td>{op.item.amount}</Table.Td>
        <Table.Td>
            {op.item.categories.map((category: { name: string; color: string }, catIndex: number) => (
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
        );
    };
    return (
        <div>
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
                        <TableRow
                            key={index}
                            op={op}
                            index={index}
                            handleOperationTypeChange={handleOperationTypeChange}
                            handleItemNameChange={handleItemNameChange}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                            databaseItems={databaseItems}
                        />
                    ))}
                </Table.Tbody>
            </Table>
            <Button onClick={handleConfirm} className="mt-4" loading={isLoading}>
                Confirm Changes
            </Button>
            {editingItem && (
                <EditModal
                    item={editingItem.item}
                    isModalOpen={editModalOpen}
                    setIsModalOpen={setEditModalOpen}
                    onSave={handleSave}
                    existingCategories={[]}
                />
            )}
        </div>
    );
};

export default VoiceRecognitionComponent