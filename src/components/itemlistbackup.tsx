// import React, { useState, useCallback, useEffect, useMemo } from "react";
// import { CategoryCombobox } from "./CategoryCombobox";
// import { collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
// import { db } from "../firebase";
// import { IconPencil, IconTrash, IconSettings, IconX } from "@tabler/icons-react";
// import { Item } from "../types/item";
// import {
//     TextInput,
//     NumberInput,
//     Button,
//     Card,
//     Loader,
//     Grid,
//     Menu,
//     rem,
//     ActionIcon,
//     Badge,
//     Modal,
//     Text,
//     Transition,
// } from "@mantine/core";
//
// const ItemCard: React.FC<{ item: Item; onEdit: (item: Item) => void; onDelete: (id: string) => void; badgeColors: string[] }> = ({ item, onEdit, onDelete, badgeColors }) => {
//     const [isMenuOpen, setIsMenuOpen] = useState(false);
//
//     return (
//         <Card
//             shadow="sm"
//             p="md"
//             radius="md"
//             withBorder
//             className="bg-[#242424] border-2 border-[#3b3b3b] text-gray-300 w-full relative shadow-4xl"
//             style={{
//                 height: "200px",
//                 display: "flex",
//                 flexDirection: "column",
//             }}
//         >
//             <Card.Section className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
//                 <h2
//                     className="text-white item-name"
//                     style={{
//                         fontSize: "1.5rem",
//                         lineHeight: 1.2,
//                         maxHeight: "3.6rem",
//                         overflow: "hidden",
//                         wordWrap: "break-word",
//                         display: "-webkit-box",
//                         WebkitLineClamp: 2,
//                         WebkitBoxOrient: "vertical",
//                     }}
//                 >
//                     {item.name}
//                 </h2>
//             </Card.Section>
//             <div className="flex-wrap gap-2 mt-2 justify-start">
//                 {item.categories &&
//                     item.categories.map((category, index) => (
//                         <Badge
//                             key={index}
//                             color={badgeColors[index % badgeColors.length]}
//                             variant="light"
//                             className="cursor-pointer"
//                         >
//                             {category}
//                         </Badge>
//                     ))}
//             </div>
//             <div className="flex-grow"></div>
//             <Grid className="w-full" justify="space-between">
//                 <Grid.Col span={12}>
//                     <div className="flex-1">
//                         <h3 className="text-gray-300">Amount: {item.amount}</h3>
//                     </div>
//                 </Grid.Col>
//                 <Grid.Col span={12} className="flex justify-end items-end">
//                     <Menu
//                         opened={isMenuOpen}
//                         onChange={setIsMenuOpen}
//                         closeOnItemClick={false}
//                     >
//                         <Menu.Target>
//                             <ActionIcon
//                                 variant="gradient"
//                                 size="xl"
//                                 gradient={{ from: "blue", to: "cyan", deg: 90 }}
//                                 className="cursor-pointer absolute bottom-2 right-2 hover:brightness-75"
//                                 onClick={() => setIsMenuOpen((prev) => !prev)}
//                             >
//                                 <IconSettings size={24} />
//                             </ActionIcon>
//                         </Menu.Target>
//                         <Transition
//                             transition="pop-top-right"
//                             duration={200}
//                             mounted={isMenuOpen}
//                         >
//                             {(styles) => (
//                                 <Menu.Dropdown style={styles} className="bg-[#242424]">
//                                     <Menu.Item
//                                         leftSection={
//                                             <IconPencil style={{ width: rem(14), height: rem(14) }} />
//                                         }
//                                         className="cursor-pointer hover:bg-slate-500 hover:rounded-md text-white transition-colors duration-200"
//                                         onClick={() => {
//                                             onEdit(item);
//                                             setIsMenuOpen(false);
//                                         }}
//                                     >
//                                         Edit
//                                     </Menu.Item>
//                                     <Menu.Item
//                                         leftSection={
//                                             <IconTrash style={{ width: rem(14), height: rem(14) }} />
//                                         }
//                                         className="cursor-pointer hover:bg-red-600 hover:rounded-md text-red-500 hover:text-white transition-colors duration-200"
//                                         onClick={() => {
//                                             onDelete(item.id!);
//                                             setIsMenuOpen(false);
//                                         }}
//                                     >
//                                         Delete
//                                     </Menu.Item>
//                                 </Menu.Dropdown>
//                             )}
//                         </Transition>
//                     </Menu>
//                 </Grid.Col>
//             </Grid>
//         </Card>
//     );
// };
//
// const ItemList: React.FC = () => {
//     const [items, setItems] = useState<Item[]>([]);
//     const [isEditing, setIsEditing] = useState<string | null>(null);
//     const [editedItem, setEditedItem] = useState<Item>({
//         id: "",
//         name: "",
//         amount: "",
//         categories: [],
//     });
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [loading, setLoading] = useState(true);
//
//     const badgeColors = [
//         "blue",
//         "green",
//         "yellow",
//         "red",
//         "pink",
//         "grape",
//         "violet",
//         "indigo",
//         "cyan",
//         "teal",
//         "orange",
//         "lime",
//     ];
//
//     useEffect(() => {
//         const fitText = () => {
//             const elements = document.querySelectorAll(".item-name");
//             elements.forEach((element) => {
//                 if (element instanceof HTMLElement) {
//                     let fontSize = 24;
//                     element.style.fontSize = `${fontSize}px`;
//
//                     while (element.scrollHeight > element.offsetHeight && fontSize > 12) {
//                         fontSize--;
//                         element.style.fontSize = `${fontSize}px`;
//                     }
//                 }
//             });
//         };
//
//         fitText();
//         window.addEventListener("resize", fitText);
//
//         return () => window.removeEventListener("resize", fitText);
//     }, [items]);
//
//     useEffect(() => {
//         const q = collection(db, "items");
//         const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
//             const itemsArr: Item[] = [];
//             QuerySnapshot.forEach((doc) => {
//                 itemsArr.push({ ...(doc.data() as Item), id: doc.id });
//             });
//             setItems(itemsArr);
//             setLoading(false);
//         });
//         return () => unsubscribe();
//     }, []);
//
//     const deleteItem = async (id: string) => {
//         try {
//             await deleteDoc(doc(db, "items", id));
//         } catch (error) {
//             console.error("Error deleting document: ", error);
//         }
//     };
//
//     const handleEdit = useCallback((item: Item) => {
//         setEditedItem(item);
//         setIsModalOpen(true);
//     }, []);
//
//     const handleUpdate = useCallback(async () => {
//         try {
//             await updateDoc(doc(db, "items", editedItem.id!), {
//                 name: editedItem.name.trim(),
//                 amount: editedItem.amount,
//                 categories: editedItem.categories,
//             });
//             setIsEditing(null);
//             setEditedItem({ id: "", name: "", amount: "", categories: [] });
//             setIsModalOpen(false);
//         } catch (error) {
//             console.error("Error updating document: ", error);
//         }
//     }, [editedItem]);
//
//     const handleAddCategory = (category: string) => {
//         setEditedItem({
//             ...editedItem,
//             categories: Array.isArray(editedItem.categories)
//                 ? [...editedItem.categories, category]
//                 : [category],
//         });
//     };
//
//     const handleRemoveBadge = (index: number) => {
//         const updatedCategories = Array.isArray(editedItem.categories)
//             ? [...editedItem.categories]
//             : [];
//         updatedCategories.splice(index, 1);
//         setEditedItem({ ...editedItem, categories: updatedCategories });
//     };
//
//     const memoizedItems = useMemo(() => {
//         return items.map((item) => (
//             <Grid.Col key={item.id} span={4} style={{ minWidth: 200 }}>
//                 <ItemCard
//                     item={item}
//                     onEdit={handleEdit}
//                     onDelete={deleteItem}
//                     badgeColors={badgeColors}
//                 />
//             </Grid.Col>
//         ));
//     }, [items, handleEdit, deleteItem, badgeColors]);
//
//     if (loading) {
//         return (
//             <div className="flex justify-center items-center h-full">
//                 <Loader color="indigo" size="lg" />
//             </div>
//         );
//     }
//
//     return (
//         <Grid className="w-full">
//             {memoizedItems}
//
//             <Modal
//                 opened={isModalOpen}
//                 size="md"
//                 onClose={() => setIsModalOpen(false)}
//                 classNames={{
//                     overlay: "bg-[#1A1B1E] bg-opacity-55 backdrop-blur-sm",
//                     header: "bg-[#242424]",
//                     body: "bg-[#242424]",
//                     close: "text-[#C1C2C5]",
//                     title: "text-2xl font-bold",
//                 }}
//                 title={`Update ${editedItem.name}`}
//             >
//                 <Grid>
//                     <Grid.Col span={12}>
//                         <Text className="text-white mb-2">Name:</Text>
//                         <TextInput
//                             value={editedItem.name}
//                             onChange={(e) =>
//                                 setEditedItem({ ...editedItem, name: e.target.value })
//                             }
//                             placeholder="Item name"
//                             className="text-white "
//                             styles={{ input: { backgroundColor: "#242424", color: "white" } }}
//                         />
//                     </Grid.Col>
//                     <Grid.Col span={12}>
//                         <Text className="text-white mb-2">Amount:</Text>
//                         <NumberInput
//                             value={parseFloat(editedItem.amount)}
//                             onChange={(value) =>
//                                 setEditedItem({
//                                     ...editedItem,
//                                     amount: value?.toString() || "",
//                                 })
//                             }
//                             placeholder="Amount"
//                             classNames={{
//                                 input: "bg-[#242424] text-white placeholder-gray-400",
//                                 control: "text-white hover:bg-[#3b3b3b]",
//                             }}
//                         />
//                     </Grid.Col>
//                     <Grid.Col span={12}>
//                         <Text className="text-white mb-2">Categories:</Text>
//                         <CategoryCombobox onCategorySelect={handleAddCategory} />
//                     </Grid.Col>
//                     <Grid.Col span={12}>
//                         <div className="flex flex-wrap gap-2">
//                             {editedItem.categories &&
//                                 editedItem.categories.map((category, index) => (
//                                     <Badge
//                                         key={index}
//                                         color={badgeColors[index % badgeColors.length]}
//                                         variant="light"
//                                         className="cursor-pointer relative group"
//                                         rightSection={
//                                             <IconX
//                                                 size={14}
//                                                 onClick={(e) => {
//                                                     e.stopPropagation();
//                                                     handleRemoveBadge(index);
//                                                 }}
//                                                 style={{ cursor: 'pointer' }}
//                                             />
//                                         }
//                                         onClick={() => handleRemoveBadge(index)}
//                                     >
//                                         <span className="z-10 relative">{category}</span>
//                                         <div className="absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-30 transition-opacity duration-200 rounded pointer-events-none"></div>
//                                     </Badge>
//                                 ))}
//                         </div>
//
//                         <Button
//                             variant="gradient"
//                             gradient={{ from: 'blue', to: 'cyan' }}
//                             fullWidth
//                             onClick={handleUpdate}
//                             className="mt-4"
//                         >
//                             Update Item
//                         </Button>
//                     </Grid.Col>
//                 </Grid>
//             </Modal>
//         </Grid>
//     );
// };
//
// export default ItemList;