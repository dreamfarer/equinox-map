export type TCategoryPayloads = Record<
  string,
  Record<string, { title: string; subtitle?: string }>
>;
export type TPopups = Record<string, TCategoryPayloads>;
