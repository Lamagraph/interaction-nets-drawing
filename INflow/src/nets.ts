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

export function isValid(item: any, type = 'string') {
    if (item === undefined || item === null) return false;
    if (typeof item !== type) return false;
    if (type === 'string') return item.trim() !== '';
    return true;
}

export function isAllowedToCreate(
    nodeId: string,
    nodeLabel: string,
    nodePrincipalPort: Port,
    nodeAuxiliaryPorts: Port[],
) {
    if (!isValid(nodeId) || !isValid(nodeLabel) || !isValid(nodePrincipalPort.id)) return false;

    const setPorts = new Set([nodePrincipalPort.id]);

    for (const port of nodeAuxiliaryPorts) {
        if (!isValid(port.id)) return false;
        setPorts.add(port.id.trim());
    }

    return setPorts.size === nodeAuxiliaryPorts.length + 1;
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
