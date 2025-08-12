import { Panel, useNodesInitialized, useReactFlow } from '@xyflow/react';

import { type CustomNode } from '../nets';

import { getLayoutedNodes as dagreLayoutNodes } from '../layouts/dagreLayout';
import { getLayoutedNodes as elkHLayoutNodes } from '../layouts/elkLayoutHandles';
import { getLayoutedNodes as elkLayoutNodes, elkOptions } from '../layouts/elkLayouts';
import { getLayoutedNodes as dLayoutNodes } from '../layouts/dLayout';
import { getLayoutedNodes as dForceLayoutNodes } from '../layouts/dForceLayout';
import { useState } from 'react';

export default () => {
  const { getNodes, getEdges, setNodes, fitView } = useReactFlow<CustomNode>();
  const nodesInitialized = useNodesInitialized();

  const [, { toggle }] = dForceLayoutNodes();

  const [isRunning, setIsRunning] = useState(false);

  const dagreLayout = async (direction: string) => {
    if (nodesInitialized) {
      const layoutedNodes = await dagreLayoutNodes(getNodes() as CustomNode[], getEdges(), direction);
      setNodes(layoutedNodes);
      fitView();
    }
  };

  const elkHandlesLayout = async () => {
    if (nodesInitialized) {
      const layoutedNodes = await elkHLayoutNodes(getNodes() as CustomNode[], getEdges());
      setNodes(layoutedNodes);
      fitView();
    }
  };

  const elkLayout = async (direction: string) => {
    if (nodesInitialized) {
      const layoutedNodes = await elkLayoutNodes(getNodes() as CustomNode[], getEdges(),
        { 'elk.direction': direction, ...elkOptions });
      setNodes(layoutedNodes);
      fitView();
    }
  };

  const dLayout = async () => {
    if (nodesInitialized) {
      const layoutedNodes = await dLayoutNodes(getNodes() as CustomNode[], getEdges());
      setNodes(layoutedNodes);
      fitView();
    }
  };

  const dForceLayout = () => {
    toggle();
    setIsRunning(!isRunning);
  };

  return (
    <Panel position='top-right' className='panel-layouts'>
      <label className='xy-theme__label'>Layouts:</label>
      <div>
        <button className='xy-theme__button' onClick={() => dagreLayout('TB')} disabled={isRunning} >
          Dagre: vertical
        </button>
        <button className='xy-theme__button' onClick={() => dagreLayout('LR')} disabled={isRunning} >
          Dagre: horizontal
        </button>
        <button className='xy-theme__button' onClick={elkHandlesLayout} disabled={isRunning} >
          ELK-handles
        </button>
        <button className='xy-theme__button' onClick={() => elkLayout('DOWN')} disabled={isRunning} >
          ELK: vertical
        </button>
        <button className='xy-theme__button' onClick={() => elkLayout('RIGHT')} disabled={isRunning} >
          ELK: horizontal
        </button>
        <button className='xy-theme__button' onClick={dLayout} disabled={isRunning} >
          D3-hierarchy
        </button>
        <button className='xy-theme__button' onClick={dForceLayout}>
          {isRunning ? 'Stop' : 'Start'} D3-force
        </button>
      </div>
    </Panel>
  );
};
