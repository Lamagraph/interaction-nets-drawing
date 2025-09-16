import { type Node, type Edge, Connection } from '@xyflow/react';

export type Port = {
    id: string;
    label: string | null;
};
export type AgentData = {
    label: string;
    auxiliaryPorts: Port[];
    principalPort: Port;
};
export type Agent = Node<AgentData, 'agent'>;

export function validate(item: any, type = 'string') {
    if (item === undefined || item === null) return false;
    if (typeof item !== type) return false;
    if (type === 'string') return item.trim() !== '';
    return true;
}

export function getTargetHandle(params: Edge | Connection): string {
    return params.targetHandle?.slice(0, -1) ?? '';
}

export function isActivePair(params: Edge | Connection, nodes: Agent[]): boolean {
    let countPrPort = 0;
    for (const node of nodes) {
        if (node.id === params.source && node.data.principalPort.id === params.sourceHandle) {
            countPrPort++;
        } else if (node.id === params.target && node.data.principalPort.id === getTargetHandle(params)) {
            countPrPort++;
        }
        if (countPrPort === 2) return true;
    }
    return false;
};

export async function getObjectsFromFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const dataJson = JSON.parse(event.target?.result as string);
                resolve(dataJson);
            } catch (error) {
                reject(new Error(`Failed to parse objects: ${error}`));
            }
        };

        reader.onerror = () => {
            reject(new Error(`Failed to read ${file.name}`));
        };

        reader.readAsText(file);
    });
}

export async function getObjectsByName(file: string): Promise<any> {
    const response = await fetch(file);
    if (!response.ok) {
        throw new Error(`response.status: ${response.status}`);
    }
    const objects = await response.json();
    return objects;
}

export async function parseJSON(
    net: {
        nodes?: { [key: string]: any };
        edges?: { [key: string]: any };
    },
    typeEdge: string,
): Promise<[Agent[], Edge[]]> {
    const nodesObj = net.nodes ? Object.entries(net.nodes) : [];
    const nodes: Agent[] = [];
    let index = 0;
    nodesObj.forEach(([, node]) => {
        if (
            validate(node.id) &&
            (validate(node.data?.label) || validate(node.label)) &&
            (Array.isArray(node.data?.auxiliaryPorts) || Array.isArray(node.auxiliaryPorts)) &&
            (validate(node.data?.principalPort.id) || validate(node.principalPort.id))
        ) {
            nodes.push({
                id: node.id,
                data: node.data ?? {
                    label: node.label,
                    auxiliaryPorts: node.auxiliaryPorts,
                    principalPort: node.principalPort
                },
                position: node.position || {
                    x: 50 + 300 * Math.floor(index / 5),
                    y: 50 + 120 * (index % 5)
                },
                type: 'agent',
                // style: { transform: 'rotate(90deg)', transformOrigin: 'center center' }
            });
            index += 1;
        } else {
            console.warn(`Invalid node data structure for id: ${node.id}`);
        }
    });

    const edgesObj = net.edges ? Object.entries(net.edges) : [];
    const edges: Edge[] = []
    edgesObj.forEach(([, edge]) => {
        if (
            validate(edge.source) && validate(edge.target) &&
            (validate(edge.sourcePort) || validate(edge.sourceHandle)) &&
            (validate(edge.targetPort) || validate(edge.targetHandle))
        ) {
            const sourceHandle = edge.sourcePort || edge.sourceHandle;
            const targetHandle = edge.targetPort || edge.targetHandle;
            edges.push({
                id: edge.id || `E_${edge.source}:${sourceHandle}-${edge.target}:${targetHandle}`,
                source: edge.source,
                target: edge.target,
                sourceHandle: sourceHandle,
                targetHandle: `${targetHandle}t`,
                animated: edge.activePair ?? edge.animated ?? false,
                style: (edge.activePair || edge.animated) ? { stroke: 'blue' } : {},
                type: typeEdge,
            });
        } else {
            console.warn(`Invalid edge data structure for id: ${edge.id}`);
        }
    });

    return [nodes, edges];
}
