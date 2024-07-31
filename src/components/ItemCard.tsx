import React, { useState } from 'react';
import { Card, Text, ActionIcon, Menu, Badge, Grid, Transition } from '@mantine/core';
import { IconPencil, IconTrash, IconSettings } from '@tabler/icons-react';
import { Item } from '../types/item';

interface ItemCardProps {
    item: Item;
    onEdit: (item: Item) => void;
    onDelete: (id: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onEdit, onDelete }) => {
    const [menuOpened, setMenuOpened] = useState(false);

    return (
        <Card shadow="sm" p="md" radius="md" withBorder className="bg-[#242424] border-2 border-[#3b3b3b] text-gray-300 w-full relative shadow-4xl" style={{ height: "200px", display: "flex", flexDirection: "column" }}>
            <Card.Section className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
                <h2 className="text-white item-name" style={{
                    fontSize: "1.5rem",
                    lineHeight: 1.2,
                    maxHeight: "3.6rem",
                    overflow: "hidden",
                    wordWrap: "break-word",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                }}>
                    {item.name}
                </h2>
            </Card.Section>
            <div className="flex-wrap gap-2 mt-2 justify-start">
                {item.categories && item.categories.map((category, index) => (
                    <Badge key={index} color={category.color} variant="light">
                        {category.name}
                    </Badge>
                ))}
            </div>
            <div className="flex-grow"></div>
            <Grid className="w-full" justify="space-between">
                <Grid.Col span={12}>
                    <div className="flex-1">
                        <h3 className="text-gray-300">Amount: {item.amount}</h3>
                    </div>
                </Grid.Col>
                <Grid.Col span={12} className="flex justify-end items-end">
                    <Menu opened={menuOpened} onChange={setMenuOpened}>
                        <Menu.Target>
                            <ActionIcon variant="gradient" size="xl" gradient={{ from: "blue", to: "cyan", deg: 90 }} className="cursor-pointer absolute bottom-2 right-2 hover:brightness-75">
                                <IconSettings size={24} />
                            </ActionIcon>
                        </Menu.Target>
                        <Transition transition="scale" duration={300} mounted={menuOpened} timingFunction="ease">
                            {(styles) => (
                                <Menu.Dropdown className="bg-[#242424]" style={styles}>
                                    <Menu.Item leftSection={<IconPencil style={{ width: 14, height: 14 }} />} className="cursor-pointer hover:bg-slate-500 hover:rounded-md text-white transition-colors duration-200" onClick={() => onEdit(item)}>
                                        Edit
                                    </Menu.Item>
                                    <Menu.Item leftSection={<IconTrash style={{ width: 14, height: 14 }} />} className="cursor-pointer hover:bg-red-600 hover:rounded-md text-red-500 hover:text-white transition-colors duration-200" onClick={() => onDelete(item.id!)}>
                                        Delete
                                    </Menu.Item>
                                </Menu.Dropdown>
                            )}
                        </Transition>
                    </Menu>
                </Grid.Col>
            </Grid>
        </Card>
    );
};