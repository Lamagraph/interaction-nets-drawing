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
export const defPort = { id: '' };

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
    agents?: { [key: string]: any };
    edges?: { [key: string]: any };
};

export async function getObjectFromJSON(json: string): Promise<NetObject> {
    const netObj: NetObject = JSON.parse(json);
    if (netObj && netObj.agents && netObj.edges) {
        return netObj;
    }
    throw new Error('Invalid net structure in JSON: missing required fields');
}

export async function getObjectFromFileByName(nameFile: string): Promise<NetObject> {
    const response = await fetch(nameFile);
    if (!response.ok) {
        throw new Error(`Response.status: ${response.status}`);
    }

    const netObj: NetObject = await response.json();
    if (netObj && netObj.agents && netObj.edges) {
        return netObj;
    }
    throw new Error(`Invalid net structure in ${nameFile}: missing required fields`);
}

export async function getObjectFromFile(file: File): Promise<NetObject> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async event => {
            try {
                const netObj = await getObjectFromJSON(event.target?.result as string);
                resolve(netObj);
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

export const calculatePosition = (index: number) => ({
    x: 50 + 300 * Math.floor(index / 5),
    y: 50 + 120 * (index % 5),
});

export async function toNetFromObject(
    netObj: NetObject,
    typeNode: string,
    typeEdge: string,
): Promise<Net> {
    try {
        const nodesObj = netObj.agents ? Object.entries(netObj.agents) : [];
        const nodesMap = new Map<string, Agent>();
        let index = 0;

        for (const [, nodeObj] of nodesObj) {
            if (
                validate(nodeObj.id) &&
                (validate(nodeObj.data?.label) || validate(nodeObj.label)) &&
                (Array.isArray(nodeObj.data?.auxiliaryPorts) ||
                    Array.isArray(nodeObj.auxiliaryPorts)) &&
                (validate(nodeObj.data?.principalPort.id) || validate(nodeObj.principalPort.id))
            ) {
                const nodeId = nodeObj.id;
                nodesMap.set(nodeId, {
                    id: nodeId,
                    data: nodeObj.data ?? {
                        label: nodeObj.label,
                        auxiliaryPorts: nodeObj.auxiliaryPorts,
                        principalPort: nodeObj.principalPort,
                    },
                    position: nodeObj.position || calculatePosition(index),
                    type: typeNode,
                });
                index += 1;
            } else {
                throw new Error(`Invalid node data structure for id: ${nodeObj.id}`);
            }
        }

        const edgesObj = netObj.edges ? Object.entries(netObj.edges) : [];
        const edgesMap = new Map<string, Edge>();

        for (const [, edgeObj] of edgesObj) {
            if (
                validate(edgeObj.source) &&
                validate(edgeObj.target) &&
                (validate(edgeObj.sourcePort) || validate(edgeObj.sourceHandle)) &&
                (validate(edgeObj.targetPort) || validate(edgeObj.targetHandle))
            ) {
                const sourceHandle = edgeObj.sourcePort || edgeObj.sourceHandle;
                const targetHandle = edgeObj.targetPort || edgeObj.targetHandle;
                const edgeId =
                    edgeObj.id ||
                    `E_${edgeObj.source}:${sourceHandle}-${edgeObj.target}:${targetHandle}`;
                edgesMap.set(edgeId, {
                    id: edgeId,
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

        return {
            agents: Array.from(nodesMap.values()),
            edges: Array.from(edgesMap.values()),
            name: '',
        };
    } catch (error) {
        console.error('Failed to parse JSON:', error);
        return { agents: [], edges: [], name: '' };
    }
}

const allowedKeys = [
    'agents',
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

function removeDuplicatesById<T extends { id: string }>(array: T[]): T[] {
    const seen = new Set<string>();
    return array.filter(item => {
        if (seen.has(item.id)) {
            return false;
        }
        seen.add(item.id);
        return true;
    });
}

export async function toObjectFromNet(net: Net, savePos: boolean = false): Promise<NetObject> {
    const keys = savePos ? [...allowedKeys, 'position', 'x', 'y'] : allowedKeys;

    const toObject = (obj: any): Record<string, any> => {
        if (Array.isArray(obj)) {
            return obj.map(toObject);
        } else if (obj && typeof obj === 'object') {
            const result: Record<string, any> = {};

            for (const [key, value] of Object.entries(obj)) {
                if (key === 'data') {
                    Object.assign(result, toObject(value));
                } else if (keys.includes(key)) {
                    const keyNew = (mapKeys as Record<string, string>)[key] || key;
                    const valueNew =
                        key === 'targetHandle' && typeof value === 'string'
                            ? value.slice(0, -1)
                            : toObject(value);
                    result[keyNew] = valueNew;
                }
            }

            return result;
        }

        return obj;
    };

    const netUnique = {
        ...net,
        agents: removeDuplicatesById(net.agents),
        edges: removeDuplicatesById(net.edges),
    };

    return toObject(netUnique);
}
