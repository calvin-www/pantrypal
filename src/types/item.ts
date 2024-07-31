export interface Item {
    id: string;
    name: string;
    amount: string;
    categories: Array<{ name: string; color: string }>;
}