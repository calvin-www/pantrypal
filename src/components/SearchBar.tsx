import React, { useState, useEffect } from 'react';
import { useViewportSize } from '@mantine/hooks';
import { TextInput, MultiSelect, Select, Group, Box, Button, SegmentedControl, Flex, ActionIcon } from '@mantine/core';
import { collection, onSnapshot } from "firebase/firestore";
import { db } from '../firebase';
import { IconSearch, IconArrowUp, IconArrowDown, IconX } from '@tabler/icons-react';

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
    const { width } = useViewportSize();
    const isWideScreen = width >= 768;

    const segmentedControlStyle = {
        indicator: {
            backgroundImage: 'linear-gradient(to right, #3983F5, #08B4D5)',
            boxShadow: '0 3px 10px 0 rgba(21, 37, 66, 0.35)',
        },
    };

    useEffect(() => {
        onSearchAndSort('', [], sortBy, sortOrder);
    }, [onSearchAndSort, onViewChange, sortBy, sortOrder]);

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

    const inputStyles = {
        input: {
            backgroundColor: "#242424",
            color: "white",
            height: '36px',
        },
        wrapper: {
            width: '200px',
        },
    };
    return (
        <Box>
            {isWideScreen ? (
                // Wide screen layout
                <Flex justify="space-between" align="flex-end">
                    <Box>
                        <Flex direction="column" gap="md">
                            <Flex justify="space-between" align="flex-end">
                                <Group align="flex-end">
                                    <TextInput
                                        size="sm"
                                        value={searchTerm}
                                        placeholder="Search items..."
                                        onChange={(event) => setSearchTerm(event.currentTarget.value)}
                                        onKeyUp={(event) => event.key === 'Enter' && handleSearch()}
                                        styles={inputStyles}
                                    />
                                    <MultiSelect
                                        placeholder={selectedCategories.length === 0 ? "Select categories..." : ""}
                                        hidePickedOptions
                                        size="sm"
                                        data={categories.filter(Boolean).map(category => ({ value: category, label: category }))}
                                        value={selectedCategories}
                                        onChange={(value) => setSelectedCategories(value || [])}
                                        styles={{
                                            ...inputStyles,
                                            wrapper: {
                                                ...inputStyles.wrapper,
                                                width: selectedCategories.length > 0 ? 'auto' : '200px',
                                                minWidth: '200px',
                                            },
                                        }}
                                    />
                                </Group>
                            </Flex>

                            <Flex justify="space-between" align="center">
                                <Group>
                                    <Button
                                        size="sm"
                                        onClick={clearSearch}
                                        style={{ backgroundColor: "#242424", color: "white" }}
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSearch}
                                        leftSection={<IconSearch size={14} />}
                                        style={{ backgroundColor: "#3983F5", color: "white" }}
                                    >
                                        Search
                                    </Button>
                                </Group>
                            </Flex>
                        </Flex>
                    </Box>

                    <Flex direction="column" align="flex-end" gap="md">
                        <SegmentedControl
                            value={currentView}
                            radius="lg"
                            onChange={handleViewChange}
                            data={[
                                { label: 'Card', value: 'card' },
                                { label: 'List', value: 'list' },
                            ]}
                            styles={segmentedControlStyle}
                        />

                        <Box>
                            <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>Sort by</label>
                            <Group gap={0} align="center">
                                <Select
                                    size="sm"
                                    data={[
                                        { value: 'name', label: 'Name' },
                                        { value: 'amount', label: 'Amount' },
                                        { value: 'recentlyAdded', label: 'Recently Added' },
                                    ]}
                                    value={sortBy}
                                    onChange={(value) => handleSortChange(value || 'name')}
                                    styles={{
                                        ...inputStyles,
                                        wrapper: { ...inputStyles.wrapper, width: '150px' },
                                    }}
                                />
                                <ActionIcon
                                    size={36}
                                    variant="outline"
                                    onClick={toggleSortOrder}
                                    style={{ marginLeft: '-1px', borderTopLeftRadius: 0, borderBottomLeftRadius: 0, backgroundColor: "#242424", color: "white" }}
                                >
                                    {sortOrder === 'asc' ? <IconArrowUp size={16} /> : <IconArrowDown size={16} />}
                                </ActionIcon>
                            </Group>
                        </Box>
                    </Flex>
                </Flex>
            ) : (
                // Narrow screen layout
                <Flex direction="column" gap="md">
                    <Box>
                        <Flex direction="column" gap="md">
                            <TextInput
                                size="sm"
                                value={searchTerm}
                                placeholder="Search items..."
                                onChange={(event) => setSearchTerm(event.currentTarget.value)}
                                onKeyUp={(event) => event.key === 'Enter' && handleSearch()}
                                styles={{
                                    ...inputStyles,
                                    root: { width: '100%' },
                                    input: { ...inputStyles.input, width: '100%' }
                                }}
                            />
                            <MultiSelect
                                placeholder={selectedCategories.length === 0 ? "Select categories..." : ""}
                                hidePickedOptions
                                size="sm"
                                data={categories.filter(Boolean).map(category => ({value: category, label: category}))}
                                value={selectedCategories}
                                onChange={(value) => setSelectedCategories(value || [])}
                                styles={{
                                    ...inputStyles,
                                    wrapper: {
                                        ...inputStyles.wrapper,
                                        width: '100%',
                                        height: 'auto', // Allow height to adjust automatically
                                        minHeight: '36px', // Set a minimum height
                                    },
                                    input: {
                                        ...inputStyles.input,
                                        height: 'auto', // Allow height to adjust automatically
                                        minHeight: '36px', // Set a minimum height
                                    },
                                }}
                            />
                            <Flex justify="space-between" align="center">
                                <Group>
                                    <ActionIcon
                                        size="lg"
                                        onClick={clearSearch}
                                        style={{backgroundColor: "#242424", color: "white"}}
                                    >
                                        <IconX size={20}/>
                                    </ActionIcon>
                                    <ActionIcon
                                        size="lg"
                                        onClick={handleSearch}
                                        style={{backgroundColor: "#3983F5", color: "white"}}
                                    >
                                        <IconSearch size={20}/>
                                    </ActionIcon>
                                </Group>

                                <Group gap={0} align="center">
                                    <Select
                                        size="sm"
                                        data={[
                                            {value: 'name', label: 'Name'},
                                            {value: 'amount', label: 'Amount'},
                                            {value: 'recentlyAdded', label: 'Recently Added'},
                                        ]}
                                        value={sortBy}
                                        onChange={(value) => handleSortChange(value || 'name')}
                                        styles={{
                                            ...inputStyles,
                                            wrapper: {...inputStyles.wrapper, width: '150px'},
                                        }}
                                    />
                                    <ActionIcon
                                        size={36}
                                        variant="outline"
                                        onClick={toggleSortOrder}
                                        style={{
                                            marginLeft: '-1px',
                                            borderTopLeftRadius: 0,
                                            borderBottomLeftRadius: 0,
                                            backgroundColor: "#242424",
                                            color: "white"
                                        }}
                                    >
                                        {sortOrder === 'asc' ? <IconArrowUp size={16}/> : <IconArrowDown size={16}/>}
                                    </ActionIcon>
                                </Group>
                            </Flex>
                            <SegmentedControl
                                value={currentView}
                                radius="lg"
                                onChange={handleViewChange}
                                data={[
                                    {label: 'Card', value: 'card'},
                                    {label: 'List', value: 'list'},
                                ]}
                                styles={segmentedControlStyle}
                            />
                        </Flex>
                    </Box>

                </Flex>
            )}
        </Box>
    );
};