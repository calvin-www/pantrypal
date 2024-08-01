import React, { useState, useEffect } from 'react';
import { Item } from '../types/item';
import { db } from '../firebase';
import { Table, Badge, ActionIcon } from '@mantine/core';
import { doc, deleteDoc } from 'firebase/firestore';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import EditModal from './EditModal';

interface TableViewProps {
    items: Item[];
    onItemsChange: () => void;
    filteredItems: Item[];
}

export const TableView: React.FC<TableViewProps> = ({ items, onItemsChange, filteredItems }) => {
    const [editedItem, setEditedItem] = useState<Item | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const displayItems = filteredItems.length > 0 ? filteredItems : items;

    const handleEdit = (item: Item) => {
        setEditedItem(item);
        setIsModalOpen(true);
    };


    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, "items", id));
            onItemsChange();
            if (isModalOpen) {
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    };

    return (
        <>
            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Amount</Table.Th>
                        <Table.Th>Categories</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {items.map((item: Item) => (
                        <Table.Tr key={item.id}>
                            <Table.Td>{item.name}</Table.Td>
                            <Table.Td>{item.amount}</Table.Td>
                            <Table.Td>
                                {item.categories.map((category, index) => (
                                    <Badge
                                        key={index}
                                        color={category.color}
                                        variant="light"
                                        className="mr-1 mb-1"
                                    >
                                        {category.name}
                                    </Badge>
                                ))}
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'right' }}>
                                <div className="flex justify-end space-x-2">
                                    <ActionIcon
                                        variant="gradient"
                                        size="lg"
                                        gradient={{ from: "blue", to: "cyan", deg: 90 }}
                                        className="cursor-pointer hover:brightness-75"
                                        onClick={() => handleEdit(item)}
                                    >
                                        <IconPencil size={20} />
                                    </ActionIcon>
                                    <ActionIcon
                                        variant="gradient"
                                        size="lg"
                                        gradient={{ from: "red", to: "pink", deg: 90 }}
                                        className="cursor-pointer hover:brightness-75"
                                        onClick={() => handleDelete(item.id!)}
                                    >
                                        <IconTrash size={20} />
                                    </ActionIcon>
                                </div>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            {/* Edit Modal */}
            {editedItem && (
                <EditModal
                    item={editedItem}
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                />
            )}
        </>
    );
};