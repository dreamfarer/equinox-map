export type Popups = Record<string, CategoryPayloads>;
export type CategoryPayloads = Record<string, ItemPayload[]>;
export type ItemPayload = { title: string; subtitle?: string };
