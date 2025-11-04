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
  OnInit,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { useINflowState } from '@utils/INflowContext';
import { useDnD } from '@utils/DnDContext';
import { useNodeParametersState } from '@utils/MCContext';
import { nodeTypes, edgeTypes } from '@utils/typesElements';
import { compareNet } from '@/utils/netCompare';
import { getNetSetup, updateLocalStorage } from '@/utils/dataManagement';

import { type Agent, isActivePair, type Net, isAllowedToCreate } from '@/nets';
import MenuControl, { NetMode } from '@components/MenuControl';
import MenuLayouts from '@components/MenuLayouts';
import MenuConfig from '@components/MenuConfig';
import MenuInfo from '@components/MenuInfo';

const indexNet = 0;

export default (): JSX.Element => {
  const {
    instanceINflow: { netsSaved, indexCur, modeNet, typeNode, typeEdge, filesOpened },
    setIndexCur,
    setModeNet,
    setFilesOpened,
    isRunningLayouts,
    setIsRunningLayouts,
  } = useINflowState();

  // Setup
  const onInit: OnInit<Agent, Edge> = (instance: ReactFlowInstance<Agent, Edge>) => {
    const setup = async () => {
      const net = await getNetSetup(typeNode, typeEdge);
      instance.setNodes(net.agents);
      instance.setEdges(net.edges);
      setFileOpened(net.name);
    };

    setup();
    fitView();
  };

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

  // Add and edit net

  const {
    nodeId,
    nodeLabel,
    nodeAuxiliaryPorts,
    nodePrincipalPort,
    nodeAuxiliaryLinks,
    nodePrincipalLink,
    cleanUpInfoNode,
    setMCContext,
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
    return isAllowedToCreate(nodeId, nodeLabel, nodePrincipalPort, nodeAuxiliaryPorts);
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

  const inabilityInteract = !isRunningLayout;

  // Effects

  useEffect(() => {
    if (nodes.length) updateLocalStorage(nodes, edges, fileOpened);
  }, [nodes.length, edges.length]);

  useEffect(() => {
    if (isRunningLayout) unselectNode();
  }, [unselectNode]);

  useEffect(() => {
    setMCContext(nodeSelected, edges);
    // setNodeInfoBySelect();
  }, [nodeSelected]);

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
    setTimeout(() => fitView(), 10);
  }, [indexCur, modeNet]);

  return (
    <div className="dndflow">
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          id={`${indexNet}`}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onInit={onInit}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          attributionPosition="bottom-left"
          fitView
          data-testmode={`${modeNet}`}
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
          <MenuLayouts indexNet={indexNet} setIsRunningLayout={setIsRunningLayout} />
          <div>
            <MenuControl
              nodes={nodes}
              edges={edges}
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
          <Background id={`${indexNet}`} />
          <MiniMap id={`${indexNet}`} />
        </ReactFlow>
      </div>
    </div>
  );
};
