import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Grid, Loader } from "@mantine/core";
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Item } from "../types/item";
import { getColorForCategory, updateLocalCategoryColors, getLocalCategoryColors } from "../utils/categoryColorutils";
import { ItemCard } from "./ItemCard";
import EditModal from "./EditModal";

interface ItemListProps {
  initialItems: Item[];
  isCardView: boolean;
  sortOption: string;
}

const ItemList: React.FC<ItemListProps> = ({ initialItems, isCardView, sortOption }) => {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [editedItem, setEditedItem] = useState<Item>({
    id: "",
    name: "",
    amount: "",
    categories: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categoryColorMap, setCategoryColorMap] = useState<Map<string, string>>(
    new Map(),
  );


    useEffect(() => {
        const localColors = getLocalCategoryColors();
        setCategoryColorMap(new Map(Object.entries(localColors)));
    }, []);

    useEffect(() => {
        const q = collection(db, "items");
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const itemsArr: Item[] = [];
            const newColors: { [key: string]: string } = {};

            snapshot.forEach((doc) => {
                const item = doc.data() as Omit<Item, 'id'>;
                const categories = Array.isArray(item.categories)
                    ? item.categories.map(category => {
                        if (typeof category === 'string') {
                            const color = categoryColorMap.get(category) || getColorForCategory(category, categoryColorMap);
                            newColors[category] = color;
                            return { name: category, color };
                        }
                        return category;
                    })
                    : [];

                itemsArr.push({
                    ...item,
                    id: doc.id,
                    categories: categories,
                });
            });

            setItems(itemsArr);
            updateLocalCategoryColors(newColors);
            setCategoryColorMap(new Map(Object.entries(newColors)));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [categoryColorMap]);

  const deleteItem = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, "items", id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  }, []);

  const handleEdit = useCallback((item: Item) => {
    setEditedItem({ ...item });
    setIsModalOpen(true);
  }, []);

  const memoizedItems = useMemo(() => {
    return items.map((item) => (
        <Grid.Col key={item.id} span={4} style={{ minWidth: 200 }}>
          <ItemCard
              item={item}
              onEdit={handleEdit}
              onDelete={deleteItem}
          />
        </Grid.Col>
    ));
  }, [items, handleEdit, deleteItem]);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-full">
          <Loader color="indigo" size="lg" />
        </div>
    );
  }
  return (
      <div className="w-full">
        <Grid>
          {memoizedItems}
        </Grid>

        <EditModal
            item={editedItem}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
        />
      </div>
  );
};

export default ItemList;