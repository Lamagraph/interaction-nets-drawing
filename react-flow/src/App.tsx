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
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { type Port, type CustomNode, getJson, parseJSON } from './nets';
import { useCallback, useEffect, useRef, useState } from 'react';

import NodeLayout from './views/NodeLayout';
import Sidebar from './views/Sidebar';
import MenuControl from './views/MenuControl';
import MenuLayouts from './views/MenuLayouts';
import { DnDProvider, useDnD } from './views/DnDContext';
import MenuConfig from './views/MenuConfig';

const nodeTypes = {
  custom: NodeLayout,
};

const Flow = () => {
  const [nodes, , onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [fileOpened, setFileOpened] = useState('app_list.json');

  const loadData = async (file, network = '') => {
    try {
      const net = network ? network : await getJson(file);
      if (network) {
        setFileOpened(file);
        
      }
      const [n, e] = await parseJSON(net);
      setNodes(n);
      setEdges(e);
    } catch {
      setNodes([]);
      setEdges([]);
    }
  };

  useEffect(() => {
    loadData('../saved-nets/app_list.json');
  }, []);

  const { getNodes, setNodes, } = useReactFlow<CustomNode>();

  const reactFlowWrapper = useRef(null);

  const [rfInstance, setRfInstance] = useState(null);

  const [nodeId, setNodeId] = useState('');
  const [nodeLabel, setNodeLabel] = useState('');
  const [nodeAuxiliaryPorts, setNodeAuxiliaryPorts] = useState<Port[]>([]);
  const [nodePrincipalPort, setNodePrincipalPort] = useState<Port>({ id: '', label: null });
  const [nodeAuxiliaryLinks, setNodeAuxiliaryLinks] = useState<{
    idNode: string;
    idPort: string;
  }[]>([]);
  const [nodePrincipalLink, setNodePrincipalLink] = useState({ idNode: '', idPort: '' });

  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const isAllowed = useCallback(() => {
    return (nodeId && nodeLabel && nodePrincipalPort.id && !nodeAuxiliaryPorts.find((port, _) => !port.id));
  }, [nodeId, nodeLabel, nodeAuxiliaryPorts, nodePrincipalPort, setNodes]);

  const addItem = (position) => {
    const newNode: CustomNode = {
      id: nodeId,
      data: {
        label: nodeLabel,
        auxiliaryPorts: nodeAuxiliaryPorts,
        principalPort: nodePrincipalPort
      },
      position,
      type: 'custom'
    };
    setNodes((nds) => {
      const newNodes = nds.concat(newNode);

      nodeAuxiliaryLinks.forEach((ids) => {
        if (ids.idNode && ids.idPort && newNodes.find((n, _) => n.id == ids.idNode)) {
          const newEdge: Edge = {
            id: `E_${ids.idNode}:${ids.idPort}-${nodeId}:${nodePrincipalPort.id}`,
            source: ids.idNode,
            target: nodeId,
            sourceHandle: ids.idPort,
            targetHandle: `${nodePrincipalPort.id}t`,
          }
          setEdges((es) => es.concat(newEdge));
        }
      });

      if (nodePrincipalLink.idNode && nodePrincipalLink.idPort && newNodes.find((n, _) => n.id == nodePrincipalLink.idNode)) {
        const isAP = newNodes.find((n, _) => n.id == nodePrincipalPort.id && n.data.principalPort.id == nodePrincipalLink.idPort);
        const newEdge: Edge = {
          id: `E_${nodeId}:${nodePrincipalPort.id}-${nodePrincipalLink.idNode}:${nodePrincipalLink.idPort}`,
          source: nodeId,
          target: nodePrincipalLink.idNode,
          sourceHandle: nodePrincipalPort.id,
          targetHandle: `${nodePrincipalLink.idPort}t`,
          animated: isAP ? true : false,
          style: isAP ? { stroke: 'blue' } : {},
        }
        setEdges((es) => es.concat(newEdge));
      }

      return newNodes;
    });

    setNodeId('');
    setNodeLabel('');
    setNodeAuxiliaryPorts([]);
    setNodePrincipalPort({ id: '', label: null });

    setNodeAuxiliaryLinks([]);
    setNodePrincipalLink({ idNode: '', idPort: '' });
  };

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

  return (
    <div className='dndflow'>
      <div className='reactflow-wrapper' ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
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
          />
          <MenuLayouts />
          <MenuControl
            loadData={loadData}
            fileOpened={fileOpened}
            rfInstance={rfInstance}
          />
          <Background />
          <MiniMap />
        </ReactFlow>
      </div>
      {/* <Sidebar /> */}
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
