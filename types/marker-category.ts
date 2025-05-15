export const markerCategories = ['characters', 'vendors'] as const;
export type MarkerCategory = (typeof markerCategories)[number];
