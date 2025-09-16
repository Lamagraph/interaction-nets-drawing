import { useState } from 'react';
import { type Edge, Panel, useNodesInitialized, useReactFlow } from '@xyflow/react';

import { FaEye, FaEyeSlash } from 'react-icons/fa';

import { type Agent } from '../nets';
import { getLayoutedNodes as dagreLayoutNodes } from '../layouts/dagreLayout';
import { getLayoutedNodes as elkHLayoutNodes } from '../layouts/elkLayoutHandles';
import { getLayoutedNodes as elkLayoutNodes, elkOptions } from '../layouts/elkLayouts';
import { getLayoutedNodes as dLayoutNodes } from '../layouts/dLayout';
import { getLayoutedNodes as dForceLayoutNodes } from '../layouts/dForceLayout';

export default (
  { isRunningLayout, setIsRunningLayout }:
    { isRunningLayout: boolean, setIsRunningLayout: React.Dispatch<React.SetStateAction<boolean>> }
) => {
  const { getNodes, getEdges, setNodes, fitView } = useReactFlow<Agent, Edge>();
  const nodesInitialized = useNodesInitialized();

  const dagreLayout = (direction: string) => {
    if (nodesInitialized) {
      const nodesLayouted = dagreLayoutNodes(getNodes(), getEdges(), direction);
      setNodes(nodesLayouted);
      fitView();
    }
  };

  const dLayout = () => {
    if (nodesInitialized) {
      const nodesLayouted = dLayoutNodes(getNodes(), getEdges());
      setNodes(nodesLayouted);
      fitView();
    }
  };

  const elkHandlesLayout = async () => {
    if (nodesInitialized) {
      const nodesLayouted = await elkHLayoutNodes(getNodes(), getEdges());
      setNodes(nodesLayouted);
      fitView();
    }
  };

  const elkLayout = async (direction: string) => {
    if (nodesInitialized) {
      const nodesLayouted = await elkLayoutNodes(getNodes(), getEdges(),
        { 'elk.direction': direction, ...elkOptions });
      setNodes(nodesLayouted);
      fitView();
    }
  };

  const { toggle } = dForceLayoutNodes();

  const dForceLayout = () => {
    toggle();
    setIsRunningLayout(!isRunningLayout);
  };

  const [layoutsShowed, setLayoutsShowed] = useState<boolean>(false);

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
            <button className='xy-theme__button' onClick={() => dagreLayout('TB')} disabled={isRunningLayout} >
              Dagre: vertical
            </button>
            <button className='xy-theme__button' onClick={() => dagreLayout('LR')} disabled={isRunningLayout} >
              Dagre: horizontal
            </button>
            <button className='xy-theme__button' onClick={elkHandlesLayout} disabled={isRunningLayout} >
              ELK-handles
            </button>
            <button className='xy-theme__button' onClick={() => elkLayout('DOWN')} disabled={isRunningLayout} >
              ELK: vertical
            </button>
            <button className='xy-theme__button' onClick={() => elkLayout('RIGHT')} disabled={isRunningLayout} >
              ELK: horizontal
            </button>
            <button className='xy-theme__button' onClick={dLayout} disabled={isRunningLayout} >
              D3-hierarchy
            </button>
          </>
        )}
        <button className='xy-theme__button' onClick={dForceLayout} id={'forceLayout'}>
          {isRunningLayout ? 'Stop' : 'Start'} D3-force
        </button>
      </div>
    </Panel>
  );
};
