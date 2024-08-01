import React, { useState, useCallback, useEffect } from "react";
import {
  Paper,
  SimpleGrid,
  Stack,
  ScrollArea,
  Box
} from "@mantine/core";
import InputForm from "../components/InputForm";
import ItemList from "../components/ItemList";
import { SearchBar } from "../components/SearchBar";
import { TableView } from "../components/TableView";
import { Item } from "../types/item";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useViewportSize } from '@mantine/hooks';

function Home() {
  const [refresh, setRefresh] = useState(false);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [filteredAndSortedItems, setFilteredAndSortedItems] = useState<Item[]>([]);
  const [sortOption, setSortOption] = useState<string>('name');
  const [isCardView, setIsCardView] = useState(true);
  const { width } = useViewportSize();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "items"), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Item));
      setAllItems(items);
      const sortedItems = [...items].sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const bDate = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return bDate.getTime() - aDate.getTime();
      });
      setFilteredAndSortedItems(sortedItems);
    });

    return () => unsubscribe();
  }, []);

  const handleItemChange = useCallback(() => {
    setRefresh(prev => !prev);
  }, []);

  const handleViewChange = useCallback((view: 'card' | 'list') => {
    setIsCardView(view === 'card');
  }, []);

  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (!initialLoadComplete) {
        if (window.innerWidth >= 768) {
          setIsCardView(filteredAndSortedItems.length <= 12);
        } else {
          setIsCardView(false);
        }
        setInitialLoadComplete(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [filteredAndSortedItems.length, initialLoadComplete]);

  const handleSearchAndSort = useCallback((searchTerm: string, selectedCategories: string[], sortBy: string, sortOrder: 'asc' | 'desc') => {
    let filtered = allItems.filter(item => {
      const matchesSearchTerm = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 ||
          item.categories.some(category => selectedCategories.includes(category.name));
      return matchesSearchTerm && matchesCategory;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'recentlyAdded') {
        const aDate = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const bDate = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return sortOrder === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      } else {
        const aValue = a[sortBy as keyof Item];
        const bValue = b[sortBy as keyof Item];
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      }
    });

    setFilteredAndSortedItems(filtered);
    setSortOption(sortBy);
  }, [allItems]);

  return (
      <div className="bg-[#1f1f1f] min-h-screen flex flex-col">
        <div className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
          <h1 className="text-2xl font-bold text-white max-w-[1400px] mx-auto px-4">Item Tracker!!</h1>
        </div>
        <div className="flex-grow flex justify-center items-start py-4">
          <div className="w-full max-w-[1400px] px-4">
            <SimpleGrid cols={{base: 1, md: 4}} spacing="md">
              <Paper
                  shadow="lg"
                  radius="lg"
                  p="xl"
                  className="bg-[#242424] border-2 border-[#3b3b3b] col-span-3"
                  style={{height: 'calc(100vh - 8rem)'}}
              >
                <Stack gap="md" style={{height: '100%'}}>
                  <Box className="bg-[#2c2c2c] p-4 rounded-lg">
                    <SearchBar
                        onSearchAndSort={handleSearchAndSort}
                        onViewChange={handleViewChange}
                        onSortChange={(sortBy, sortOrder) => {
                          setSortOption(sortBy);
                          handleSearchAndSort('', [], sortBy, sortOrder);
                        }}
                        currentView={isCardView ? 'card' : 'list'}
                    />
                  </Box>
                  <Box className="bg-[#2c2c2c] p-4 rounded-lg flex-grow overflow-hidden">
                    <ScrollArea style={{height: '100%'}} type="scroll" scrollbarSize={10} scrollHideDelay={1500}>
                      {isCardView ? (
                          <ItemList
                              key={refresh.toString()}
                              initialItems={filteredAndSortedItems}
                              isCardView={true}
                              sortOption={sortOption}
                          />
                      ) : (
                          <TableView
                              items={filteredAndSortedItems}
                              filteredItems={filteredAndSortedItems}
                              onItemsChange={() => setRefresh(!refresh)}
                          />
                      )}
                    </ScrollArea>
                  </Box>
                </Stack>
              </Paper>

              <Stack>
                <Paper
                    shadow="lg"
                    radius="lg"
                    p="xl"
                    className="bg-[#242424] border-2 border-[#3b3b3b]"
                >
                  <InputForm onAdd={handleItemChange}/>
                </Paper>
                <Paper
                    shadow="lg"
                    radius="lg"
                    p="xl"
                    className="bg-[#242424] border-2 border-[#3b3b3b]"
                >
                  {/* Additional content */}
                </Paper>
                <Paper
                    shadow="lg"
                    radius="lg"
                    p="xl"
                    className="bg-[#242424] border-2 border-[#3b3b3b]"
                >
                  {/* Additional content */}
                </Paper>
              </Stack>
            </SimpleGrid>
          </div>
        </div>
      </div>
  );
}

export default Home;