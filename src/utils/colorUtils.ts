export const generateRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 50%)`;
};

export const getColorForCategory = (category: string, colorMap: Map<string, string>) => {
    if (!colorMap.has(category)) {
        colorMap.set(category, generateRandomColor());
    }
    return colorMap.get(category)!;
};