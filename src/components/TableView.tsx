import React, { useState, useEffect } from 'react';
import { Item } from '../types/item';
import { db } from '../firebase';
import { Table, Badge, ActionIcon, Menu, Transition } from '@mantine/core';
import { doc, deleteDoc } from 'firebase/firestore';
import { IconPencil, IconTrash, IconSettings } from '@tabler/icons-react';
import EditModal from './EditModal';

interface TableViewProps {
    items: Item[];
    onItemsChange: () => void;
    filteredItems: Item[];
}

export const TableView: React.FC<TableViewProps> = ({ items, onItemsChange }) => {
    const [editedItem, setEditedItem] = useState<Item | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWideScreen, setIsWideScreen] = useState(false);
    const [menuOpened, setMenuOpened] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 768px)');
        setIsWideScreen(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setIsWideScreen(e.matches);
        mediaQuery.addEventListener('change', handler);

        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

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

    const handleMenuToggle = (opened: boolean) => {
        setMenuOpened(opened);
    };

    const renderNarrowScreenTable = () => (
        <div className="overflow-x-hidden w-full">
            {items.map((item: Item) => (
                <div key={item.id} className="border-b border-gray-200 py-2">
                    <div className="flex justify-between items-center">
                        <div className="flex-grow">
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.amount}</p>
                            <div className="flex flex-wrap mt-1">
                                {item.categories.map((category, index) => (
                                    <Badge
                                        key={index}
                                        color={category.color}
                                        variant="light"
                                        className="mr-1 mb-1 text-xs"
                                    >
                                        {category.name.length > 10 ? `${category.name.slice(0, 10)}...` : category.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <Menu onOpen={() => handleMenuToggle(true)} onClose={() => handleMenuToggle(false)}>
                            <Menu.Target>
                                <ActionIcon
                                    variant="subtle"
                                    size="lg"
                                    className="cursor-pointer"
                                >
                                    <IconSettings size={20} />
                                </ActionIcon>
                            </Menu.Target>
                            <Transition transition="scale" duration={300} mounted={menuOpened} timingFunction="ease">
                                {(styles) => (
                                    <Menu.Dropdown className="bg-[#242424]" style={styles}>
                                        <Menu.Item leftSection={<IconPencil style={{width: 14, height: 14}}/>}
                                                   className="cursor-pointer hover:bg-slate-500 hover:rounded-md text-white transition-colors duration-200"
                                                   onClick={() => handleEdit(item)}>
                                            Edit
                                        </Menu.Item>
                                        <Menu.Item leftSection={<IconTrash style={{width: 14, height: 14}}/>}
                                                   className="cursor-pointer hover:bg-red-600 hover:rounded-md text-red-500 hover:text-white transition-colors duration-200"
                                                   onClick={() => handleDelete(item.id!)}>
                                            Delete
                                        </Menu.Item>
                                    </Menu.Dropdown>
                                )}
                            </Transition>
                        </Menu>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <>
            {isWideScreen ? (
                <Table striped highlightOnHover>
                    {/* Wide screen table layout */}
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
                </Table>
            ) : (
                renderNarrowScreenTable()
            )}
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