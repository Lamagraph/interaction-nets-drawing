import { BezierEdge, Position, SmoothStepEdge } from '@xyflow/react';
import { SmartBezierEdge, SmartStraightEdge, SmartStepEdge } from '@tisoap/react-flow-smart-edge';

import NodeLayoutHor from '@components/NodeLayout';
import NodeLayoutVert from '@components/NodeLayoutVert';
import NodeLayoutGen from '@components/NodeLayoutGen';

export const nodeTypes = {
    agentHor: NodeLayoutHor,
    agentVert: NodeLayoutVert,
    agentGen: NodeLayoutGen,
};

export const edgeTypes = {
    bezier: BezierEdge,
    smoothstep: SmoothStepEdge,
    smartBezier: SmartBezierEdge,
    smartStraight: SmartStraightEdge,
    smartStep: SmartStepEdge,
};

export const mapTypePos = {
    agentHor: [Position.Top, Position.Bottom],
    agentVert: [Position.Left, Position.Right],
    agentGen: [Position.Left, Position.Right],
};
