import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  addEdge,
  type Edge,
  useOnSelectionChange,
  BezierEdge,
  SmoothStepEdge,
  Connection,
  XYPosition,
} from '@xyflow/react';

import { SmartBezierEdge, SmartStraightEdge, SmartStepEdge } from '@tisoap/react-flow-smart-edge';

import '@xyflow/react/dist/style.css';

import {
  type Port,
  type Agent,
  getObjectsByName,
  parseJSON,
  isActivePair,
  getTargetHandle,
  validate,
  defPort,
  PointConnection,
  defPointCon,
} from './nets';
import NodeLayout from './views/NodeLayout';
import NodeLayoutVert from './views/NodeLayoutVert';
import NodeLayoutGen from './views/NodeLayoutGen';
import MenuControl from './views/MenuControl';
import MenuLayouts from './views/MenuLayouts';
import { DnDProvider, useDnD } from './views/DnDContext';
import MenuConfig from './views/MenuConfig';
import MenuNodes from './views/MenuNodes';
import MenuEdges from './views/MenuEdges';
import MenuInfo from './views/MenuInfo';

const nodeTypes = {
  agent: NodeLayout,
  agentVert: NodeLayoutVert,
  agentGen: NodeLayoutGen,
};

const edgeTypes = {
  bezier: BezierEdge,
  smoothstep: SmoothStepEdge,
  smartBezier: SmartBezierEdge,
  smartStraight: SmartStraightEdge,
  smartStep: SmartStepEdge,
};

const dirNetsSaved = '../saved-nets/';
const nameFileStart = 'list_add_1.json';

const Flow = () => {
  // Main

  const [nodes, setNodes, onNodesChange] = useNodesState<Agent>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [fileOpened, setFileOpened] = useState<string>(nameFileStart);
  const [isRunningLayout, setIsRunningLayout] = useState<boolean>(false);

  // Start

  const loadNetStart = async (nameFile: string) => {
    try {
      const net = await getObjectsByName(nameFile);
      const [nds, eds] = await parseJSON(net, typeNode, typeEdge);
      setNodes(nds);
      setEdges(eds);
    } catch {
      setNodes([]);
      setEdges([]);
    }
  };

  useEffect(() => { loadNetStart(dirNetsSaved + nameFileStart) }, []);

  // Type node and edge

  const [typeNode, setTypeNode] = useState<string>('agent');

  const [typeEdge, setTypeEdge] = useState<string>('bezier');

  useEffect(() => {
    setNodes(nds =>
      nds.map(node => ({ ...node, type: typeNode }))
    );
    setEdges(eds =>
      eds.map(edge => ({ ...edge, type: typeEdge }))
    );
  }, [typeEdge, typeNode]);

  // Add and edit net

  const [nodeId, setNodeId] = useState<string>('');
  const [nodeLabel, setNodeLabel] = useState<string>('');
  const [nodePrincipalPort, setNodePrincipalPort] = useState<Port>(defPort);
  const [nodeAuxiliaryPorts, setNodeAuxiliaryPorts] = useState<Port[]>([]);

  const [nodePrincipalLink, setNodePrincipalLink] = useState<PointConnection>(defPointCon);
  const [nodeAuxiliaryLinks, setNodeAuxiliaryLinks] = useState<PointConnection[]>([]);

  const cleanUpInfoNode = useCallback(() => {
    setNodeId('');
    setNodeLabel('');
    setNodeAuxiliaryPorts([]);
    setNodePrincipalPort(defPort);
    setNodeAuxiliaryLinks([]);
    setNodePrincipalLink(defPointCon);
  }, []);

  /// Add node

  const addItem = (position: XYPosition) => {
    setIsRunningLayout(false);

    const ndNew: Agent = {
      id: nodeId,
      data: {
        label: nodeLabel,
        auxiliaryPorts: nodeAuxiliaryPorts,
        principalPort: nodePrincipalPort
      },
      position,
      type: typeNode,
    };

    setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    setNodes((nds) => {
      const ndsNew = nds.filter(n => n.id !== nodeId);
      ndsNew.push(ndNew);

      nodeAuxiliaryLinks.forEach((ids, index) => {
        if (ndsNew.some(n => n.id === ids.idNode)) {
          const edNew: Edge = {
            id: `E_${ids.idNode}:${ids.idPort}-${nodeId}:${nodeAuxiliaryPorts[index].id}`,
            source: ids.idNode,
            target: nodeId,
            sourceHandle: ids.idPort,
            targetHandle: `${nodeAuxiliaryPorts[index].id}t`,
            type: typeEdge,
          }
          setEdges((es) => [...es, edNew]);
        }
      });

      const ndTarget = ndsNew.find(n => n.id === nodePrincipalLink.idNode);
      if (ndTarget) {
        const isAuxPort = nodePrincipalLink.idPort === ndTarget.data.principalPort.id;
        const edNew: Edge = {
          id: `E_${nodeId}:${nodePrincipalPort.id}-${nodePrincipalLink.idNode}:${nodePrincipalLink.idPort}`,
          source: nodeId,
          target: nodePrincipalLink.idNode,
          sourceHandle: nodePrincipalPort.id,
          targetHandle: `${nodePrincipalLink.idPort}t`,
          animated: isAuxPort ? true : false,
          style: isAuxPort ? { stroke: 'blue' } : {},
          type: typeEdge,
        }
        setEdges((es) => [...es, edNew]);
      }

      return ndsNew;
    });

    cleanUpInfoNode();
  };

  //// Add node with drag

  const { screenToFlowPosition } = useReactFlow<Agent, Edge>();
  const [type, setType] = useDnD();

  const onDrop = useCallback((event: any) => {
    event.preventDefault();
    if (!type && !isAllowed()) {
      return;
    }

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    addItem(position);
  }, [screenToFlowPosition, type]);

  const onDragStart = (event: any, nodeType: any) => {
    if (setType) setType(nodeType);
    event.dataTransfer.setData('text/plain', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  /// Add edge with drag

  const onConnect = useCallback((params: Connection) => {
    const isActPair = isActivePair(params, nodes);
    setIsRunningLayout(false);

    setEdges(eds =>
      addEdge({
        ...params,
        type: typeEdge,
        animated: isActPair,
        style: isActPair ? { stroke: 'blue' } : {}
      }, eds)
    );
  }, [setEdges, typeEdge, nodes]);

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  /// Selected node

  const [nodeSelected, setNodeSelected] = useState<Agent>();

  const onChange = useCallback(({ nodes }: { nodes: Agent[] }) => {
    setNodeSelected(nodes[0]);
  }, []);
  useOnSelectionChange({
    onChange
  });

  useEffect(() => {
    if (!nodeSelected) {
      cleanUpInfoNode();
      return
    }

    setNodeId(nodeSelected.id);
    setNodeLabel(nodeSelected.data.label);
    const auxPorts = nodeSelected.data.auxiliaryPorts;
    setNodeAuxiliaryPorts(auxPorts);
    setNodePrincipalPort(nodeSelected.data.principalPort);
    setNodeAuxiliaryLinks(Array(auxPorts.length).fill(defPointCon));

    edges.forEach((edge) => {
      if (edge.source === nodeSelected.id) {
        if (nodeSelected.data.principalPort.id === edge.sourceHandle) {
          setNodePrincipalLink({ idNode: edge.target, idPort: getTargetHandle(edge) })
        } else {
          const indexAuxPort = auxPorts.findIndex(port => port.id === edge.sourceHandle);
          setNodeAuxiliaryLinks(links =>
            links.map((port, i) =>
              i === indexAuxPort ? { ...port, idNode: edge.target, idPort: getTargetHandle(edge) } : port
            )
          );
        }
      } else if (edge.target === nodeSelected.id) {
        if (nodeSelected.data.principalPort.id === getTargetHandle(edge)) {
          setNodePrincipalLink({ idNode: edge.source, idPort: edge.sourceHandle! })
        } else {
          const indexAuxPort = auxPorts.findIndex(port => port.id === getTargetHandle(edge));
          setNodeAuxiliaryLinks(links =>
            links.map((port, i) =>
              i === indexAuxPort ? { ...port, idNode: edge.source, idPort: edge.sourceHandle! } : port
            )
          );
        }
      }
    });
  }, [nodeSelected, isRunningLayout]);

  useEffect(() => {
    if (isRunningLayout && nodeSelected) {
      nodeSelected.selected = false;
      cleanUpInfoNode();
    }
  }, [isRunningLayout, nodeSelected]);

  // Adding button

  const isAllowed = useCallback(() => {
    if (!validate(nodeId) || !validate(nodeLabel) || !validate(nodePrincipalPort.id)) return false;

    const setPorts = new Set([nodePrincipalPort.id]);

    for (const port of nodeAuxiliaryPorts) {
      if (!validate(port.id)) return false;
      setPorts.add(port.id.trim());
    }

    return setPorts.size === nodeAuxiliaryPorts.length + 1
  }, [nodeId, nodeLabel, nodePrincipalPort, nodeAuxiliaryPorts]);

  // Utils

  const reactFlowWrapper = useRef(null);

  const [rfInstance, setRfInstance] = useState(null);

  return (
    <div className='dndflow'>
      <div className='reactflow-wrapper' ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onInit={setRfInstance}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          attributionPosition='bottom-left'
          fitView
          // If layout is running
          nodesDraggable={!isRunningLayout}
          nodesConnectable={!isRunningLayout}
          nodesFocusable={!isRunningLayout}
          edgesFocusable={!isRunningLayout}
          elementsSelectable={!isRunningLayout}
          panOnDrag={!isRunningLayout}
          zoomOnScroll={!isRunningLayout}
          zoomOnPinch={!isRunningLayout}
          zoomOnDoubleClick={!isRunningLayout}
          connectOnClick={!isRunningLayout}
          deleteKeyCode={!isRunningLayout ? ["Delete", "Backspace"] : null}
        >
          <MenuConfig
            addItem={addItem}
            isAllowed={isAllowed}
            nodeId={nodeId}
            setNodeId={setNodeId}
            nodeLabel={nodeLabel}
            setNodeLabel={setNodeLabel}
            nodeAuxiliaryPorts={nodeAuxiliaryPorts}
            setNodeAuxiliaryPorts={setNodeAuxiliaryPorts}
            nodePrincipalPort={nodePrincipalPort}
            setNodePrincipalPort={setNodePrincipalPort}
            nodeAuxiliaryLinks={nodeAuxiliaryLinks}
            setNodeAuxiliaryLinks={setNodeAuxiliaryLinks}
            nodePrincipalLink={nodePrincipalLink}
            setNodePrincipalLink={setNodePrincipalLink}
            nodeSelected={nodeSelected}
            isRunningLayout={isRunningLayout}
            typeNode={typeNode}
            typeEdge={typeEdge}
          />
          <MenuLayouts
            isRunningLayout={isRunningLayout}
            setIsRunningLayout={setIsRunningLayout}
          />
          <div>
            <MenuControl
              nodes={nodes}
              edges={edges}
              typeNode={typeNode}
              typeEdge={typeEdge}
              fileOpened={fileOpened}
              setFileOpened={setFileOpened}
              rfInstance={rfInstance}
              isRunningLayout={isRunningLayout}
            />
            <MenuInfo
              setTypeNode={setTypeNode}
              setTypeEdge={setTypeEdge}
              fileOpened={fileOpened}
            />
          </div>
          <Background />
          <MiniMap />
        </ReactFlow>
      </div>
    </div >
  );
}

export default () => (
  <ReactFlowProvider>
    <DnDProvider>
      <Flow />
    </DnDProvider>
  </ReactFlowProvider>
);
