import React from 'react';
import { List, Button } from '@mantine/core';

interface DatabaseOperation {
    type: 'add' | 'remove' | 'update';
    item: string;
    quantity?: number;
}

interface OperationSummaryProps {
    operations: DatabaseOperation[];
    onConfirm: () => void;
    onCancel: () => void;
}

export const OperationSummary: React.FC<OperationSummaryProps> = ({ operations, onConfirm, onCancel }) => {
    return (
        <div>
            <h2>Operation Summary</h2>
            <List>
                {operations.map((op, index) => (
                    <List.Item key={index}>
                        {op.type} {op.item} {op.quantity && `(Quantity: ${op.quantity})`}
                    </List.Item>
                ))}
            </List>
            <div className="flex justify-end mt-4">
                <Button onClick={onCancel} variant="outline" className="mr-2">Cancel</Button>
                <Button onClick={onConfirm}>Confirm and Execute</Button>
            </div>
        </div>
    );
};