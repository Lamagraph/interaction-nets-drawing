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
  Connection,
  XYPosition,
  ReactFlowInstance,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { useFlowState } from '../utils/FlowContext';
import { useDnD } from '../utils/DnDContext';
import { useNodeParametersState } from '../utils/MCContext';
import { nodeTypes, edgeTypes } from '../utils/typesElements';

import {
  type Agent,
  getObjectsByName,
  parseObjects,
  isActivePair,
  getTargetHandle,
  validate,
  defPointCon,
  type Net,
} from '../nets';
import MenuControl, { compareNet, NetMode } from '../views/MenuControl';
import MenuLayouts from '../views/MenuLayouts';
import MenuConfig from '../views/MenuConfig';
import MenuInfo from '../views/MenuInfo';

const dirNetsSaved = '../../saved-nets/';
const nameFileStart = 'list_add_1.json';
const indexNet = 0;

export default (): JSX.Element => {
  const {
    netsSaved,
    indexCur,
    setIndexCur,
    modeNet,
    setModeNet,
    isRunningLayouts,
    setIsRunningLayouts,
    typeNode,
    typeEdge,
    filesOpened,
    setFilesOpened,
  } = useFlowState();

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
      const [nds, eds] = await parseObjects(net, typeNode, typeEdge);
      setNodes(nds);
      setEdges(eds);
    } catch (error) {
      console.log(error);
      setNodes([]);
      setEdges([]);
    }
  };

  // Add and edit net
  const {
    nodeId,
    setNodeId,
    nodeLabel,
    setNodeLabel,
    nodeAuxiliaryPorts,
    setNodeAuxiliaryPorts,
    nodePrincipalPort,
    setNodePrincipalPort,
    nodeAuxiliaryLinks,
    setNodeAuxiliaryLinks,
    nodePrincipalLink,
    setNodePrincipalLink,
    cleanUpInfoNode,
  } = useNodeParametersState();

  /// Add node

  const addItem = (position: XYPosition) => {
    setIsRunningLayout(false);

    const ndNew: Agent = {
      id: nodeId,
      data: {
        label: nodeLabel,
        auxiliaryPorts: nodeAuxiliaryPorts,
        principalPort: nodePrincipalPort,
      },
      position,
      type: typeNode,
    };

    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    setNodes(nds => {
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
          };
          setEdges(es => addEdge(edNew, es));
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
        };
        setEdges(es => addEdge(edNew, es));
      }

      return ndsNew;
    });

    cleanUpInfoNode();
  };

  //// Add node with drag

  const { screenToFlowPosition } = useReactFlow<Agent, Edge>();
  const dndContext = useDnD();

  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    if (dndContext) dndContext.setType(typeNode);
    event.dataTransfer.setData('text/plain', typeNode);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();
      if (!dndContext?.type && !isAllowed()) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addItem(position);
    },
    [screenToFlowPosition, addItem, dndContext?.type],
  );

  /// Add edge with drag
  const onConnect = useCallback(
    (params: Connection) => {
      const isActPair = isActivePair(params, nodes);
      setIsRunningLayout(false);

      setEdges(eds =>
        addEdge(
          {
            ...params,
            id: `E_${params.source}:${params.sourceHandle}-${
              params.target
            }:${params.targetHandle?.slice(0, -1)}`,
            type: typeEdge,
            animated: isActPair,
            style: isActPair ? { stroke: 'blue' } : {},
          },
          eds,
        ),
      );
    },
    [typeEdge, nodes],
  );

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

    return setPorts.size === nodeAuxiliaryPorts.length + 1;
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

    edges.forEach(edge => {
      if (edge.source === nodeSelected.id) {
        if (nodeSelected.data.principalPort.id === edge.sourceHandle) {
          setNodePrincipalLink({ idNode: edge.target, idPort: getTargetHandle(edge) });
        } else {
          const indexAuxPort = auxPorts.findIndex(port => port.id === edge.sourceHandle);
          setNodeAuxiliaryLinks(links =>
            links.map((port, i) =>
              i === indexAuxPort
                ? { ...port, idNode: edge.target, idPort: getTargetHandle(edge) }
                : port,
            ),
          );
        }
      } else if (edge.target === nodeSelected.id) {
        if (nodeSelected.data.principalPort.id === getTargetHandle(edge)) {
          setNodePrincipalLink({ idNode: edge.source, idPort: edge.sourceHandle ?? '' });
        } else {
          const indexAuxPort = auxPorts.findIndex(port => port.id === getTargetHandle(edge));
          setNodeAuxiliaryLinks(links =>
            links.map((port, i) =>
              i === indexAuxPort
                ? { ...port, idNode: edge.source, idPort: edge.sourceHandle ?? '' }
                : port,
            ),
          );
        }
      }
    });
  }, [nodeSelected]);

  // Several nets

  const setNetCur = (net: Net) => {
    setNodes(net.agents);
    setEdges(net.edges);
    setFileOpened(net.name);
  };

  const setNetIndexCur = (index: number, net: Net) => {
    setIndexCur(index);
    setNetCur(net);
  };

  const resetNet = useCallback(() => setNetCur(netsSaved[indexCur]), [netsSaved, indexCur]);

  const setNetFirst = useCallback(() => {
    const netLeft = netsSaved[indexCur];
    const netRight = netsSaved[indexCur + 1];
    if (!netRight) {
      setNetCur(netLeft);
      return;
    }

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

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<Agent, Edge> | null>(null);

  const inabilityInteract = !isRunningLayout;

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
    setNodes(nds => nds.map(node => ({ ...node, type: typeNode })));
  }, [typeNode]);

  useEffect(() => {
    setEdges(eds => eds.map(edge => ({ ...edge, type: typeEdge })));
  }, [typeEdge]);

  useEffect(() => {
    fitView();
  }, [indexCur, modeNet]);

  return (
    <div className="dndflow">
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
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
          attributionPosition="bottom-left"
          fitView
          // If layout is running
          nodesDraggable={inabilityInteract}
          nodesConnectable={modeNet === NetMode.edit && inabilityInteract}
          nodesFocusable={inabilityInteract}
          edgesFocusable={inabilityInteract}
          elementsSelectable={modeNet === NetMode.edit && inabilityInteract}
          panOnDrag={inabilityInteract}
          zoomOnScroll={inabilityInteract}
          zoomOnPinch={inabilityInteract}
          zoomOnDoubleClick={inabilityInteract}
          connectOnClick={modeNet === NetMode.edit && inabilityInteract}
          deleteKeyCode={
            modeNet === NetMode.edit && inabilityInteract ? ['Delete', 'Backspace'] : null
          }
        >
          {modeNet == NetMode.edit && (
            <MenuConfig
              addItem={addItem}
              isAllowed={isAllowed}
              nodeSelected={nodeSelected}
              isRunningLayout={isRunningLayout}
              typeNode={typeNode}
            />
          )}
          <MenuLayouts indexLayout={indexNet} setIsRunningLayout={setIsRunningLayout} />
          <div>
            <MenuControl
              nodes={nodes}
              edges={edges}
              rfInstance={rfInstance}
              isRunningLayout={isRunningLayouts[0] || isRunningLayouts[1]}
              indexNet={indexNet}
              setNetIndexCur={setNetIndexCur}
            />
            <MenuInfo
              fileOpened={fileOpened}
              setModeNet={mode => {
                if (
                  mode === NetMode.comparison &&
                  indexCur === netsSaved.length - 1 &&
                  indexCur > 0
                ) {
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
};
