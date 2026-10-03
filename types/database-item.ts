/** A way to obtain an item, as offered by one shop. */
export type DatabaseListing = {
    shop: string;
    faction?: string;
    level?: number;
    bundle?: string;
    cost: number;
    currency: string;
};

export type DatabaseItem = {
    id: string;
    name: string;
    type: string;
    statsAmount?: number;
    statsType?: string;
    upgradeAmount?: number;
    upgradeItem?: string;
    colours?: string[];
    imagePath?: string;
    listings: DatabaseListing[];
    /** Whether the item can currently be obtained through any of its listings. */
    available: boolean;
};
