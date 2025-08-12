import { type Node, type Edge } from '@xyflow/react';

// import nets from '../nets/app_list.json';

export type Port = {
    id: string;
    label: string | null;
};
export type CustomNodeData = {
    label: string;
    auxiliaryPorts: Port[];
    principalPort: Port;
};
export type CustomNode = Node<CustomNodeData, 'custom'>;

function validate(item, type = 'string') {
    return (typeof item === type) && (item !== undefined);
}

export async function parseFile(file) {
    const response = await fetch(file);
    if (!response.ok) {
        throw new Error(`response.status: ${response.status}`);
    }
    const net = await response.json();
    return net;
}

export async function parseJSON(net): Promise<[CustomNode[], Edge[]]> {
    const nodesObj = net.nodes ? Object.entries(net.nodes) : [];
    const nodes: CustomNode[] = [];
    let index = 0;
    nodesObj.forEach(([, node], _) => {
        if (
            validate(node.data.label) &&
            Array.isArray(node.data.auxiliaryPorts) &&
            validate(node.data.principalPort.id)
        ) {
            nodes.push({
                id: node.id,
                data: node.data as CustomNodeData,
                position: node.position || {
                    x: 50 + 50 * Math.floor(index / 5),
                    y: 50 + 50 * (index % 5)
                },
                type: 'custom'
            });
            index += 1;
        } else {
            console.warn(`Invalid node data structure for id: ${node.id}`);
        }
    });

    const edgesObj = net.edges ? Object.entries(net.edges) : [];
    const edges: Edge[] = []
    edgesObj.forEach(([, edge], _) => {
        if (
            validate(edge.id) && validate(edge.source) && validate(edge.target) &&
            (validate(edge.sourcePort) || validate(edge.sourceHandle)) &&
            (validate(edge.targetPort) || validate(edge.targetHandle)) &&
            (validate(edge.activePair, 'boolean') || validate(edge.animated, 'boolean'))
        ) {
            edges.push({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                sourceHandle: edge.sourcePort || edge.sourceHandle,
                targetHandle: `${edge.targetPort || edge.targetHandle}t`,
                animated: edge.activePair || edge.animated,
                style: (edge.activePair || edge.animated) ? { stroke: 'blue' } : {},
                // type: 'smoothstep'
            } as Edge);
        } else {
            console.warn(`Invalid edge data structure for id: ${edge.id}`);
        }
    });

    return [nodes, edges];
}
