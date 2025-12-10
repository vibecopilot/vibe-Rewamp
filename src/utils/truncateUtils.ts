export const truncateText = (text: string | undefined, length: number): string => {
  return text && text.length > length ? text.slice(0, length) + "..." : text || "";
};
