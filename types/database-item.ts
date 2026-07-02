export type DatabaseItem = {
    name: string;
    id: number;
    type: string;
    statsType?: string;
    level?: number;
    faction?: string;
    cost?: number;
    currency?: string;
    shop?: string;
    bundle?: string;
    colour?: string;
    colours?: string[];
    upgradeItem?: string;
    imagePath: string;
};

export type DatabaseItemFields = keyof DatabaseItem;

export const databaseItemFields = [
    'name',
    'id',
    'type',
    'statsType',
    'level',
    'faction',
    'cost',
    'currency',
    'shop',
    'bundle',
    'colour',
    'colours',
    'upgradeItem',
    'imagePath',
] as const;
