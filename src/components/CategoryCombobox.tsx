import React, { useState, useEffect } from 'react';
import { Combobox, InputBase, useCombobox, Transition } from '@mantine/core';
import { collection, onSnapshot, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { db } from '../firebase';
import { getColorForCategory } from "@/src/utils/colorUtils";

interface CategoryComboboxProps {
    onCategorySelect: (category: string, color: string) => void;
    categoryColorMap: Map<string, string>;
}

export const CategoryCombobox: React.FC<CategoryComboboxProps> = ({ onCategorySelect, categoryColorMap }) => {
    const [search, setSearch] = useState('');
    const [categories, setCategories] = useState<{ name: string; color: string }[]>([]);
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const handleSelect = (category: string) => {
        const color = getColorForCategory(category, categoryColorMap);
        onCategorySelect(category, color);
    };

    const seedCategories = async () => {
        const defaultCategories = ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Grains'];
        const categoriesCollection = collection(db, 'categories');

        for (const category of defaultCategories) {
            const querySnapshot = await getDocs(query(categoriesCollection, where('name', '==', category)));
            if (querySnapshot.empty) {
                const color = getColorForCategory(category, categoryColorMap);
                await addDoc(categoriesCollection, { name: category, color });
            }
        }
    };

    useEffect(() => {
        seedCategories();
        const categoriesCollection = collection(db, 'categories');
        const unsubscribe = onSnapshot(categoriesCollection, (snapshot) => {
            const categoriesList = snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name,
                color: doc.data().color
            }));
            setCategories(categoriesList);
        });

        return () => unsubscribe();
    }, []);

    const filteredCategories = search.trim() === ''
        ? categories
        : categories.filter(category =>
            category.name && category.name.toLowerCase().includes(search.toLowerCase().trim())
        );

    const handleOptionSubmit = async (val: string) => {
        if (!categories.some(cat => cat.name === val)) {
            try {
                const color = getColorForCategory(val, categoryColorMap);
                await addDoc(collection(db, 'categories'), { name: val, color });
                onCategorySelect(val, color);
            } catch (error) {
                console.error("Error adding category: ", error);
            }
        } else {
            const category = categories.find(cat => cat.name === val);
            if (category) {
                onCategorySelect(category.name, category.color);
            }
        }
        setSearch('');
        combobox.closeDropdown();
    };

    const options = [
        ...filteredCategories.map(category => (
            <Combobox.Option value={category.name} key={category.name}>
                <div className="flex justify-between items-center">
                    <span>{category.name}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(category.name);
                        }}
                        className="text-red-500 hover:text-red-700"
                    >
                        Delete
                    </button>
                </div>
            </Combobox.Option>
        )),
        <Combobox.Option
            value={search.trim()}
            key="new-category"
            disabled={!search.trim() || categories.some(cat => cat.name === search.trim())}
        >
            {search.trim() && !categories.some(cat => cat.name === search.trim())
                ? `Create "${search.trim()}"`
                : 'Type to create a new category'}
        </Combobox.Option>
    ];

    const handleDeleteCategory = async (categoryName: string) => {
        try {
            const categoryRef = doc(db, 'categories', categoryName);
            await deleteDoc(categoryRef);
            console.log(`Category ${categoryName} deleted successfully`);
        } catch (error) {
            console.error("Error deleting category: ", error);
        }
    };

    return (
        <Combobox
            store={combobox}
            onOptionSubmit={handleOptionSubmit}
            classNames={{
                dropdown: 'bg-[#1a1a1a] border border-[#3b3b3b]',
                option: 'data-[selected]:bg-[#2c2c2c] hover:bg-[#2c2c2c] data-[hovered]:bg-[#2c2c2c]',
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
                    placeholder="Select or create a category"
                    rightSectionPointerEvents="none"
                />
            </Combobox.Target>

            <Transition transition="scale-y" duration={400} mounted={combobox.dropdownOpened}>
                {(styles) => (
                    <Combobox.Dropdown style={styles}>
                        <Combobox.Options>{options}</Combobox.Options>
                    </Combobox.Dropdown>
                )}
            </Transition>
        </Combobox>
    );
};