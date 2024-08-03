import React from 'react';
import { Table, Badge, Button } from '@mantine/core';

interface RecognizedItemsTableProps {
  items: any[];
  onConfirm: (items: any[]) => void;
  onCancel: () => void;
}

export const RecognizedItemsTable: React.FC<RecognizedItemsTableProps> = ({ items, onConfirm, onCancel }) => {
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
                  <Table.Td>{item.name}</Table.Td>
                  <Table.Td>{parseFloat(item.amount) || item.amount}</Table.Td>
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
                </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        <div className="flex justify-end mt-4">
          <Button onClick={() => onConfirm(items)} className="mr-2">
            Confirm
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </>
  );
};