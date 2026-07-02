type FiddlerEntry = {
    level?: number;
    faction?: string;
    cost?: number;
    currency?: string;
    shop?: string;
    bundle?: string;
    type?: string;
    upgradeItem?: string;
    statsType?: string;
    name?: string;
    imagePath?: string;
};

export type FiddlerExportParsed = Record<string, FiddlerEntry>;

export type Entry = {
    entity_name: string;
    entity_kind: string;
    catalog_listing_id: string;
    prices: {
        currency_code: string;
        amount: number;
    }[];
};

export type AssetDetail = {
    name: string;
    catalog_listing_id: string;
    legacy_id: number;
};

export type FiddlerExport = {
    entries: Entry[];
    assets_details: AssetDetail[];
    catalog: {
        key: string;
    };
};
