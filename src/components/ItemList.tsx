import React, { useState, useCallback, useEffect, useMemo } from "react";
import { CategoryCombobox } from "./CategoryCombobox";
import { collection, onSnapshot, deleteDoc, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { IconPencil, IconTrash, IconSettings, IconX } from "@tabler/icons-react";
import { Item } from "../types/item";
import {
  TextInput,
  NumberInput,
  Button,
  Card,
  Loader,
  Grid,
  Menu,
  rem,
  ActionIcon,
  Badge,
  Modal,
  Text,
  Transition,
} from "@mantine/core";

const ItemList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [editedItem, setEditedItem] = useState<Item>({
    id: "",
    name: "",
    amount: "",
    categories: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = collection(db, "items");
    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      const itemsArr: Item[] = [];
      QuerySnapshot.forEach((doc) => {
        itemsArr.push({ ...(doc.data() as Item), id: doc.id });
      });
      setItems(itemsArr);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "items", id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleEdit = useCallback((item: Item) => {
    setEditedItem(item);
    setIsModalOpen(true);
  }, []);

  const handleUpdate = useCallback(async () => {
    try {
      await updateDoc(doc(db, "items", editedItem.id!), {
        name: editedItem.name.trim(),
        amount: editedItem.amount,
        categories: editedItem.categories,
      });
      setEditedItem({ id: "", name: "", amount: "", categories: [] });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  }, [editedItem]);

  const handleAddCategory = (category: string) => {
    if (category && typeof category === 'string') {
      setEditedItem({
        ...editedItem,
        categories: Array.isArray(editedItem.categories)
            ? [...editedItem.categories, category]
            : [category],
      });
    }
  };

  const handleRemoveBadge = (index: number) => {
    const updatedCategories = Array.isArray(editedItem.categories)
        ? [...editedItem.categories]
        : [];
    updatedCategories.splice(index, 1);
    setEditedItem({ ...editedItem, categories: updatedCategories });
  };

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
      <Grid className="w-full">
        {memoizedItems}

        <Modal
            opened={isModalOpen}
            size="md"
            onClose={() => setIsModalOpen(false)}
            classNames={{
              overlay: "bg-[#1A1B1E] bg-opacity-55 backdrop-blur-sm",
              header: "bg-[#242424]",
              body: "bg-[#242424]",
              close: "text-[#C1C2C5]",
              title: "text-2xl font-bold",
            }}
            title={`Update ${editedItem.name}`}
        >
          <Grid>
            <Grid.Col span={12}>
              <Text className="text-white mb-2">Name:</Text>
              <TextInput
                  value={editedItem.name}
                  onChange={(e) =>
                      setEditedItem({ ...editedItem, name: e.target.value })
                  }
                  placeholder="Item name"
                  className="text-white"
                  styles={{ input: { backgroundColor: "#242424", color: "white" } }}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Text className="text-white mb-2">Amount:</Text>
              <NumberInput
                  value={parseFloat(editedItem.amount)}
                  onChange={(value) =>
                      setEditedItem({
                        ...editedItem,
                        amount: value?.toString() || "",
                      })
                  }
                  placeholder="Amount"
                  classNames={{
                    input: "bg-[#242424] text-white placeholder-gray-400",
                    control: "text-white hover:bg-[#3b3b3b]",
                  }}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Text className="text-white mb-2">Categories:</Text>
              <CategoryCombobox onCategorySelect={handleAddCategory} />
            </Grid.Col>
            <Grid.Col span={12}>
              <div className="flex flex-wrap gap-2">
                {editedItem.categories &&
                    editedItem.categories.map((category, index) => (
                        <Badge
                            key={index}
                            color={category.color}
                            variant="light"
                            className="cursor-pointer relative group"
                            rightSection={
                              <IconX
                                  size={14}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveBadge(index);
                                  }}
                                  style={{ cursor: 'pointer' }}
                              />
                            }
                            onClick={() => handleRemoveBadge(index)}
                        >
                          <span className="z-10 relative">{category.name}</span>
                          <div className="absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-30 transition-opacity duration-200 rounded pointer-events-none"></div>
                        </Badge>
                    ))}
              </div>

              <Button
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan' }}
                  fullWidth
                  onClick={handleUpdate}
                  className="mt-4"
              >
                Update Item
              </Button>
            </Grid.Col>
          </Grid>
        </Modal>
      </Grid>
  );
};

export default ItemList;