// https://reactflow.dev/examples/layout/elkjs-multiple-handles

import { type Edge } from '@xyflow/react';
import ELK from 'elkjs/lib/elk.bundled.js';

import { type Agent } from '../nets';

// elk layouting options can be found here:
// https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-layered.html
const layoutOptions = {
    'elk.algorithm': 'layered',
    'elk.direction': 'DOWN',
    'elk.layered.spacing.edgeNodeBetweenLayers': '40',
    'elk.spacing.nodeNode': '40',
    'elk.layered.nodePlacement.strategy': 'SIMPLE',
};

const elk = new ELK();

export const getLayoutedNodes = async (nodes: Agent[], edges: Edge[]): Promise<Agent[]> => {
    const graph = {
        id: 'root',
        layoutOptions,
        children: nodes.map((n) => {
            const targetPorts = n.data.auxiliaryPorts.flatMap(port => [
                {
                    id: port.id,
                    properties: {
                        side: 'NORTH',
                    },
                },
                {
                    id: `${port.id}t`,
                    properties: {
                        side: 'NORTH',
                    },
                }
            ]);

            const sourcePorts = [
                {
                    id: n.data.principalPort.id,
                    properties: {
                        side: 'SOUTH',
                    }
                },
                {
                    id: `${n.data.principalPort.id}t`,
                    properties: {
                        side: 'SOUTH',
                    }
                }
            ];

            return {
                id: n.id,
                width: n.width ?? 250,
                height: n.height ?? 250,
                properties: {
                    'org.eclipse.elk.portConstraints': 'FIXED_ORDER',
                },
                ports: [{ id: n.id }, ...targetPorts, ...sourcePorts],
            };
        }),
        edges: edges.map((e) => ({
            id: e.id,
            sources: [e.sourceHandle || e.source],
            targets: [e.targetHandle || e.target],
        })),
    };

    const layoutedGraph = await elk.layout(graph);

    const layoutedNodes: Agent[] = nodes.map((node) => {
        const layoutedNode = layoutedGraph.children?.find((lgNode) => lgNode.id === node.id);

        return {
            ...node,
            position: {
                x: layoutedNode?.x ?? 0,
                y: layoutedNode?.y ?? 0,
            },
        };
    });

    return layoutedNodes;
};
