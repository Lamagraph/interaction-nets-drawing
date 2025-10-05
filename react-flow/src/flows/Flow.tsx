import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
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
} from '../nets';

import NodeLayout from '../views/NodeLayout';
import NodeLayoutVert from '../views/NodeLayoutVert';
import NodeLayoutGen from '../views/NodeLayoutGen';
import MenuControl, { compareNet, NetMode } from '../views/MenuControl';
import MenuLayouts from '../views/MenuLayouts';
import { useDnD } from '../utils/DnDContext';
import MenuConfig from '../views/MenuConfig';
import MenuInfo from '../views/MenuInfo';

const dirNetsSaved = '../../saved-nets/';
const nameFileStart = 'list_add_1.json';
const indexNet = 0;

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

interface PropsFlow {
  filesOpened: [string, string];
  setFilesOpened: React.Dispatch<React.SetStateAction<[string, string]>>;
  modeNet: NetMode;
  setModeNet: React.Dispatch<React.SetStateAction<NetMode>>;
  netsSaved: [Agent[], Edge[], string][];
  setNetsSaved: React.Dispatch<React.SetStateAction<[Agent[], Edge[], string][]>>;
  indexCur: number;
  setIndexCur: React.Dispatch<React.SetStateAction<number>>;
  typeNode: string;
  setTypeNode: React.Dispatch<React.SetStateAction<string>>;
  typeEdge: string;
  setTypeEdge: React.Dispatch<React.SetStateAction<string>>;
  isRunningLayouts: [boolean, boolean];
  setIsRunningLayouts: React.Dispatch<React.SetStateAction<[boolean, boolean]>>;
}

export default (props: PropsFlow): JSX.Element => {
  const {
    filesOpened,
    setFilesOpened,
    modeNet,
    setModeNet,
    netsSaved,
    setNetsSaved,
    indexCur,
    setIndexCur,
    typeNode,
    setTypeNode,
    typeEdge,
    setTypeEdge,
    isRunningLayouts,
    setIsRunningLayouts,
  } = props;

  // Main

  const { fitView } = useReactFlow<Agent, Edge>();

  const [nodes, setNodes, onNodesChange] = useNodesState<Agent>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const fileOpened = filesOpened[indexNet];
  const setFileOpened = (nameFile: string) => {
    setFilesOpened(files => [nameFile, files[1]]);
  };

  const isRunningLayout = isRunningLayouts[indexNet];
  const setIsRunningLayout = (value: boolean) => {
    setIsRunningLayouts(flags => [value, flags[1]]);
  };

  // Start
  const loadNetStart = async (nameFile: string) => {
    try {
      const net = await getObjectsByName(nameFile);
      const [nds, eds] = await parseJSON(net, typeNode, typeEdge);
      setNodes(nds);
      setEdges(eds);
    } catch (error) {
      console.log(error);
      setNodes([]);
      setEdges([]);
    }
  };

  // Add and edit net

  const [nodeId, setNodeId] = useState<string>('');
  const [nodeLabel, setNodeLabel] = useState<string>('');
  const [nodePrincipalPort, setNodePrincipalPort] = useState<Port>(defPort);
  const [nodeAuxiliaryPorts, setNodeAuxiliaryPorts] = useState<Port[]>([]);

  const [nodePrincipalLink, setNodePrincipalLink] = useState<PointConnection>(defPointCon);
  const [nodeAuxiliaryLinks, setNodeAuxiliaryLinks] = useState<PointConnection[]>([]);

  const cleanUpInfoNode = () => {
    setNodeId('');
    setNodeLabel('');
    setNodeAuxiliaryPorts([]);
    setNodePrincipalPort(defPort);
    setNodeAuxiliaryLinks([]);
    setNodePrincipalLink(defPointCon);
  };

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

  const onDragStart = (event: any, nodeType: any) => {
    if (setType) setType(nodeType);
    event.dataTransfer.setData('text/plain', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

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
  }, [typeEdge, nodes]);

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  /// Adding button
  const isAllowed = useCallback(() => {
    if (!validate(nodeId) || !validate(nodeLabel) || !validate(nodePrincipalPort.id)) return false;

    const setPorts = new Set([nodePrincipalPort.id]);

    for (const port of nodeAuxiliaryPorts) {
      if (!validate(port.id)) return false;
      setPorts.add(port.id.trim());
    }

    return setPorts.size === nodeAuxiliaryPorts.length + 1
  }, [nodeId, nodeLabel, nodePrincipalPort, nodeAuxiliaryPorts]);

  // Selected node

  const [nodeSelected, setNodeSelected] = useState<Agent>();

  const unselectNode = useCallback(() => {
    if (!nodeSelected) return;
    nodeSelected.selected = false;
    cleanUpInfoNode();
  }, [nodeSelected]);

  const onChange = useCallback(({ nodes }: { nodes: Agent[] }) => {
    setNodeSelected(nodes[0]);
  }, []);

  useOnSelectionChange({ onChange });

  const setNodeInfoBySelect = useCallback(() => {
    if (!nodeSelected) {
      cleanUpInfoNode();
      return;
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
  }, [nodeSelected]);

  // Several nets

  const setNetCur = (net: [Agent[], Edge[], string]) => {
    setNodes(net[0]);
    setEdges(net[1]);
    setFileOpened(net[2]);
  };

  const setNetIndexCur = (index: number, net: [Agent[], Edge[], string]) => {
    setIndexCur(index);
    setNetCur(net);
  };

  const resetNet = useCallback(() => setNetCur(netsSaved[indexCur]), [netsSaved, indexCur]);

  const setNetFirst = useCallback(() => {
    const netLeft = netsSaved[indexCur];
    const netRight = netsSaved[indexCur + 1];
    const netComp = compareNet({
      netOne: netLeft,
      netTwo: netRight,
      types: [typeNode, typeEdge],
      isStepUp: Boolean(indexNet),
      isPinPos: true,
    });
    if (netComp) setNetCur(netComp);
  }, [netsSaved, indexCur, typeNode, typeEdge]);

  // Utils

  const reactFlowWrapper = useRef(null);

  const [rfInstance, setRfInstance] = useState(null);

  // Effects

  useEffect(() => {
    setFileOpened(nameFileStart);
    loadNetStart(dirNetsSaved + nameFileStart);
  }, []);

  useEffect(() => {
    if (isRunningLayout) unselectNode();
  }, [unselectNode]);

  useEffect(setNodeInfoBySelect, [setNodeInfoBySelect]);

  useEffect(() => {
    if (indexCur < 0 || netsSaved.length === 0) return;
    if (modeNet === NetMode.edit) resetNet();
    else if (modeNet === NetMode.comparison) setNetFirst();
  }, [resetNet, setNetFirst, netsSaved, indexCur, modeNet]);

  useEffect(() => {
    setNodes(nds =>
      nds.map(node => ({ ...node, type: typeNode }))
    );
  }, [typeNode]);

  useEffect(() => {
    setNodes(nds =>
      nds.map(node => ({ ...node, type: typeNode }))
    );
  }, [typeEdge]);

  useEffect(() => { fitView() }, [indexCur, modeNet]);

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
          nodesConnectable={modeNet === NetMode.edit && !isRunningLayout}
          nodesFocusable={!isRunningLayout}
          edgesFocusable={!isRunningLayout}
          elementsSelectable={modeNet === NetMode.edit && !isRunningLayout}
          panOnDrag={!isRunningLayout}
          zoomOnScroll={!isRunningLayout}
          zoomOnPinch={!isRunningLayout}
          zoomOnDoubleClick={!isRunningLayout}
          connectOnClick={modeNet === NetMode.edit && !isRunningLayout}
          deleteKeyCode={modeNet === NetMode.edit && !isRunningLayout ? ['Delete', 'Backspace'] : null}
        >
          {modeNet == NetMode.edit && (
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
            />
          )}
          <MenuLayouts
            isRunningLayouts={isRunningLayouts}
            indexLayout={indexNet}
            setIsRunningLayout={setIsRunningLayout}
          />
          <div>
            <MenuControl
              nodes={nodes}
              edges={edges}
              typeNode={typeNode}
              typeEdge={typeEdge}
              filesOpened={filesOpened}
              rfInstance={rfInstance}
              isRunningLayout={isRunningLayouts[0] || isRunningLayouts[1]}
              modeNet={modeNet}
              setModeNet={setModeNet}
              netsSaved={netsSaved}
              setNetsSaved={setNetsSaved}
              indexCur={indexCur}
              setNetIndexCur={setNetIndexCur}
              indexNet={indexNet}
            />
            <MenuInfo
              modeNet={modeNet}
              fileOpened={fileOpened}
              setTypeNode={setTypeNode}
              setTypeEdge={setTypeEdge}
              setModeNet={(mode) => {
                if (mode === NetMode.comparison && indexCur === netsSaved.length - 1 && indexCur > 0) {
                  const indexNew = indexCur - 1;
                  setNetIndexCur(indexNew, netsSaved[indexNew]);
                }
                setModeNet(mode);
              }}
              isRunningLayout={isRunningLayouts[0] || isRunningLayouts[1]}
            />
          </div>
          <Background />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
