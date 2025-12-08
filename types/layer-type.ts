export type LayerType = {
    label: string;
    id: string;
    active: boolean;
    children?: LayerType[];
};
