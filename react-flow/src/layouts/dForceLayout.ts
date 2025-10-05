// https://reactflow.dev/learn/layouting/layouting#d3-force

import { useMemo, useRef } from 'react';
import {
    useReactFlow,
    useNodesInitialized,
    type Edge
} from '@xyflow/react';
import {
    forceSimulation,
    forceLink,
    forceManyBody,
    forceX,
    forceY,
} from 'd3-force';

import collide from './collide.js';
import { type Agent } from '../nets';

const simulation = forceSimulation()
    .force('charge', forceManyBody().strength(-1000))
    .force('x', forceX().x(0).strength(0.05))
    .force('y', forceY().y(0).strength(0.05))
    .force('collide', collide())
    .alphaTarget(0.05)
    .stop();

export const getLayoutedNodes = (): (
    { toggle: () => void }
) => {
    const { getNodes, getEdges, setNodes, fitView } = useReactFlow<Agent, Edge>();
    const nodesInitialized = useNodesInitialized();

    const draggingNodeRef = useRef(null);
    const dragEvents = useMemo(
        () => ({
            start: (_event, node) => (draggingNodeRef.current = node),
            drag: (_event, node) => (draggingNodeRef.current = node),
            stop: () => (draggingNodeRef.current = null),
        }),
        [],
    );

    let isRunning = false;

    return useMemo(() => {
        const tick = (nodes: Agent[]) => {
            getNodes().forEach((node: Agent, i: number) => {
                const dragging = draggingNodeRef.current?.id === node.id;

                if (dragging) {
                    nodes[i].fx = draggingNodeRef.current.position.x;
                    nodes[i].fy = draggingNodeRef.current.position.y;
                } else {
                    delete nodes[i].fx;
                    delete nodes[i].fy;
                }
            });

            simulation.tick();
            setNodes(
                nodes.map((node) => ({
                    ...node,
                    position: { x: node.fx ?? node.x, y: node.fy ?? node.y },
                })),
            );

            window.requestAnimationFrame(() => {
                fitView();
                if (isRunning) tick(nodes);
            });
        };

        const toggle = () => {
            const nodes = getNodes().map((node) => ({
                ...node,
                x: node.position.x,
                y: node.position.y,
            }));
            if (!nodesInitialized || nodes.length === 0) return {};

            const edges = getEdges().map((edge) => edge);
            simulation.nodes(nodes).force(
                'link',
                forceLink(edges)
                    .id((d) => d.id)
                    .strength(0.05)
                    .distance(100),
            );

            if (!isRunning) {
                const nds = getNodes();
                nds.forEach((node, index) => {
                    let simNode = nodes[index];
                    Object.assign(simNode, node);
                    simNode.x = node.position.x;
                    simNode.y = node.position.y;
                });
            }

            isRunning = !isRunning;
            isRunning && window.requestAnimationFrame(() => tick(nodes));
        };

        return { toggle };
    }, [nodesInitialized, dragEvents, getNodes, getEdges, setNodes, fitView]);
};
