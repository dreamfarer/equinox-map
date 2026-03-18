export type DatabaseItem = {
    name: string;
    id: string;
    type: string;
    statsAmount?: number;
    statsType?: string;
    level?: number;
    faction?: string;
    cost?: number;
    currency?: string;
    shop?: string;
    colours?: string[];
    upgradeAmount?: number;
    upgradeItem?: string;
    imagePath: string;
};

export type DatabaseItemFields = keyof DatabaseItem;

export const databaseItemFields = [
    'name',
    'id',
    'type',
    'statsAmount',
    'statsType',
    'level',
    'faction',
    'cost',
    'currency',
    'shop',
    'colours',
    'upgradeAmount',
    'upgradeItem',
    'imagePath',
] as const;
