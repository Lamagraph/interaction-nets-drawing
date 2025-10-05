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

import { SimplifyMenuControl, NetMode, compareNet } from '../views/MenuControl';
import MenuLayouts from '../views/MenuLayouts';

import { nodeTypes, edgeTypes } from './Flow';

const indexNet = 1;

interface PropsSubFlow {
  filesOpened: [string, string];
  setFilesOpened: React.Dispatch<React.SetStateAction<[string, string]>>;
  modeNet: NetMode;
  setModeNet: React.Dispatch<React.SetStateAction<NetMode>>;
  netsSaved: [Agent[], Edge[], string][];
  setNetsSaved: React.Dispatch<React.SetStateAction<[Agent[], Edge[], string][]>>;
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
    setNetsSaved,
    indexCur,
    setIndexCur,
    typeNode,
    typeEdge,
    isRunningLayouts,
    setIsRunningLayouts,
  } = props;

  // Main

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

  const toggleNet = useCallback(() => {
    const setNetCur = (net: [Agent[], Edge[], string]) => {
      setNodes(net[0]);
      setEdges(net[1]);
      setFileOpened(net[2]);
    };

    const netLeft = netsSaved[indexCur];
    const netRight = netsSaved[indexCur + 1];
    const netComp = compareNet({
      netOne: netRight,
      netTwo: netLeft,
      types: [typeNode, typeEdge],
      isStepUp: Boolean(indexNet),
    });
    if (netComp) setNetCur(netComp);
  }, [indexCur, netsSaved, typeNode, typeEdge, modeNet]);

  useEffect(() => {
    const indexNew = indexCur + 1;
    if (indexNew >= netsSaved.length) return;

    setNodes(netsSaved[indexNew][0]);
    setEdges(netsSaved[indexNew][1]);
    setFileOpened(netsSaved[indexNew][2]);
  }, [indexCur, netsSaved, typeNode, typeEdge, modeNet]);

  useEffect(() => {
    toggleNet();
  }, [indexCur, modeNet]);

  // Node and edge types

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

  // Net edit mode

  const goToEditNet = () => {
    setModeNet(NetMode.edit);
    setIndexCur(index => index + 1);
    setFilesOpened(files => [files[1], files[1]]);
  };

  // Utils

  const { fitView } = useReactFlow<Agent, Edge>();

  useEffect(() => {
    fitView();
  }, [indexCur, modeNet]);

  const [rfInstance, setRfInstance] = useState(null);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onInit={setRfInstance}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
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
      <MenuLayouts
        isRunningLayouts={isRunningLayouts}
        indexLayout={indexNet}
        setIsRunningLayout={setIsRunningLayout}
      />
      <div>
        <SimplifyMenuControl
          nodes={nodes}
          edges={edges}
          indexCur={indexCur}
          netsSaved={netsSaved}
          setNetsSaved={setNetsSaved}
          fileOpened={fileOpened}
          rfInstance={rfInstance}
          isRunningLayout={isRunningLayouts[0] || isRunningLayouts[1]}
          goToEditNet={goToEditNet}
        />
        <Panel position='bottom-left' className='panel-info' >
          <div className='item-info'>
            <label className='label-info'>File:</label>
            <label className='label-info'>{fileOpened}</label>
          </div>
        </Panel>
      </div>
      <Background />
      <MiniMap />
    </ReactFlow>
  );
}
