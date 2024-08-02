export interface Item {
    id?: string;
    name: string;
    amount: string;
    categories: { name: string; color: string }[];
    createdAt: string;
}