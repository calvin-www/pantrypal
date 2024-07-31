import React, { useState, useEffect, useCallback } from 'react';
import { Combobox, InputBase, useCombobox, Transition } from '@mantine/core';
import { collection, onSnapshot, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { db } from '../firebase';
import { getColorForCategory, updateLocalCategoryColors, getLocalCategoryColors } from "../utils/categoryColorutils";

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

    const getLocalCategories = (): { name: string; color: string }[] => {
        if (typeof window !== 'undefined') {
            const localCategories = localStorage.getItem('categories');
            return localCategories ? JSON.parse(localCategories) : [];
        }
        return [];
    };


    useEffect(() => {
        // seedCategories();
        const categoriesCollection = collection(db, 'categories');
        const unsubscribe = onSnapshot(categoriesCollection, (snapshot) => {
            const categoriesList = snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name,
                color: doc.data().color
            }));
            setCategories(categoriesList);

            // Store categories in local storage
            localStorage.setItem('categories', JSON.stringify(categoriesList));

            // Update local storage with the latest category colors
            const colorUpdates = categoriesList.reduce((acc, category) => {
                acc[category.name] = category.color;
                return acc;
            }, {} as Record<string, string>);
            updateLocalCategoryColors(colorUpdates);
        });

        return () => unsubscribe();
    }, []);


    const handleDeleteCategory = async (categoryName: string) => {
        try {
            const categoryQuery = query(collection(db, 'categories'), where('name', '==', categoryName));
            const querySnapshot = await getDocs(categoryQuery);

            if (!querySnapshot.empty) {
                const categoryDoc = querySnapshot.docs[0];
                await deleteDoc(doc(db, 'categories', categoryDoc.id));
                console.log(`Category ${categoryName} deleted successfully`);

                // Remove from local storage
                const localCategories = getLocalCategories().filter(cat => cat.name !== categoryName);
                localStorage.setItem('categories', JSON.stringify(localCategories));

                // Update state
                setCategories(localCategories);

                // Remove the deleted category from local color storage
                updateLocalCategoryColors({ [categoryName]: null });
            } else {
                console.log(`Category ${categoryName} not found`);
            }
        } catch (error) {
            console.error("Error deleting category: ", error);
        }
    };

    const filteredCategories = search.trim() === ''
        ? categories
        : categories.filter(category =>
            category.name.toLowerCase().includes(search.toLowerCase().trim())
        );

    const handleOptionSubmit = async (val: string) => {
        const localCategories = getLocalCategories();
        if (!localCategories.some(cat => cat.name === val)) {
            try {
                const color = getColorForCategory(val, categoryColorMap);
                const newCategory = { name: val, color };
                await addDoc(collection(db, 'categories'), newCategory);

                // Add to local storage
                localCategories.push(newCategory);
                localStorage.setItem('categories', JSON.stringify(localCategories));

                onCategorySelect(val, color);
            } catch (error) {
                console.error("Error adding category: ", error);
            }
        } else {
            const category = localCategories.find(cat => cat.name === val);
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

            <Transition
                transition="scale-y"
                duration={400}
                mounted={combobox.dropdownOpened}
                exitDuration={400} // Add this line
            >
                {(styles) => (
                    <Combobox.Dropdown
                        style={{
                            ...styles,
                            display: combobox.dropdownOpened ? 'block' : 'none', // Add this line
                        }}
                    >
                        <Combobox.Options>{options}</Combobox.Options>
                    </Combobox.Dropdown>
                )}
            </Transition>
        </Combobox>
    );
};