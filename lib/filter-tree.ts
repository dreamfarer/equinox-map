export type FilterNode = {
    label: string;
    fullPath: string;
    children: Map<string, FilterNode>;
};

export function buildFilterTree(
    rootLabel: string,
    values: string[]
): FilterNode {
    const root: FilterNode = {
        label: rootLabel,
        fullPath: '',
        children: new Map(),
    };
    for (const rawValue of values) {
        const parts = rawValue.split('/').filter(Boolean);
        let current = root;
        const accumulated: string[] = [];
        for (const part of parts) {
            accumulated.push(part);
            const currentPath = accumulated.join('/');
            if (!current.children.has(part)) {
                current.children.set(part, {
                    label: part,
                    fullPath: currentPath,
                    children: new Map(),
                });
            }
            current = current.children.get(part)!;
        }
    }
    return root;
}

export function getNodeByPath(
    root: FilterNode,
    path: string[]
): FilterNode | null {
    let current = root;
    for (const segment of path) {
        const next = current.children.get(segment);
        if (!next) return null;
        current = next;
    }
    return current;
}

export function collectLeafValues(node: FilterNode): string[] {
    if (node.children.size === 0) {
        return node.fullPath ? [node.fullPath] : [];
    }
    const result: string[] = [];
    for (const child of node.children.values()) {
        result.push(...collectLeafValues(child));
    }
    return result;
}
