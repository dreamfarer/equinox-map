type FiddlerEntry = {
    name: string;
    level?: number;
    faction?: string;
    cost?: number;
    currency?: string;
    shop?: string;
};

export type FiddlerExportParsed = Record<string, FiddlerEntry>;

export type Entry = {
    entity_name: string;
    entity_kind: string;
    prices: {
        currency_code: string;
        amount: number;
    }[];
};

export type FiddlerExport = {
    entries: Entry[];
    catalog: {
        key: string;
    };
};
