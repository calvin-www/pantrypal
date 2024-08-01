import React, { useState, useEffect } from 'react';
import { TextInput, MultiSelect, Select, Group, Box, Button, SegmentedControl, Flex, ActionIcon } from '@mantine/core';
import { collection, onSnapshot } from "firebase/firestore";
import { db } from '../firebase';
import { IconSearch, IconArrowUp, IconArrowDown } from '@tabler/icons-react';

interface SearchBarProps {
    onViewChange: (newView: 'card' | 'list') => void;
    onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    currentView: 'card' | 'list';
    onSearchAndSort: (searchTerm: string, selectedCategories: string[], sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearchAndSort, onViewChange, currentView }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('recentlyAdded');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const segmentedControlStyle = {
        indicator: {
            backgroundImage: 'linear-gradient(to right, #3983F5, #08B4D5)',
            boxShadow: '0 3px 10px 0 rgba(21, 37, 66, 0.35)',
        },
    };
    useEffect(() => {
        onSearchAndSort('', [], sortBy, sortOrder);
    }, []);
    useEffect(() => {
        const categoriesCollection = collection(db, 'categories');
        const unsubscribe = onSnapshot(categoriesCollection, (snapshot) => {
            setCategories(snapshot.docs.map(doc => doc.data().name));
        });

        return () => unsubscribe();
    }, []);
    const handleSearch = () => {
        onSearchAndSort(searchTerm, selectedCategories, sortBy, sortOrder);
    };
    const handleViewChange = (newView: string) => {
        const view = newView as 'card' | 'list';
        onViewChange(view);
    };


    const handleSortChange = (newSortBy: string) => {
        setSortBy(newSortBy);
        // Keep the current sort order
        onSearchAndSort(searchTerm, selectedCategories, newSortBy, sortOrder);
    };

    const toggleSortOrder = () => {
        const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newSortOrder);
        onSearchAndSort(searchTerm, selectedCategories, sortBy, newSortOrder);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSelectedCategories([]);
        onSearchAndSort('', [], sortBy, sortOrder);
    };

    return (
        <Box>
            <Flex direction="column" gap="md">
                <Flex justify="flex-end">
                    <SegmentedControl
                        value={currentView}
                        radius = 'lg'
                        onChange={handleViewChange}
                        data={[
                            { label: 'Card', value: 'card' },
                            { label: 'List', value: 'list' },
                        ]}
                        styles={segmentedControlStyle}
                    />
                </Flex>

                <Flex justify="space-between" align="flex-end">
                    <Group align="flex-end">
                        <Button
                            size="compact-md"
                            onClick={clearSearch}
                        >
                            Clear
                        </Button>

                        <TextInput
                            size="md"
                            label="Search"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.currentTarget.value)}
                            onKeyUp={(event) => event.key === 'Enter' && handleSearch()}
                        />
                        <MultiSelect
                            size="md"
                            label="Categories"

                            data={categories.filter(Boolean).map(category => ({ value: category, label: category }))}
                            value={selectedCategories}
                            onChange={(value) => setSelectedCategories(value || [])}
                        />
                        <Button
                            size="compact-md"
                            onClick={handleSearch}
                            leftSection={<IconSearch size={14} />}
                        >
                            Search
                        </Button>
                    </Group>

                    <Flex direction="column" align="flex-end">
                        <Box>
                            <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>Sort by</label>
                            <Group gap={0} align="center">
                                <Select
                                    size="md"
                                    data={[
                                        { value: 'name', label: 'Name' },
                                        { value: 'amount', label: 'Amount' },
                                        { value: 'recentlyAdded', label: 'Recently Added' },
                                    ]}
                                    value={sortBy}
                                    onChange={(value) => handleSortChange(value || 'name')}
                                    style={{ minWidth: '100px' }}
                                    styles={{ wrapper: { height: '36px' } }}
                                />
                                <ActionIcon
                                    size={36}
                                    variant="outline"
                                    onClick={toggleSortOrder}
                                    style={{ marginLeft: '-1px', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                >
                                    {sortOrder === 'asc' ? <IconArrowUp size={16} /> : <IconArrowDown size={16} />}
                                </ActionIcon>
                            </Group>
                        </Box>
                    </Flex>
                </Flex>
            </Flex>
        </Box>
    );
};