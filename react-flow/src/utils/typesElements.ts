import { BezierEdge, Position, SmoothStepEdge } from '@xyflow/react';
import { SmartBezierEdge, SmartStraightEdge, SmartStepEdge } from '@tisoap/react-flow-smart-edge';

import NodeLayout from '../views/NodeLayout';
import NodeLayoutVert from '../views/NodeLayoutVert';
import NodeLayoutGen from '../views/NodeLayoutGen';

export const nodeTypes = {
    agent: NodeLayout,
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
    agent: [Position.Top, Position.Bottom],
    agentVert: [Position.Left, Position.Right],
    agentGen: [Position.Left, Position.Right],
};

