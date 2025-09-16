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
  Edge,
  useOnSelectionChange,
  BezierEdge,
  SmoothStepEdge,
  Connection,
  XYPosition,
} from '@xyflow/react';

import { SmartBezierEdge, SmartStraightEdge, SmartStepEdge } from "@tisoap/react-flow-smart-edge";

import '@xyflow/react/dist/style.css';

import { type Port, type Agent, getObjectsByName, parseJSON, isActivePair, getTargetHandle, validate } from './nets';
import NodeLayout from './views/NodeLayout';
import MenuControl from './views/MenuControl';
import MenuLayouts from './views/MenuLayouts';
import { DnDProvider, useDnD } from './views/DnDContext';
import MenuConfig from './views/MenuConfig';
import MenuEdges from './views/MenuEdges';

const nodeTypes = {
  agent: NodeLayout,
};

const edgeTypes = {
  bezier: BezierEdge,
  smoothstep: SmoothStepEdge,
  smartBezier: SmartBezierEdge,
  smartStraight: SmartStraightEdge,
  smartStep: SmartStepEdge,
};

const dirNetsSaved = '../saved-nets/';
const nameFileStart = 'app_list_1.json'

const Flow = () => {
  // Main

  const [nodes, setNodes, onNodesChange] = useNodesState<Agent>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [fileOpened, setFileOpened] = useState<string>(nameFileStart);

  // Start

  const loadNetStart = async (nameFile: string) => {
    try {
      const net = await getObjectsByName(nameFile);
      const [nds, eds] = await parseJSON(net, typeEdge);
      setNodes(nds);
      setEdges(eds);
    } catch {
      setNodes([]);
      setEdges([]);
    }
  };

  useEffect(() => { loadNetStart(dirNetsSaved + nameFileStart) }, []);

  // Type edge

  const [typeEdge, setTypeEdge] = useState<string>('bezier');

  useEffect(() => {
    setEdges(eds =>
      eds.map(edge => ({ ...edge, type: typeEdge }))
    );
  }, [typeEdge]);

  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Add and edit net

  const [nodeId, setNodeId] = useState<string>('');
  const [nodeLabel, setNodeLabel] = useState<string>('');
  const [nodePrincipalPort, setNodePrincipalPort] = useState<Port>({ id: '', label: null });
  const [nodeAuxiliaryPorts, setNodeAuxiliaryPorts] = useState<Port[]>([]);

  const [nodePrincipalLink, setNodePrincipalLink] = useState<
    {
      idNode: string;
      idPort: string;
    }
  >({ idNode: '', idPort: '' });
  const [nodeAuxiliaryLinks, setNodeAuxiliaryLinks] = useState<
    {
      idNode: string;
      idPort: string;
    }[]
  >([]);

  /// Add node

  const addItem = (position: XYPosition) => {
    const ndNew: Agent = {
      id: nodeId,
      data: {
        label: nodeLabel,
        auxiliaryPorts: nodeAuxiliaryPorts,
        principalPort: nodePrincipalPort
      },
      position,
      type: 'agent'
    };

    setEdges((eds) => eds.filter((e) => e.source != nodeId && e.target != nodeId));
    setNodes((nds) => {
      const ndsNew = nds.filter((n) => n.id !== nodeId);
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

    setNodeId('');
    setNodeLabel('');
    setNodeAuxiliaryPorts([]);
    setNodePrincipalPort({ id: '', label: null });
    setNodeAuxiliaryLinks([]);
    setNodePrincipalLink({ idNode: '', idPort: '' });
  };

  //// Add node with drag

  const { screenToFlowPosition } = useReactFlow<Agent, Edge>();
  const [type] = useDnD();

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (!type && !isAllowed()) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addItem(position);
    },
    [screenToFlowPosition, type],
  );

  const onDragStart = (event, nodeType) => {
    setType(nodeType);
    event.dataTransfer.setData('text/plain', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  /// Add edge with drag

  const onConnect = useCallback((params: Connection) => {
    const isActPair = isActivePair(params, nodes);
    console.log(isActPair);
    setEdges(eds =>
      addEdge({
        ...params,
        type: typeEdge,
        animated: isActPair,
        style: isActPair ? { stroke: 'blue' } : {}
      }, eds)
    );
  }, [setEdges, typeEdge, nodes]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  /// Selected node

  const [nodeSelected, setNodeSelected] = useState<Agent>();

  const onChange = useCallback(({ nodes, }) => {
    setNodeSelected(nodes[0]);
  }, []);
  useOnSelectionChange({
    onChange
  });

  useEffect(() => {
    if (!nodeSelected) {
      setNodeId('');
      setNodeLabel('');
      setNodeAuxiliaryPorts([]);
      setNodePrincipalPort({ id: '', label: null });
      setNodeAuxiliaryLinks([]);
      setNodePrincipalLink({ idNode: '', idPort: '' });
      return
    }

    setNodeId(nodeSelected.id);
    setNodeLabel(nodeSelected.data.label);
    const auxPorts = nodeSelected.data.auxiliaryPorts;
    setNodeAuxiliaryPorts(auxPorts);
    setNodePrincipalPort(nodeSelected.data.principalPort);
    setNodeAuxiliaryLinks(Array(auxPorts.length).fill({ idNode: "", idPort: "" }));

    edges.forEach((edge) => {
      if (edge.source === nodeSelected.id) {
        if (nodeSelected.data.principalPort.id === edge.sourceHandle) {
          setNodePrincipalLink({ idNode: edge.target, idPort: getTargetHandle(edge) })
        } else {
          const indexAuxPort = auxPorts.findIndex(port => port.id === edge.sourceHandle);
          setNodeAuxiliaryLinks(prev =>
            prev.map((port, i) =>
              i === indexAuxPort ? { ...port, idNode: edge.target, idPort: getTargetHandle(edge) } : port
            )
          );
        }
      } else if (edge.target === nodeSelected.id) {
        if (nodeSelected.data.principalPort.id === getTargetHandle(edge)) {
          setNodePrincipalLink({ idNode: edge.source, idPort: edge.sourceHandle! })
        } else {
          const indexAuxPort = auxPorts.findIndex(port => port.id === getTargetHandle(edge));
          setNodeAuxiliaryLinks(prev =>
            prev.map((port, i) =>
              i === indexAuxPort ? { ...port, idNode: edge.source, idPort: edge.sourceHandle! } : port
            )
          );
        }
      }
    });
  }, [nodeSelected]);

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
          fitView
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
          />
          <MenuLayouts
            isRunning={isRunning}
            setIsRunning={setIsRunning}
          />
          <MenuControl
            nodes={nodes}
            edges={edges}
            typeEdge={typeEdge}
            fileOpened={fileOpened}
            setFileOpened={setFileOpened}
            rfInstance={rfInstance}
            isRunning={isRunning}
            setIsRunning={setIsRunning}
          />
          <MenuEdges setTypeEdge={setTypeEdge} />
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
