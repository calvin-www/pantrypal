import React from 'react';
import { Table, Menu, ActionIcon, Badge } from '@mantine/core';
import { IconPencil, IconTrash, IconSettings } from '@tabler/icons-react';
import { Item } from '../types/item';

interface TableViewProps {
    items: Item[];
    onEdit: (item: Item) => void;
    onDelete: (id: string) => void;
}

export const TableView: React.FC<TableViewProps> = ({ items, onEdit, onDelete }) => {
    return (
        <Table striped highlightOnHover>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Amount</Table.Th>
                    <Table.Th>Categories</Table.Th>
                    <Table.Th>Actions</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {items.map((item) => (
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
                        <Table.Td>
                            <div className="flex space-x-2">
                                <ActionIcon
                                    variant="gradient"
                                    size="lg"
                                    gradient={{ from: "blue", to: "cyan", deg: 90 }}
                                    className="cursor-pointer hover:brightness-75"
                                    onClick={() => onEdit(item)}
                                >
                                    <IconPencil size={20} />
                                </ActionIcon>
                                <ActionIcon
                                    variant="gradient"
                                    size="lg"
                                    gradient={{ from: "red", to: "pink", deg: 90 }}
                                    className="cursor-pointer hover:brightness-75"
                                    onClick={() => onDelete(item.id!)}
                                >
                                    <IconTrash size={20} />
                                </ActionIcon>
                            </div>
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
};