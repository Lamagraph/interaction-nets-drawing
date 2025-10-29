import { type Node, type Edge, type Connection } from '@xyflow/react';

// Core

export interface PointConnection {
    idNode: string;
    idPort: string;
}
export const defPointCon = { idNode: '', idPort: '' };

export type Port = {
    id: string;
    label: string | null;
};
export const defPort = { id: '', label: null };

export type AgentData = {
    label: string;
    auxiliaryPorts: Port[];
    principalPort: Port;
};
export type Agent = Node<AgentData>;

export type Net = {
    agents: Agent[];
    edges: Edge[];
    name: string;
};

// Utils

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
        } else if (
            node.id === params.target &&
            node.data.principalPort.id === getTargetHandle(params)
        ) {
            countPrPort++;
        }
        if (countPrPort === 2) return true;
    }
    return false;
}

// Serialization

export type NetObject = {
    nodes?: { [key: string]: any };
    edges?: { [key: string]: any };
};

export async function getObjectFromFile(file: File): Promise<NetObject> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = event => {
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

export async function getObjectFromFileByName(nameFile: string): Promise<NetObject> {
    const response = await fetch(nameFile);
    if (!response.ok) {
        throw new Error(`Response.status: ${response.status}`);
    }
    const objects = await response.json();
    return objects;
}

export async function toNetFromObject(
    net: NetObject,
    typeNode: string,
    typeEdge: string,
): Promise<[Agent[], Edge[]]> {
    try {
        const nodesObj = net.nodes ? Object.entries(net.nodes) : [];
        const nodes: Agent[] = [];
        let index = 0;

        for (const [, nodeObj] of nodesObj) {
            if (
                validate(nodeObj.id) &&
                (validate(nodeObj.data?.label) || validate(nodeObj.label)) &&
                (Array.isArray(nodeObj.data?.auxiliaryPorts) ||
                    Array.isArray(nodeObj.auxiliaryPorts)) &&
                (validate(nodeObj.data?.principalPort.id) || validate(nodeObj.principalPort.id))
            ) {
                nodes.push({
                    id: nodeObj.id,
                    data: nodeObj.data ?? {
                        label: nodeObj.label,
                        auxiliaryPorts: nodeObj.auxiliaryPorts,
                        principalPort: nodeObj.principalPort,
                    },
                    position: nodeObj.position || {
                        x: 50 + 300 * Math.floor(index / 5),
                        y: 50 + 120 * (index % 5),
                    },
                    type: typeNode,
                });
                index += 1;
            } else {
                throw new Error(`Invalid node data structure for id: ${nodeObj.id}`);
            }
        }

        const edgesObj = net.edges ? Object.entries(net.edges) : [];
        const edges: Edge[] = [];

        for (const [, edgeObj] of edgesObj) {
            if (
                validate(edgeObj.source) &&
                validate(edgeObj.target) &&
                (validate(edgeObj.sourcePort) || validate(edgeObj.sourceHandle)) &&
                (validate(edgeObj.targetPort) || validate(edgeObj.targetHandle))
            ) {
                const sourceHandle = edgeObj.sourcePort || edgeObj.sourceHandle;
                const targetHandle = edgeObj.targetPort || edgeObj.targetHandle;
                edges.push({
                    id:
                        edgeObj.id ||
                        `E_${edgeObj.source}:${sourceHandle}-${edgeObj.target}:${targetHandle}`,
                    source: edgeObj.source,
                    target: edgeObj.target,
                    sourceHandle: sourceHandle,
                    targetHandle: `${targetHandle}t`,
                    animated: edgeObj.activePair ?? edgeObj.animated ?? false,
                    style: edgeObj.activePair || edgeObj.animated ? { stroke: 'blue' } : {},
                    type: typeEdge,
                });
            } else {
                throw new Error(`Invalid edge data structure for id: ${edgeObj.id}`);
            }
        }

        return [nodes, edges];
    } catch (error) {
        console.error('Failed to parse JSON:', error);
        return [[], []];
    }
}

const allowedKeys = [
    'nodes',
    'id',
    'data',
    'label',
    'auxiliaryPorts',
    'principalPort',
    'edges',
    'source',
    'target',
    'sourcePort',
    'sourceHandle',
    'targetPort',
    'targetHandle',
    'activePair',
    'animated',
];

const mapKeys = {
    animated: 'activePair',
    sourceHandle: 'sourcePort',
    targetHandle: 'targetPort',
};

export async function transformObject(objNet: NetObject): Promise<NetObject> {
    const transObjRec = (obj: any): Record<string, any> => {
        if (Array.isArray(obj)) {
            return obj.map(transObjRec);
        } else if (obj && typeof obj === 'object') {
            const result: Record<string, any> = {};

            for (const [key, value] of Object.entries(obj)) {
                if (key === 'data') {
                    Object.assign(result, transObjRec(value));
                } else if (allowedKeys.includes(key)) {
                    const newKey = (mapKeys as Record<string, string>)[key] || key;
                    const newValue =
                        key === 'targetHandle' && typeof value === 'string'
                            ? value.slice(0, -1)
                            : transObjRec(value);
                    result[newKey] = newValue;
                }
            }

            return result;
        }

        return obj;
    };

    return transObjRec(objNet);
}
