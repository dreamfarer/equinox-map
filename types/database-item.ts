export type DatabaseItem = {
    name: string;
    id: string;
    category: string;
    statsAmount?: number;
    statsType?: string;
    level?: number;
    faction?: string;
    cost?: number;
    currency?: string;
    shop?: string;
    upgradeAmount?: number;
    upgradeItem?: string;
    imagePath: string;
};
