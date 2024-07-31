const LOCAL_STORAGE_KEY = 'categoryColors';

export const getLocalCategoryColors = (): Record<string, string> => {
    const storedColors = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedColors ? JSON.parse(storedColors) : {};
};

export const updateLocalCategoryColors = (updates: Record<string, string | null>) => {
    const currentColors = getLocalCategoryColors();
    Object.entries(updates).forEach(([category, color]) => {
        if (color === null) {
            delete currentColors[category];
        } else {
            currentColors[category] = color;
        }
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentColors));
};

export const getColorForCategory = (category: string, categoryColorMap: Map<string, string>): string => {
    const localColors = getLocalCategoryColors();
    if (localColors[category]) {
        return localColors[category];
    }
    if (!categoryColorMap.has(category)) {
        const newColor = generateBrightColor();
        categoryColorMap.set(category, newColor);
        updateLocalCategoryColors({ [category]: newColor });
    }
    return categoryColorMap.get(category)!;
};

const generateBrightColor = (): string => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 70 + Math.floor(Math.random() * 30); // 70-100%
    const lightness = 55 + Math.floor(Math.random() * 10);  // 55-65%

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};