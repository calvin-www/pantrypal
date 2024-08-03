import React from 'react';
import { Table, Checkbox, Button } from '@mantine/core';

interface RecognizedItem {
  name: string;
  confidence: number;
}

interface RecognizedItemsTableProps {
  items: RecognizedItem[];
  onConfirm: (selectedItems: RecognizedItem[]) => void;
  onCancel: () => void;
}

export const RecognizedItemsTable: React.FC<RecognizedItemsTableProps> = ({ items, onConfirm, onCancel }) => {
  const [selectedItems, setSelectedItems] = React.useState<RecognizedItem[]>([]);

  const toggleItem = (item: RecognizedItem) => {
    setSelectedItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  return (
    <div>
      <Table>
        <thead>
          <tr>
            <th>Select</th>
            <th>Item Name</th>
            <th>Confidence</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td><Checkbox checked={selectedItems.includes(item)} onChange={() => toggleItem(item)} /></td>
              <td>{item.name}</td>
              <td>{(item.confidence * 100).toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="flex justify-end mt-4">
        <Button onClick={onCancel} variant="outline" className="mr-2">Cancel</Button>
        <Button onClick={() => onConfirm(selectedItems)}>Confirm</Button>
      </div>
    </div>
  );
};