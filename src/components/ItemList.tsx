import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { IconPencil, IconTrash, IconSettings } from "@tabler/icons-react";
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
} from "@mantine/core";

const ItemList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editedItem, setEditedItem] = useState<Item>({
    id: "",
    name: "",
    amount: "",
    categories: [], // Add categories array
  });
  const [isModalOpen, setIsModalOpen] = useState(false); // Add modal visibility state
  const [loading, setLoading] = useState(true);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const badgeColors = ['blue', 'green', 'yellow', 'red', 'pink', 'grape', 'violet', 'indigo', 'cyan', 'teal', 'orange', 'lime'];

  useEffect(() => {
    const fitText = () => {
      const elements = document.querySelectorAll('.item-name');
      elements.forEach((element) => {
        if (element instanceof HTMLElement) {
          let fontSize = 24; // Start with 1.5rem (24px)
          element.style.fontSize = `${fontSize}px`;

          while (element.scrollHeight > element.offsetHeight && fontSize > 12) {
            fontSize--;
            element.style.fontSize = `${fontSize}px`;
          }
        }
      });
    };

    fitText();
    window.addEventListener('resize', fitText);

    return () => window.removeEventListener('resize', fitText);
  }, [items]);

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

  const updateItem = async (item: Item) => {
    try {
      await updateDoc(doc(db, "items", item.id!), {
        name: item.name.trim(),
        amount: item.amount, // No need to trim as it's a number
      });
      setIsEditing(null);
      setEditedItem({ id: "", name: "", amount: "", categories: [] });
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };


  const handleEdit = useCallback((item: Item) => {
    setEditedItem(item);
    setIsModalOpen(true); // Open the modal
  }, []);

  const handleUpdate = useCallback(async () => {
    try {
      await updateDoc(doc(db, 'items', editedItem.id!), {
        name: editedItem.name.trim(),
        amount: editedItem.amount,
        categories: editedItem.categories,
      });
      setIsEditing(null);
      setEditedItem({ id: '', name: '', amount: '', categories: [] });
      setIsModalOpen(false); // Close the modal after updating
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  }, [editedItem]) // Exclude 'db' from the dependency array

  const handleAddCategory = (category: string) => {
    setEditedItem({ ...editedItem, categories: Array.isArray(editedItem.categories) ? [...editedItem.categories, category] : [category] });
  };

  const handleRemoveCategory = (index: number) => {
    const updatedCategories = Array.isArray(editedItem.categories) ? [...editedItem.categories] : [];
    updatedCategories.splice(index, 1);
    setEditedItem({ ...editedItem, categories: updatedCategories });
  };

  const memoizedItems = useMemo(() => {
    return items.map((item) => (
        <Grid.Col key={item.id} span={4} style={{ minWidth: 200 }}>
          <Card
              shadow="sm"
              p="md"
              radius="md"
              withBorder
              className="bg-[#242424] border-2 border-[#3b3b3b] text-gray-300 w-full relative shadow-4xl"
              style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            {isEditing === item.id && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-90 flex flex-col justify-center items-center p-4 z-10">
                  <TextInput
                      value={editedItem.name}
                      onChange={(e) =>
                          setEditedItem({ ...editedItem, name: e.target.value })
                      }
                      placeholder="Item name"
                      className="text-gray-900 flex-1 mb-4"
                  />
                  <NumberInput
                      value={parseFloat(editedItem.amount)}
                      onChange={(value) =>
                          setEditedItem({
                            ...editedItem,
                            amount: value?.toString() || "",
                          })
                      }
                      placeholder="Amount"
                      className="text-gray-900 flex-1 mb-4"
                  />
                  <Button onClick={handleUpdate} className="mt-4">
                    Update
                  </Button>
                </div>
            )}
            <Card.Section className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
              <h2
                  className="text-white item-name"
                  style={{
                    fontSize: '1.5rem',
                    lineHeight: 1.2,
                    maxHeight: '3.6rem',
                    overflow: 'hidden',
                    wordWrap: 'break-word',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
              >
                {item.name}
              </h2>
            </Card.Section>
            <Grid className="w-full" justify="space-between">
              <Grid.Col span={12}>
                <div className="flex-1">
                  <h3 className="text-gray-300">Amount: {item.amount}</h3>
                </div>
              </Grid.Col>
              <Grid.Col span={12}>
                <div className="flex flex-wrap gap-1">
                  {item.categories && item.categories.map((category, index) => (
                      <Badge
                          key={index}
                          color={badgeColors[index % badgeColors.length]}
                          variant="light"
                      >
                        {category}
                      </Badge>
                  ))}
                </div>
              </Grid.Col>
              <Grid.Col span={12} className="flex justify-end items-end">
                <Menu>
                  <Menu.Target>
                    <ActionIcon
                        variant="gradient"
                        size="xl"
                        gradient={{ from: "blue", to: "cyan", deg: 90 }}
                        className="cursor-pointer absolute bottom-2 right-2 hover:brightness-75"
                    >
                      <IconSettings size={24} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                        leftSection={
                          <IconPencil style={{ width: rem(14), height: rem(14) }} />
                        }
                        onClick={() => handleEdit(item)}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                        color="red"
                        leftSection={
                          <IconTrash style={{ width: rem(14), height: rem(14) }} />
                        }
                        onClick={() => deleteItem(item.id!)}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Grid.Col>
            </Grid>
          </Card>
        </Grid.Col>
    ));
  }, [items, handleEdit, isEditing, editedItem, handleUpdate, badgeColors]);

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
        <Modal opened={isModalOpen} size='auto' onClose={() => setIsModalOpen(false)}>
            <Grid>
              <Grid.Col span={12}>
                <TextInput
                    value={editedItem.name}
                    onChange={(e) =>
                        setEditedItem({ ...editedItem, name: e.target.value })
                    }
                    placeholder="Item name"
                    className="text-gray-900 flex-1 mb-4"
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <NumberInput
                    value={parseFloat(editedItem.amount)}
                    onChange={(value) =>
                        setEditedItem({
                          ...editedItem,
                          amount: value?.toString() || "",
                        })
                    }
                    placeholder="Amount"
                    className="text-gray-900 flex-1 mb-4"
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <div className="flex flex-wrap gap-1">
                  {editedItem.categories && editedItem.categories.map((category, index) => (
                      <Badge
                          key={index}
                          color={badgeColors[index % badgeColors.length]}
                          variant="light"
                          className="cursor-pointer"
                          onClick={() => handleRemoveCategory(index)}
                      >
                        {category}
                      </Badge>
                  ))}
                </div>
                <TextInput
                    placeholder="Add category"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory((e.target as HTMLInputElement).value)}
                    className="mt-2"
                />
              </Grid.Col>
            </Grid>
            <Button onClick={handleUpdate} className="mt-4">
              Update
            </Button>
        </Modal>
      </Grid>
  );
};

export default ItemList;