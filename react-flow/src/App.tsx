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
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { type Port, type CustomNode, getJson, parseJSON } from './nets';
import { useCallback, useEffect, useRef, useState } from 'react';

import NodeLayout from './views/NodeLayout';
import MenuControl from './views/MenuControl';
import MenuLayouts from './views/MenuLayouts';
import { DnDProvider, useDnD } from './views/DnDContext';
import MenuConfig from './views/MenuConfig';

const nodeTypes = {
  custom: NodeLayout,
};

const Flow = () => {
  const [nodes, , onNodesChange] = useNodesState<CustomNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

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

  const { getNodes, setNodes } = useReactFlow<CustomNode>();

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

  const [nodeSelected, setNodeSelected] = useState<CustomNode>();

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
    const auxP = nodeSelected.data.auxiliaryPorts;
    setNodeAuxiliaryPorts(auxP);
    setNodePrincipalPort(nodeSelected.data.principalPort);
    setNodeAuxiliaryLinks(Array(auxP.length).fill({ idNode: "", idPort: "" }));

    edges.forEach((edge) => {
      if (edge.source == nodeSelected.id) {
        if (nodeSelected.data.principalPort.id == edge.sourceHandle) {
          setNodePrincipalLink({ idNode: edge.target, idPort: edge.targetHandle!.slice(0, -1) })
        } else {
          setNodeAuxiliaryLinks(prev =>
            prev.map((port, j) =>
              j === auxP.findIndex((port) => port.id == edge.sourceHandle) ?
                { ...port, idNode: edge.target, idPort: edge.targetHandle!.slice(0, -1) } : port
            )
          );
        }
      } else if (edge.target == nodeSelected.id) {
        if (nodeSelected.data.principalPort.id == edge.targetHandle!.slice(0, -1)) {
          setNodePrincipalLink({ idNode: edge.source, idPort: edge.sourceHandle! })
        } else {
          setNodeAuxiliaryLinks(prev =>
            prev.map((port, j) =>
              j === auxP.findIndex((port) => port.id == edge.targetHandle!.slice(0, -1)) ?
                { ...port, idNode: edge.source, idPort: edge.sourceHandle! } : port
            )
          );
        }
      }
    });
  }, [nodeSelected]);

  const onChange = useCallback(({ nodes, }) => {
    setNodeSelected(nodes[0]);
  }, []);
  useOnSelectionChange({
    onChange
  });

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const isAllowed = useCallback(() => {
    return (nodeId && nodeLabel && nodePrincipalPort.id && !nodeAuxiliaryPorts.find((port, _) => !port.id));
  }, [nodeId, nodeLabel, nodeAuxiliaryPorts, nodePrincipalPort, setNodes]);

  const addItem = (position) => {
    const nodeNew: CustomNode = {
      id: nodeId,
      data: {
        label: nodeLabel,
        auxiliaryPorts: nodeAuxiliaryPorts,
        principalPort: nodePrincipalPort
      },
      position,
      type: 'custom'
    };
    setEdges((eds) => eds.filter((e) => e.source != nodeId && e.target != nodeId));
    setNodes((nds) => {
      const nodesNew = nds.filter((n) => n.id !== nodeId);
      nodesNew.push(nodeNew);

      nodeAuxiliaryLinks.forEach((ids, index) => {
        if (nodesNew.find((n, _) => n.id == ids.idNode)) {
          const edgeNew: Edge = {
            id: `E_${ids.idNode}:${ids.idPort}-${nodeId}:${nodeAuxiliaryPorts[index].id}`,
            source: ids.idNode,
            target: nodeId,
            sourceHandle: ids.idPort,
            targetHandle: `${nodeAuxiliaryPorts[index].id}t`,
          }
          setEdges((es) => es.concat(edgeNew));
        }
      });

      if (nodesNew.find((n, _) => n.id == nodePrincipalLink.idNode)) {
        const isAP = nodesNew.find((n, _) => n.id == nodePrincipalPort.id && n.data.principalPort.id == nodePrincipalLink.idPort);
        const edgeNew: Edge = {
          id: `E_${nodeId}:${nodePrincipalPort.id}-${nodePrincipalLink.idNode}:${nodePrincipalLink.idPort}`,
          source: nodeId,
          target: nodePrincipalLink.idNode,
          sourceHandle: nodePrincipalPort.id,
          targetHandle: `${nodePrincipalLink.idPort}t`,
          animated: isAP ? true : false,
          style: isAP ? { stroke: 'blue' } : {},
        }
        setEdges((es) => es.concat(edgeNew));
      }

      return nodesNew;
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
            nodeSelected={nodeSelected}
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
