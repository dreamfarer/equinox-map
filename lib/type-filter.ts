export type TypeFilterNode = {
    label: string;
    fullPath: string;
    children: Map<string, TypeFilterNode>;
};

function createNode(label: string, fullPath: string): TypeFilterNode {
    return {
        label,
        fullPath,
        children: new Map(),
    };
}

export function buildTypeFilterTree(typeValues: string[]): TypeFilterNode {
    const root = createNode('type', '');
    for (const rawValue of typeValues) {
        const parts = rawValue.split('/').filter(Boolean);
        let current = root;
        const accumulated: string[] = [];
        for (const part of parts) {
            accumulated.push(part);
            const currentPath = accumulated.join('/');
            if (!current.children.has(part)) {
                current.children.set(part, createNode(part, currentPath));
            }
            current = current.children.get(part)!;
        }
    }
    return root;
}

export function getTypeNodeByPath(
    root: TypeFilterNode,
    path: string[]
): TypeFilterNode | null {
    let current = root;
    for (const segment of path) {
        const next = current.children.get(segment);
        if (!next) return null;
        current = next;
    }
    return current;
}

export function collectLeafPaths(node: TypeFilterNode): string[] {
    if (node.children.size === 0) {
        return node.fullPath ? [node.fullPath] : [];
    }
    const result: string[] = [];
    for (const child of node.children.values()) {
        result.push(...collectLeafPaths(child));
    }
    return result;
}
