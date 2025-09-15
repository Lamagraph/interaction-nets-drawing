import { useState } from 'react';
import { Edge, Panel, useNodesInitialized, useReactFlow } from '@xyflow/react';

import { FaEye, FaEyeSlash } from 'react-icons/fa';

import { type Agent } from '../nets';
import { getLayoutedNodes as dagreLayoutNodes } from '../layouts/dagreLayout';
import { getLayoutedNodes as elkHLayoutNodes } from '../layouts/elkLayoutHandles';
import { getLayoutedNodes as elkLayoutNodes, elkOptions } from '../layouts/elkLayouts';
import { getLayoutedNodes as dLayoutNodes } from '../layouts/dLayout';
import { getLayoutedNodes as dForceLayoutNodes } from '../layouts/dForceLayout';

export default ({ isRunning, setIsRunning }) => {
  const { getNodes, getEdges, setNodes, fitView } = useReactFlow<Agent, Edge>();
  const nodesInitialized = useNodesInitialized();

  const [, { toggle }] = dForceLayoutNodes();

  const [layoutsShowed, setLayoutsShowed] = useState<boolean>(false);

  const dagreLayout = async (direction: string) => {
    if (nodesInitialized) {
      const ndsLayouted = await dagreLayoutNodes(getNodes(), getEdges(), direction);
      setNodes(ndsLayouted);
      fitView();
    }
  };

  const elkHandlesLayout = async () => {
    if (nodesInitialized) {
      const ndsLayouted = await elkHLayoutNodes(getNodes(), getEdges());
      setNodes(ndsLayouted);
      fitView();
    }
  };

  const elkLayout = async (direction: string) => {
    if (nodesInitialized) {
      const ndsLayouted = await elkLayoutNodes(getNodes(), getEdges(),
        { 'elk.direction': direction, ...elkOptions });
      setNodes(ndsLayouted);
      fitView();
    }
  };

  const dLayout = async () => {
    if (nodesInitialized) {
      const ndsLayouted = await dLayoutNodes(getNodes(), getEdges());
      setNodes(ndsLayouted);
      fitView();
    }
  };

  const dForceLayout = () => {
    toggle();
    setIsRunning(!isRunning);
  };

  return (
    <Panel position='top-right' className='panel-layouts'>
      <div>
        {layoutsShowed && <label className='xy-theme__label'>Layouts</label>}
      </div>

      <div>
        <button title={layoutsShowed ? 'Show less' : 'Show more'} className='xy-theme__button' onClick={() => setLayoutsShowed(!layoutsShowed)}>
          {layoutsShowed ? <FaEyeSlash /> : <FaEye />}
        </button>
        {layoutsShowed && (
          <>
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
          </>
        )}
        <button className='xy-theme__button' onClick={dForceLayout} id={'forceLayout'}>
          {isRunning ? 'Stop' : 'Start'} D3-force
        </button>
      </div>
    </Panel>
  );
};
