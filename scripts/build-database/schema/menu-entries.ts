export interface MenuEntry {
    label: string;
    field?: string;
    optionsField?: string;
    isHierarchical?: boolean;
    isMaxInput?: boolean;
    optionPrefix?: string;
    children?: MenuEntry[];
}

export const menuEntries: MenuEntry[] = [
    { label: 'Type', field: 'type', isHierarchical: true },
    { label: 'Stats', field: 'statsType', optionPrefix: '+40 ' },
    {
        label: 'Reputation',
        field: 'reputation',
        optionsField: 'faction',
        isMaxInput: true,
    },
    {
        label: 'Cost',
        field: 'cost',
        optionsField: 'currency',
        isMaxInput: true,
    },
    { label: 'Shop', field: 'shop' },
    { label: 'Bundle', field: 'bundle' },
    { label: 'Colours', field: 'colours' },
    { label: 'Upgrade', field: 'upgradeItem', optionPrefix: '10 ' },
];
