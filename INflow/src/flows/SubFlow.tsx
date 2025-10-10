import { useCallback, useEffect, useState } from 'react';
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

import { type Agent } from '../nets';

import { nodeTypes, edgeTypes } from '../utils/typesElements';

import { SimplifyMenuControl, NetMode, compareNet } from '../views/MenuControl';
import MenuLayouts from '../views/MenuLayouts';

const indexNet = 1;

interface PropsSubFlow {
  filesOpened: [string, string];
  setFilesOpened: React.Dispatch<React.SetStateAction<[string, string]>>;
  modeNet: NetMode;
  setModeNet: React.Dispatch<React.SetStateAction<NetMode>>;
  netsSaved: [Agent[], Edge[], string][];
  indexCur: number;
  setIndexCur: React.Dispatch<React.SetStateAction<number>>;
  typeNode: string;
  typeEdge: string;
  isRunningLayouts: [boolean, boolean];
  setIsRunningLayouts: React.Dispatch<React.SetStateAction<[boolean, boolean]>>;
}

export default (props: PropsSubFlow): JSX.Element => {
  const {
    filesOpened,
    setFilesOpened,
    modeNet,
    setModeNet,
    netsSaved,
    indexCur,
    setIndexCur,
    typeNode,
    typeEdge,
    isRunningLayouts,
    setIsRunningLayouts,
  } = props;

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
  const setNetCur = (net: [Agent[], Edge[], string]) => {
    setNodes(net[0]);
    setEdges(net[1]);
    setFileOpened(net[2]);
  };

  const toggleNet = useCallback(() => {
    const netLeft = netsSaved[indexCur];
    const netRight = netsSaved[indexCur + 1];
    if (!netRight) return;

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
  const [rfInstance, setRfInstance] = useState(null);

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
    fitView();
  }, [indexCur, modeNet]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onInit={setRfInstance}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      attributionPosition="bottom-left"
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
      <MenuLayouts
        isRunningLayouts={isRunningLayouts}
        indexLayout={indexNet}
        setIsRunningLayout={setIsRunningLayout}
      />
      <div>
        <SimplifyMenuControl
          fileOpened={fileOpened}
          rfInstance={rfInstance}
          isRunningLayout={isRunningLayouts[0] || isRunningLayouts[1]}
          goToEditNet={goToEditNet}
        />
        <Panel position="bottom-left" className="panel-info">
          <div className="item-info">
            <label className="label-info">File:</label>
            <label className="label-info">{fileOpened}</label>
          </div>
        </Panel>
      </div>
      <Background />
      <MiniMap />
    </ReactFlow>
  );
};
