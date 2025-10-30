import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Edge,
  Panel,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { useINflowState } from '@utils/INflowContext';
import { nodeTypes, edgeTypes } from '@utils/typesElements';

import { type Agent, type Net } from '@/nets';
import { SimplifyMenuControl, NetMode, compareNet } from '@components/MenuControl';
import MenuLayouts from '@components/MenuLayouts';

const indexNet = 1;

export default (): JSX.Element => {
  const {
    instanceINflow: { netsSaved, indexCur, modeNet, typeNode, typeEdge, filesOpened },
    setIndexCur,
    setModeNet,
    setFilesOpened,
    isRunningLayouts,
    setIsRunningLayouts,
  } = useINflowState();

  // Main

  const { fitView } = useReactFlow<Agent, Edge>();

  const [nodes, setNodes, onNodesChange] = useNodesState<Agent>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const fileOpened = filesOpened[indexNet];
  const setFileOpened = (nameFile: string) => {
    setFilesOpened(files => [files[0], nameFile]);
  };

  const isRunningLayout = isRunningLayouts[indexNet];
  const setIsRunningLayout = (value: boolean) => {
    setIsRunningLayouts(flags => [flags[0], value]);
  };

  // Several nets
  const setNetCur = (net: Net) => {
    setNodes(net.agents);
    setEdges(net.edges);
    setFileOpened(net.name);
  };

  const toggleNet = useCallback(() => {
    const netLeft = netsSaved[indexCur];
    const netRight = netsSaved[indexCur + 1];
    if (!netRight) return; // only for safety

    const netComp = compareNet({
      netOne: netRight,
      netTwo: netLeft,
      types: [typeNode, typeEdge],
      isStepUp: Boolean(indexNet),
      isPinPos: false,
    });
    if (netComp) setNetCur(netComp);
  }, [netsSaved, indexCur, typeNode, typeEdge]);

  // Net mode
  const goToEditNet = () => {
    setModeNet(NetMode.edit);
    setIndexCur(index => index + 1);
  };

  // Utils
  const inabilityInteract = !isRunningLayout;

  // Effects

  useEffect(() => {
    const indexNew = indexCur + 1;
    if (indexNew >= netsSaved.length) return;
    setNetCur(netsSaved[indexNew]);
  }, [netsSaved, modeNet]);

  useEffect(() => {
    toggleNet();
  }, [toggleNet, indexCur]);

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
    <ReactFlow
      id={`${indexNet}`}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
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
      deleteKeyCode={modeNet === NetMode.edit && inabilityInteract ? ['Delete', 'Backspace'] : null}
    >
      <MenuLayouts indexNet={indexNet} setIsRunningLayout={setIsRunningLayout} />
      <div>
        <SimplifyMenuControl
          fileOpened={fileOpened}
          isRunningLayout={isRunningLayouts[0] || isRunningLayouts[1]}
          goToEditNet={goToEditNet}
        />
        <Panel id="SubFlowInfo" position="bottom-left" className="panel-info">
          <div className="item-info">
            <label className="label-info">File:</label>
            <label className="label-info">{fileOpened}</label>
          </div>
        </Panel>
      </div>
      <Background id={`${indexNet}`} />
      <MiniMap id={`${indexNet}`} />
    </ReactFlow>
  );
};
