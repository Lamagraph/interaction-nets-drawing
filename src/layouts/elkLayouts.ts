import ELK from 'elkjs/lib/elk.bundled.js';

import '@xyflow/react/dist/style.css';

const elk = new ELK();

// Elk has a *huge* amount of options to configure. To see everything you can
// tweak check out:
// - https://www.eclipse.org/elk/reference/algorithms.html
// - https://www.eclipse.org/elk/reference/options.html
export const elkOptions = {
    'elk.algorithm': 'layered',
    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    'elk.spacing.nodeNode': '80',
};

export const getLayoutedNodes = async (nodes, edges, options = {}) => {
    const isHorizontal = options?.['elk.direction'] === 'RIGHT';
    const graph = {
        id: 'root',
        layoutOptions: options,
        children: nodes.map((node) => ({
            ...node,
            targetPosition: isHorizontal ? 'left' : 'top',
            sourcePosition: isHorizontal ? 'right' : 'bottom',

            width: 150,
            height: 50,
        })),
        edges: edges,
    };

    const layoutedGraph = await elk.layout(graph);

    const layoutedNodes = nodes.map((node) => {
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
