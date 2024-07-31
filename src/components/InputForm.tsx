import React, { useState, useEffect } from 'react';
import { TextInput, NumberInput, Button, Badge, Notification } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { CategoryCombobox } from './CategoryCombobox';
import { getLocalCategoryColors } from "../utils/categoryColorutils";

interface InputFormProps {
    onAdd: () => void;
}

const InputForm: React.FC<InputFormProps> = ({ onAdd }) => {
    const [categoryColorMap, setCategoryColorMap] = useState<Map<string, string>>(new Map());
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [categories, setCategories] = useState<{ name: string; color: string }[]>([]);
    const [showNotification, setShowNotification] = useState(false);


    useEffect(() => {
        const localColors = getLocalCategoryColors();
        setCategoryColorMap(new Map(Object.entries(localColors)));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !amount.trim()) {
            setShowNotification(true);
            return;
        }
        try {
            await addDoc(collection(db, "items"), {
                name: name.trim(),
                amount: parseFloat(amount),
                categories: categories.map(cat => ({ name: cat.name, color: cat.color })),
            });
            setName('');
            setAmount('');
            setCategories([]);
            onAdd();
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    const handleAddCategory = (category: string, color: string) => {
        setCategories((current) => [...current, { name: category, color }]);
    };

    const handleRemoveCategory = (categoryToRemove: string) => {
        setCategories(categories.filter((category) => category.name !== categoryToRemove));
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            {showNotification && (
                <Notification
                    className="text-white bg-[#242424] border-2 border-[#3b3b3b]"
                    withCloseButton={true}
                    onClose={() => setShowNotification(false)}
                    withBorder
                    color="red"
                    radius="md"
                    title="Please enter a valid Name and Amount"
                />
            )}
            <TextInput
                value={name}
                withAsterisk
                onChange={(e) => setName(e.target.value)}
                placeholder="Item name"
                styles={{input: {backgroundColor: "#242424", color: "white"}}}
            />

            <NumberInput
                value={amount === "" ? "" : parseFloat(amount)}
                withAsterisk
                onChange={(value) => setAmount(value === "" ? "" : value.toString())}
                placeholder="Amount"
                styles={{input: {backgroundColor: "#242424", color: "white"}}}
            />

            <CategoryCombobox onCategorySelect={handleAddCategory} categoryColorMap={categoryColorMap} />

            <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
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
                                    handleRemoveCategory(category.name);
                                }}
                                style={{cursor: 'pointer'}}
                            />
                        }
                        onClick={() => handleRemoveCategory(category.name)}
                    >
                        <span className="z-10 relative">{category.name}</span>
                        <div
                            className="absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-30 transition-opacity duration-200 rounded pointer-events-none"></div>
                    </Badge>
                ))}
            </div>

            <Button type="submit" className="bg-blue-500 text-white">
                Add Item
            </Button>
        </form>
    );
};

export default InputForm;