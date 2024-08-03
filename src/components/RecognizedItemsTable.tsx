import React, {useState} from 'react';
import { Table, Badge, Button, ActionIcon } from '@mantine/core';
import {IconPencil, IconTrash } from '@tabler/icons-react';
import  EditModal  from './EditModal';

interface RecognizedItemsTableProps {
  items: any[];
  onConfirm: (items: any[]) => void;
  onCancel: () => void;
}

export const RecognizedItemsTable: React.FC<RecognizedItemsTableProps> = ({ items, onConfirm, onCancel }) => {
    const [editableItems, setEditableItems] = useState(items);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const handleEdit = (index: number) => {
        setEditingItem(editableItems[index]);
        setEditModalOpen(true);
    };

    const handleSave = async (updatedItem: any): Promise<void> => {
        setEditableItems(currentItems =>
            currentItems.map((item, idx) => idx === editableItems.indexOf(editingItem) ? updatedItem : item)
        );
        setEditModalOpen(false);
    };

    const handleDelete = (index: number) => {
        setEditableItems(currentItems => currentItems.filter((_, i) => i !== index));
    };


    return (
      <>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Categories</Table.Th>
            </Table.Tr>
          </Table.Thead>
<Table.Tbody>
  {items.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>{item.name.replace(/^- /, '')}</Table.Td>
      <Table.Td>
        {(() => {
          const amountMatch = item.name.match(/\((\d+(?:\.\d+)?)\)$/);
          if (amountMatch) {
            return parseFloat(amountMatch[1]);
          }
          const numericAmount = parseFloat(item.amount);
          return !isNaN(numericAmount) ? numericAmount : item.amount.split(' ')[0];
        })()}
      </Table.Td>
      <Table.Td>
        {item.categories.map((category: any, catIndex: number) => (
          <Badge
            key={catIndex}
            color={category.color}
            variant="light"
            className="mr-1 mb-1"
          >
            {category.name}
          </Badge>
        ))}
      </Table.Td>
      <Table.Td>
        <ActionIcon onClick={() => handleEdit(index)} className="mr-2">
          <IconPencil size={18} />
        </ActionIcon>
        <ActionIcon onClick={() => handleDelete(index)} color="red">
          <IconTrash size={18} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ))}
</Table.Tbody>
        </Table>

        <div className="flex justify-end mt-4">
            <Button onClick={() => onConfirm(editableItems)} className="mr-2">
                Confirm
            </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
          <EditModal
              item={editingItem}
              isModalOpen={editModalOpen}
              setIsModalOpen={setEditModalOpen}
              onSave={handleSave}
              existingCategories={[]}
          />
      </>
  );
};