export interface MenuEntry {
    label: string;
    field?: string;
    isHierarchical?: boolean;
    children?: MenuEntry[];
}

export const menuEntries: MenuEntry[] = [
    { label: 'Type', field: 'type', isHierarchical: true },
    {
        label: 'Stats',
        children: [
            { label: 'Amount', field: 'statsAmount' },
            { label: 'Type', field: 'statsType' },
        ],
    },
    {
        label: 'Reputation',
        children: [
            { label: 'Level', field: 'level' },
            { label: 'Faction', field: 'faction' },
        ],
    },
    {
        label: 'Cost',
        children: [
            { label: 'Amount', field: 'cost' },
            { label: 'Currency', field: 'currency' },
        ],
    },
    { label: 'Shop', field: 'shop' },
    { label: 'Colours', field: 'colours' },
    {
        label: 'Upgrade',
        children: [
            { label: 'Amount', field: 'upgradeAmount' },
            { label: 'Item', field: 'upgradeItem' },
        ],
    },
];
