export const setItemInLocalStorage = (key: string, value: unknown): void => {
  if (typeof value === 'string') {
    localStorage.setItem(key, value);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

export const getItemInLocalStorage = <T = unknown>(key: string): T | null => {
  const item = localStorage.getItem(key);
  if (item === null) return null;
  try {
    return JSON.parse(item) as T;
  } catch {
    // Return as string if not valid JSON
    return item as unknown as T;
  }
};
