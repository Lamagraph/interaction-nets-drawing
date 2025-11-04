import { type Edge } from '@xyflow/react';
import { type Agent, type Net } from '@/nets';

interface PropsNetCompare {
    netOne: Net;
    netTwo: Net;
    types: [typeNode: string, typeEdge: string];
    isStepUp: boolean;
    isPinPos: boolean;
}

export function compareNet(props: PropsNetCompare): Net {
    const {
        netOne,
        netTwo,
        types: [typeNode, typeEdge],
        isStepUp,
        isPinPos,
    } = props;

    const color = isStepUp ? 'lightgreen' : 'lightsalmon';

    const updateNode = (node: Agent) => {
        const nodeExisted = netTwo.agents.find(n => n.id === node.id);
        return nodeExisted
            ? {
                  ...nodeExisted,
                  style: node.style,
                  type: typeNode,
                  position: isPinPos ? node.position : nodeExisted.position,
              }
            : { ...node, style: { ...node.style, backgroundColor: color }, type: typeNode };
    };

    const nodesComp: Agent[] = [];
    netOne.agents.forEach(node => {
        const nodeComp = updateNode(node);
        nodesComp.push(nodeComp);
    });

    const updateEdge = (edge: Edge) => {
        const edgeExisted = netTwo.edges.find(e => e.id === edge.id);
        return edgeExisted
            ? { ...edgeExisted, style: edge.style, type: typeEdge }
            : { ...edge, style: { ...edge.style, stroke: color }, type: typeEdge };
    };

    const edgesComp: Edge[] = [];
    netOne.edges.forEach(edge => {
        const edgeComp = updateEdge(edge);
        edgesComp.push(edgeComp);
    });

    return {
        agents: nodesComp,
        edges: edgesComp,
        name: netOne.name,
    };
}
