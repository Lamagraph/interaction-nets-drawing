import { type Node, type Edge } from '@xyflow/react';

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

function validate(item, type = 'string') {
    return (typeof item === type) && (item !== undefined) && (item !== null);
}

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
    const ndsObj = net.nodes ? Object.entries(net.nodes) : [];
    const nds: Agent[] = [];
    let index = 0;
    ndsObj.forEach(([, node], _) => {
        if (
            validate(node.id) &&
            (validate(node.data?.label) || validate(node.label)) &&
            (Array.isArray(node.data?.auxiliaryPorts) || Array.isArray(node.auxiliaryPorts)) &&
            (validate(node.data?.principalPort.id) || validate(node.principalPort.id))
        ) {
            nds.push({
                id: node.id,
                data: node.data ?? {
                    label: node.label,
                    auxiliaryPorts: node.auxiliaryPorts,
                    principalPort: node.principalPort
                },
                position: node.position || {
                    x: 50 + 50 * Math.floor(index / 5),
                    y: 50 + 50 * (index % 5)
                },
                type: 'agent',
                // style: { transform: 'rotate(90deg)', transformOrigin: 'center center' }
            });
            index += 1;
        } else {
            console.warn(`Invalid node data structure for id: ${node.id}`);
        }
    });

    const edsObj = net.edges ? Object.entries(net.edges) : [];
    const eds: Edge[] = []
    edsObj.forEach(([, edge], _) => {
        if (
            validate(edge.source) && validate(edge.target) &&
            (validate(edge.sourcePort) || validate(edge.sourceHandle)) &&
            (validate(edge.targetPort) || validate(edge.targetHandle))
        ) {
            const sourceHandle = edge.sourcePort || edge.sourceHandle;
            const targetHandle = edge.targetPort || edge.targetHandle;
            eds.push({
                id: edge.id || `E_${edge.source}:${sourceHandle}-${edge.target}:${targetHandle}`,
                source: edge.source,
                target: edge.target,
                sourceHandle: sourceHandle,
                targetHandle: `${targetHandle}t`,
                animated: edge.activePair ?? edge.animated ?? false,
                style: (edge.activePair || edge.animated) ? { stroke: 'blue' } : {},
                type: typeEdge,
            } as Edge);
        } else {
            console.warn(`Invalid edge data structure for id: ${edge.id}`);
        }
    });

    return [nds, eds];
}
