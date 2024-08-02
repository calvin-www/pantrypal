import React, { useState, useEffect, useCallback } from "react";
import { Grid, Loader } from "@mantine/core";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { Item } from "../types/item";
import { getLocalCategoryColors } from "../utils/categoryColorutils";
import { ItemCard } from "./ItemCard";
import EditModal from "./EditModal";

interface ItemListProps {
  initialItems: Item[];
  isCardView: boolean;
  sortOption: string;
}

const ItemList: React.FC<ItemListProps> = ({ initialItems }) => {
    const [editedItem, setEditedItem] = useState<Item>({
        id: "",
        name: "",
        amount: "",
        categories: [],
        createdAt: "",
    });
        const [items, setItems] = useState<Item[]>(initialItems);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [loading, ] = useState(false);
        const [isWideScreen, setIsWideScreen] = useState(false);

    const [, setCategoryColorMap] = useState<Map<string, string>>(
        new Map(),
    );

    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    useEffect(() => {
        const localColors = getLocalCategoryColors();
        setCategoryColorMap(new Map(Object.entries(localColors)));
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 768px)');
        setIsWideScreen(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setIsWideScreen(e.matches);
        mediaQuery.addEventListener('change', handler);

        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

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


    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader color="indigo" size="lg" />
            </div>
        );
    }
    const renderWideScreenView = () => (
        <Grid>
            {items.map((item) => (
                <Grid.Col key={item.id} span={4} style={{ minWidth: 200 }}>
                    <ItemCard
                        item={item}
                        onEdit={handleEdit}
                        onDelete={deleteItem}
                    />
                </Grid.Col>
            ))}
        </Grid>
    );

    const renderNarrowScreenView = () => (
        <div className="space-y-4">
            {items.map((item) => (
                <ItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={deleteItem}
                    isNarrowScreen={true}
                />
            ))}
        </div>
    );
    return (
        <div className="w-full">
            {isWideScreen ? renderWideScreenView() : renderNarrowScreenView()}

            <EditModal
                item={editedItem}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
            />
        </div>
    );
}
export default ItemList;