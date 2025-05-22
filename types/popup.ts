export type TPopups = Record<string, TCategoryPayloads>;
export type TCategoryPayloads = Record<string, Record<string, TItemPayload>>;
export type TItemPayload = { title: string; subtitle?: string };
