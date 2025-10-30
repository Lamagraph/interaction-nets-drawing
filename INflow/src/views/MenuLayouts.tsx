import { useState } from 'react';
import { type Edge, Panel, useNodesInitialized, useReactFlow } from '@xyflow/react';

import { FaEye, FaEyeSlash } from 'react-icons/fa';

import { useINflowState } from '@utils/INflowContext';

import { type Agent } from '@/nets';
import { getLayoutedNodes as dagreLayoutNodes } from '@layouts/dagreLayout';
import { getLayoutedNodes as elkHLayoutNodes } from '@layouts/elkLayoutHandles';
import { getLayoutedNodes as elkLayoutNodes, elkOptions } from '@layouts/elkLayouts';
import { getLayoutedNodes as dLayoutNodes } from '@layouts/dLayout';
import { getLayoutedNodes as dForceLayoutNodes } from '@layouts/dForceLayout';

export default ({
  indexNet,
  setIsRunningLayout,
}: {
  indexNet: number;
  setIsRunningLayout: (value: boolean) => void;
}): JSX.Element => {
  const { isRunningLayouts } = useINflowState();
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
      const nodesLayouted = await elkLayoutNodes(getNodes(), getEdges(), {
        'elk.direction': direction,
        ...elkOptions,
      });
      setNodes(nodesLayouted);
      fitView();
    }
  };

  const { toggle } = dForceLayoutNodes();

  const dForceLayout = () => {
    toggle();
    setIsRunningLayout(!isRunningLayouts[indexNet]);
  };

  const [layoutsShowed, setLayoutsShowed] = useState<boolean>(false);

  return (
    <div id={`MenuLayouts-${indexNet}`}>
      <Panel position="top-right" className="panel-layouts">
        <div>
          {layoutsShowed && (
            <label className="xy-theme__label" style={{ marginBottom: '10px' }}>
              Layouts
            </label>
          )}
        </div>

        <div>
          <button
            title={layoutsShowed ? 'Show less' : 'Show more'}
            className="xy-theme__button"
            onClick={() => setLayoutsShowed(!layoutsShowed)}
          >
            {layoutsShowed ? <FaEyeSlash /> : <FaEye />}
          </button>
          {layoutsShowed && (
            <>
              <button
                className="xy-theme__button"
                onClick={() => dagreLayout('TB')}
                id="layout__Dagre-vertical"
                disabled={isRunningLayouts[indexNet]}
              >
                Dagre: vertical
              </button>
              <button
                className="xy-theme__button"
                onClick={() => dagreLayout('LR')}
                id="layout__Dagre-horizontal"
                disabled={isRunningLayouts[indexNet]}
              >
                Dagre: horizontal
              </button>
              <button
                className="xy-theme__button"
                onClick={elkHandlesLayout}
                id="layout__ELK-handles"
                disabled={isRunningLayouts[indexNet]}
              >
                ELK-handles
              </button>
              <button
                className="xy-theme__button"
                onClick={() => elkLayout('DOWN')}
                id="layout__ELK-vertical"
                disabled={isRunningLayouts[indexNet]}
              >
                ELK: vertical
              </button>
              <button
                className="xy-theme__button"
                onClick={() => elkLayout('RIGHT')}
                id="layout__ELK-horizontal"
                disabled={isRunningLayouts[indexNet]}
              >
                ELK: horizontal
              </button>
              <button
                className="xy-theme__button"
                onClick={dLayout}
                id="layout__D3-hierarchy"
                disabled={isRunningLayouts[indexNet]}
              >
                D3-hierarchy
              </button>
            </>
          )}

          <button
            className="xy-theme__button"
            onClick={dForceLayout}
            id="layout__D3-force"
            disabled={isRunningLayouts[1 - indexNet]}
          >
            {isRunningLayouts[indexNet] ? 'Stop' : 'Start'} D3-force
          </button>
        </div>
      </Panel>
    </div>
  );
};
