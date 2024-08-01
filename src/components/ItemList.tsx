import React, { useState, useEffect, useCallback, useMemo } from "react";
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
    const [items, setItems] = useState<Item[]>(initialItems);
    const [editedItem, setEditedItem] = useState<Item>({
        id: "",
        name: "",
        amount: "",
        categories: [],
        createdAt: "",
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categoryColorMap, setCategoryColorMap] = useState<Map<string, string>>(
        new Map(),
    );

    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    useEffect(() => {
        const localColors = getLocalCategoryColors();
        setCategoryColorMap(new Map(Object.entries(localColors)));
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
}
export default ItemList;