// https://reactflow.dev/learn/layouting/layouting#d3-hierarchy

import { type Edge } from '@xyflow/react';
import { HierarchyNode, stratify, tree } from 'd3-hierarchy';

import '@xyflow/react/dist/style.css';

import { type Agent } from '../nets';

const g = tree<Agent>();

export const getLayoutedNodes = (nodes: Agent[], edges: Edge[]): Agent[] => {
    if (nodes.length === 0) return nodes;

    const { width, height } = document
        .querySelector(`[data-id='${nodes[0].id}']`)
        .getBoundingClientRect();

    const potentialRoots = nodes.filter(node => !edges.some(edge => edge.target === node.id));

    // Creation hidden root
    let nodesToLayout = [...nodes];
    let edgesToLayout = [...edges];

    if (potentialRoots.length !== 1) {
        const rootId = 'artificial-root';
        const artificialRoot = {
            id: rootId,
            data: { label: '' },
            position: { x: 0, y: 0 },
            style: { visibility: 'hidden' },
        };

        const newEdges = potentialRoots.map(node => ({
            source: rootId,
            target: node.id,
        }));

        nodesToLayout = [artificialRoot, ...nodes];
        edgesToLayout = [...edges, ...newEdges];
    }

    const hierarchy = stratify()
        .id(node => node.id)
        .parentId(node => edgesToLayout.find(edge => edge.target === node.id)?.source);

    const root: HierarchyNode<Agent> = hierarchy(nodesToLayout);
    const layout = g.nodeSize([width * 2, height * 2])(root);

    const resultNodes: Agent[] = layout
        .descendants()
        .map(node => ({ ...node.data, position: { x: node.x, y: node.y } }))
        .filter(node => node.id !== 'artificial-root');

    return resultNodes;
};
