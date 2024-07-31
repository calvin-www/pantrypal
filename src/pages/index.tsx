import React, { useState, useCallback, useEffect } from "react";
import {
  Container,
  Paper,
  Grid,
  SimpleGrid,
  Stack,
  ScrollArea,
  Switch,
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
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [isCardView, setIsCardView] = useState(true);
  const [sortOption, setSortOption] = useState<string>('name');
  const { width } = useViewportSize();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "items"), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Item));
      setAllItems(items);
      setFilteredItems(items);
    });

    return () => unsubscribe();
  }, []);

  const handleAddItem = () => {
    setRefresh(!refresh);
  };

  useEffect(() => {
    const handleResize = () => {
      const newIsCardView = width >= 768 && filteredItems.length <= 12;
      setIsCardView(newIsCardView);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [filteredItems.length, width]);

  const handleSearch = useCallback((searchTerm: string, selectedCategories: string[]) => {
    const filtered = allItems.filter(item => {
      const matchesSearchTerm = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 ||
          item.categories.some(category => selectedCategories.includes(category.name));
      return matchesSearchTerm && matchesCategory;
    });

    setFilteredItems(filtered);
  }, [allItems]);

  const handleViewChange = (view: 'card' | 'list') => {
    setIsCardView(view === 'card');
  };

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
                        onSearch={handleSearch}
                        onViewChange={handleViewChange}
                        onSortChange={(sortBy, sortOrder) => {
                          setSortOption(sortBy);
                        }}
                        currentView={isCardView ? 'card' : 'list'}
                    />
                  </Box>
                  <Box className="bg-[#2c2c2c] p-4 rounded-lg flex-grow overflow-hidden">
                    <ScrollArea style={{height: '100%'}} type="scroll" scrollbarSize={10} scrollHideDelay={1500}>
                      {isCardView ? (
                          <ItemList
                              key={refresh.toString()}
                              initialItems={filteredItems}
                              isCardView={true}
                              sortOption={sortOption}
                          />
                      ) : (
                          <TableView
                              items={filteredItems}
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
                  <InputForm onAdd={handleAddItem}/>
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