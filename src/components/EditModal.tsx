import React, { useState, useEffect, useCallback } from "react";
import { Modal, Grid, TextInput, NumberInput, Button, Text, Badge } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { Item } from "../types/item";
import { CategoryCombobox } from "./CategoryCombobox";
import { getColorForCategory, updateLocalCategoryColors, getLocalCategoryColors } from "../utils/categoryColorutils";

interface EditModalProps {
    item: Item;
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditModal: React.FC<EditModalProps> = ({
        item, isModalOpen, setIsModalOpen,
    }) => {
    const [editedItem, setEditedItem] = useState<Item>(item);
    const [categoryColorMap, setCategoryColorMap] = useState<Map<string, string>>(new Map());

    useEffect(() => {
        const localColors = getLocalCategoryColors();
        setCategoryColorMap(new Map(Object.entries(localColors)));
    }, []);

    useEffect(() => {
        setEditedItem(item);
    }, [item]);

    const handleUpdate = useCallback(async () => {
        try {
            await updateDoc(doc(db, "items", editedItem.id!), {
                name: editedItem.name.trim(),
                amount: editedItem.amount,
                categories: editedItem.categories,
            });
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    }, [editedItem, setIsModalOpen]);

    const handleAddCategory = (category: string, color: string) => {
        if (category && typeof category === 'string') {
            setEditedItem({
                ...editedItem,
                categories: [
                    ...editedItem.categories,
                    { name: category, color: color }
                ],
            });
        }
    };

    const handleRemoveBadge = (index: number) => {
        const updatedCategories = [...editedItem.categories];
        updatedCategories.splice(index, 1);
        setEditedItem({ ...editedItem, categories: updatedCategories });
    };

    return (
        <Modal
            opened={isModalOpen}
            size="md"
            onClose={() => setIsModalOpen(false)}
        >
            <Grid>
                <Grid.Col span={12}>
                    <Text className="text-white mb-2">Name:</Text>
                    <TextInput
                        value={editedItem.name}
                        onChange={(e) =>
                            setEditedItem({ ...editedItem, name: e.target.value })
                        }
                        placeholder="Item name"
                        className="text-white"
                        styles={{ input: { backgroundColor: "#242424", color: "white" } }}
                    />
                </Grid.Col>
                <Grid.Col span={12}>
                    <Text className="text-white mb-2">Amount:</Text>
                    <NumberInput
                        value={parseFloat(editedItem.amount)}
                        onChange={(value) =>
                            setEditedItem({
                                ...editedItem,
                                amount: value?.toString() || "",
                            })
                        }
                        placeholder="Amount"
                        classNames={{
                            input: "bg-[#242424] text-white placeholder-gray-400",
                            control: "text-white hover:bg-[#3b3b3b]",
                        }}
                    />
                </Grid.Col>
                <Grid.Col span={12}>
                    <Text className="text-white mb-2">Categories:</Text>
                    <CategoryCombobox onCategorySelect={handleAddCategory} categoryColorMap={categoryColorMap} />
                </Grid.Col>
                <Grid.Col span={12}>
                    <div className="flex flex-wrap gap-2">
                        {editedItem.categories &&
                            editedItem.categories.map((category, index) => (
                                <Badge
                                    key={index}
                                    color={category.color}
                                    variant="light"
                                    className="cursor-pointer relative group"
                                    rightSection={
                                        <IconX
                                            size={14}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveBadge(index);
                                            }}
                                            style={{cursor: 'pointer'}}
                                        />
                                    }
                                    onClick={() => handleRemoveBadge(index)}
                                >
                                    <span className="z-10 relative">{category.name}</span>
                                    <div
                                        className="absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-30 transition-opacity duration-200 rounded pointer-events-none"></div>
                                </Badge>
                            ))}
                    </div>

                    <Button
                        variant="gradient"
                        gradient={{from: 'blue', to: 'cyan'}}
                        fullWidth
                        onClick={handleUpdate}
                        className="mt-4"
                    >
                        Update Item
                    </Button>
                </Grid.Col>
            </Grid>
        </Modal>
    );
};

export default EditModal;