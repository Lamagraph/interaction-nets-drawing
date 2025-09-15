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

import { type Port, type Agent, getObjectsByName, parseJSON, isActivePair } from './nets';
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
  const [nodes, setNodes, onNodesChange] = useNodesState<Agent>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [fileOpened, setFileOpened] = useState<string>(nameFileStart);
  const [typeEdge, setTypeEdge] = useState<string>('bezier');

  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    setEdges(prev =>
      prev.map(edge => ({
        ...edge,
        type: typeEdge
      }))
    );
  }, [typeEdge]);

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

  const reactFlowWrapper = useRef(null);

  const [rfInstance, setRfInstance] = useState(null);

  const [nodeId, setNodeId] = useState<string>('');
  const [nodeLabel, setNodeLabel] = useState<string>('');
  const [nodeAuxiliaryPorts, setNodeAuxiliaryPorts] = useState<Port[]>([]);
  const [nodePrincipalPort, setNodePrincipalPort] = useState<Port>({ id: '', label: null });
  const [nodeAuxiliaryLinks, setNodeAuxiliaryLinks] = useState<
    {
      idNode: string;
      idPort: string;
    }[]
  >([]);
  const [nodePrincipalLink, setNodePrincipalLink] = useState<
    {
      idNode: string;
      idPort: string;
    }
  >({ idNode: '', idPort: '' });

  const { screenToFlowPosition } = useReactFlow<Agent, Edge>();
  const [type] = useDnD();

  const [nodeSelected, setNodeSelected] = useState<Agent>();

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
    const auxPs = nodeSelected.data.auxiliaryPorts;
    setNodeAuxiliaryPorts(auxPs);
    setNodePrincipalPort(nodeSelected.data.principalPort);
    setNodeAuxiliaryLinks(Array(auxPs.length).fill({ idNode: "", idPort: "" }));

    edges.forEach((edge) => {
      if (edge.source == nodeSelected.id) {
        if (nodeSelected.data.principalPort.id == edge.sourceHandle) {
          setNodePrincipalLink({ idNode: edge.target, idPort: edge.targetHandle!.slice(0, -1) })
        } else {
          setNodeAuxiliaryLinks(prev =>
            prev.map((port, j) =>
              j === auxPs.findIndex((port) => port.id == edge.sourceHandle) ?
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
              j === auxPs.findIndex((port) => port.id == edge.targetHandle!.slice(0, -1)) ?
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

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds: Edge[]) =>
        addEdge({ ...params, type: typeEdge }, eds)
      );
    }, [setEdges, typeEdge]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const isAllowed = useCallback(() => {
    return (nodeId && nodeLabel && nodePrincipalPort.id && !nodeAuxiliaryPorts.find((port, _) => !port.id));
  }, [nodeId, nodeLabel, nodeAuxiliaryPorts, nodePrincipalPort, setNodes]);

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
        if (ndsNew.find((n, _) => n.id == ids.idNode)) {
          const edgeNew: Edge = {
            id: `E_${ids.idNode}:${ids.idPort}-${nodeId}:${nodeAuxiliaryPorts[index].id}`,
            source: ids.idNode,
            target: nodeId,
            sourceHandle: ids.idPort,
            targetHandle: `${nodeAuxiliaryPorts[index].id}t`,
            type: typeEdge,
          }
          setEdges((es) => es.concat(edgeNew));
        }
      });

      if (ndsNew.find((n, _) => n.id == nodePrincipalLink.idNode)) {
        const isAuxP = ndsNew.find((n, _) =>
          n.id == nodePrincipalPort.id && n.data.principalPort.id == nodePrincipalLink.idPort
        );
        const edNew: Edge = {
          id: `E_${nodeId}:${nodePrincipalPort.id}-${nodePrincipalLink.idNode}:${nodePrincipalLink.idPort}`,
          source: nodeId,
          target: nodePrincipalLink.idNode,
          sourceHandle: nodePrincipalPort.id,
          targetHandle: `${nodePrincipalLink.idPort}t`,
          animated: isAuxP ? true : false,
          style: isAuxP ? { stroke: 'blue' } : {},
          type: typeEdge,
        }
        setEdges((es) => es.concat(edNew));
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
