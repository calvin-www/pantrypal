import { useState } from 'react';
import { TextInput, NumberInput, Button, Combobox, InputBase, useCombobox, Divider } from '@mantine/core';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

interface InputFormProps {
    onAdd: () => void;
}

const InputForm: React.FC<InputFormProps> = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [search, setSearch] = useState('');

    const itemCategories = [
        { label: 'Food', options: ['🍎 Fruits', '🥕 Vegetables', '🍗 Meat'] },
        { label: 'Electronics', options: ['💻 Computers', '📱 Phones', '🔌 Accessories'] },
        { label: 'Home', options: ['🛋️ Furniture', '🧼 Cleaning', '🏺 Decor'] },
    ];

    const allOptions = itemCategories.reduce<string[]>((acc, group) => [...acc, ...group.options], []);

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "items"), {
                name: name.trim(),
                amount: parseFloat(amount),
                categories: categories,
            });
            setName('');
            setAmount('');
            setCategories([]);
            onAdd();
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    const shouldFilterOptions = allOptions.every((item) => item !== search);
    const filteredGroups = itemCategories.map((group) => {
        const filteredOptions = shouldFilterOptions
            ? group.options.filter((item) => item.toLowerCase().includes(search.toLowerCase().trim()))
            : group.options;

        return { ...group, options: filteredOptions };
    });

    const groups = [
        ...filteredGroups.map((group) => {
            const options = group.options.map((item) => (
                <Combobox.Option value={item} key={item}>
                    {item}
                </Combobox.Option>
            ));

            return (
                <Combobox.Group label={group.label} key={group.label}>
                    {options}
                </Combobox.Group>
            );
        }),
        <Combobox.Group label="New Category" key="new-category">
            <Combobox.Option value={search.trim() || 'start typing'}>
                &ldquo;{search.trim() || 'start typing'}&rdquo;
            </Combobox.Option>
        </Combobox.Group>
    ];

    return (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <TextInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Item name"
                className="text-white bg-[#242424] border-2 border-[#3b3b3b]"
                styles={{
                    input: {
                        backgroundColor: '#242424',
                        color: 'white',
                        '&::placeholder': { color: 'rgba(255, 255, 255, 0.5)' },
                    },
                }}
            />

            <NumberInput
                value={amount}
                onChange={(value) => setAmount(value?.toString() || '')}
                placeholder="Amount"
                className="text-white bg-[#242424] border-2 border-[#3b3b3b]"
                styles={{
                    input: {
                        backgroundColor: '#242424',
                        color: 'white',
                        '&::placeholder': { color: 'rgba(255, 255, 255, 0.5)' },
                    },
                }}
            />

            <Combobox
                store={combobox}
                onOptionSubmit={(val) => {
                    setCategories((current) => [...current, val]);
                    setSearch('');
                    combobox.closeDropdown();
                }}
                styles={{
                    dropdown: {
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #3b3b3b',
                    },
                    option: {
                        '&[data-selected]': {
                            backgroundColor: '#2c2c2c',
                        },
                        '&[data-hovered]': {
                            backgroundColor: '#2c2c2c',
                        },
                    },
                }}
            >
                <Combobox.Target>
                    <InputBase
                        rightSection={<Combobox.Chevron />}
                        value={search}
                        onChange={(event) => {
                            combobox.openDropdown();
                            combobox.updateSelectedOptionIndex();
                            setSearch(event.currentTarget.value);
                        }}
                        onClick={() => combobox.openDropdown()}
                        onFocus={() => combobox.openDropdown()}
                        onBlur={() => {
                            combobox.closeDropdown();
                            setSearch('');
                        }}
                        placeholder="Select categories"
                        rightSectionPointerEvents="none"
                        className="text-white bg-[#242424] border-2 border-[#3b3b3b]"
                        styles={{
                            input: {
                                color: 'white',
                                backgroundColor: '#242424',
                                '&::placeholder': { color: 'rgba(255, 255, 255, 0.5)' },
                            },
                        }}
                    />
                </Combobox.Target>

                <Combobox.Dropdown>
                    <Combobox.Options>
                        {groups}
                    </Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>

            <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                    <div key={category} className="bg-blue-500 text-white px-2 py-1 rounded">
                        {category}
                        <button
                            type="button"
                            onClick={() => setCategories(categories.filter(c => c !== category))}
                            className="ml-2 text-xs"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            <Button type="submit" className="bg-blue-500 text-white">
                Add Item
            </Button>
        </form>
    );
};

export default InputForm;