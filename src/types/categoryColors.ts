export const categoryColors: { [key: string]: string } = {
    'Fruits': 'blue',
    'Vegetables': 'green',
    'Dairy': 'yellow',
    'Meat': 'red',
    'Grains': 'orange',
};

export const getColorForCategory = (category: string): string => {
    return categoryColors[category] || 'gray'; // Default to gray if no color is specified
};