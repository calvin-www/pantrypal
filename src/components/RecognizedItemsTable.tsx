import React, { useState, useEffect } from 'react';
import { Table, Checkbox, ActionIcon, Modal } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import EditModal from "./EditModal"
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

interface RecognizedItem {
  name: string;
  amount: string;
  categories: { name: string; color: string }[];
}

interface RecognizedItemsTableProps {
  items: RecognizedItem[];
  onConfirm: (items: RecognizedItem[]) => void;
  onCancel: () => void;
}

export const RecognizedItemsTable: React.FC<RecognizedItemsTableProps> = ({ items, onConfirm, onCancel }) => {
  const [selectedItems, setSelectedItems] = useState<RecognizedItem[]>(items);
  const [editingItem, setEditingItem] = useState<RecognizedItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [existingCategories, setExistingCategories] = useState<{ name: string; color: string }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesCollection = collection(db, 'categories');
      const categoriesSnapshot = await getDocs(categoriesCollection);
      const categoriesList = categoriesSnapshot.docs.map(doc => ({ name: doc.data().name, color: doc.data().color }));
      setExistingCategories(categoriesList);
    };
    fetchCategories();
  }, []);

  const toggleItem = (item: RecognizedItem) => {
    setSelectedItems(prev =>
        prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleEdit = (item: RecognizedItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleEditSave = (updatedItem: RecognizedItem) => {
    setSelectedItems(prev => prev.map(item => item === editingItem ? updatedItem : item));
    setIsEditModalOpen(false);
  };

  return (
      <>
        <Table>
          <thead>
          <tr>
            <th>Select</th>
            <th>Name</th>
            <th>Amount</th>
            <th>Categories</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          {items.map((item, index) => (
              <tr key={index}>
                <td>
                  <Checkbox
                      checked={selectedItems.includes(item)}
                      onChange={() => toggleItem(item)}
                  />
                </td>
                <td>{item.name}</td>
                <td>{item.amount}</td>
                <td>{item.categories.map(cat => cat.name).join(', ')}</td>
                <td>
                  <ActionIcon onClick={() => handleEdit(item)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                </td>
              </tr>
          ))}
          </tbody>
        </Table>

        <Modal
            opened={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            title="Edit Item"
        >
          {editingItem && (
              <EditModal
                  item={editingItem}
                  isModalOpen={isEditModalOpen}
                  setIsModalOpen={setIsEditModalOpen}
                  onSave={handleEditSave}
                  existingCategories={existingCategories}
              />
          )}
        </Modal>

        <button onClick={() => onConfirm(selectedItems)}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </>
  );
};