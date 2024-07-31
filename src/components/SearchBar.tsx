import React, { useState } from 'react';
import { TextInput, Select, Group } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { Item } from "../types/item";

interface SearchBarProps {
    onSearch: (searchText: string, selectedBadge: string | null) => void;
    badges: string[];
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, badges }) => {
    const [searchText, setSearchText] = useState('');
    const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

    const handleSearch = (text: string) => {
        setSearchText(text);
        onSearch(text, selectedBadge);
    };

    const handleBadgeSelect = (badge: string | null) => {
        setSelectedBadge(badge);
        onSearch(searchText, badge);
    };

    return (
        <Group align="flex-start" className="mb-4">
            <TextInput
                placeholder="Search items..."
                value={searchText}
                onChange={(event) => handleSearch(event.currentTarget.value)}
                className="flex-grow"
                leftSection={<IconSearch size={16} />}
                styles={{
                    input: {
                        backgroundColor: '#242424',
                        color: 'white',
                        border: '2px solid #3b3b3b',
                    },
                    section: { color: 'white' },
                }}
            />
            <Select
                placeholder="Filter by badge"
                value={selectedBadge}
                onChange={handleBadgeSelect}
                data={[{ value: '', label: 'All' }, ...badges.map(badge => ({ value: badge, label: badge }))]}
                clearable
                className="w-48"
                styles={(theme) => ({
                input: {
                    backgroundColor: '#242424',
                    color: 'white',
                    border: '2px solid #3b3b3b',
                },
                dropdown: {
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #3b3b3b',
                },
                item: {
                    '&[data-selected]': {
                        '&, &:hover': {
                            backgroundColor: '#2c2c2c',
                            color: 'white',
                        },
                    },
                    '&[data-hovered]': {
                        backgroundColor: '#2c2c2c',
                    },
                },
            })}
                />
        </Group>
    );
};