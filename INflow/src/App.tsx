import { ReactFlowProvider } from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { INflowProvider, useINflowState } from './utils/INflowContext';
import { DnDProvider } from './utils/DnDContext';
import { MCProvider } from './utils/MCContext';

import { NetMode } from './views/MenuControl';
import MainFlow from './flows/MainFlow';
import SubFlow from './flows/SubFlow';

const INflow = (): JSX.Element => {
  const {
    instanceINflow: { netsSaved, modeNet },
  } = useINflowState();

  return (
    <div style={{ display: 'flex', height: '100%', gap: 10 }}>
      <div style={{ flex: 1 }}>
        <ReactFlowProvider>
          <DnDProvider>
            <MCProvider>
              <MainFlow />
            </MCProvider>
          </DnDProvider>
        </ReactFlowProvider>
      </div>

      {netsSaved.length > 1 && modeNet === NetMode.comparison && (
        <div style={{ flex: 1 }}>
          <ReactFlowProvider>
            <SubFlow />
          </ReactFlowProvider>
        </div>
      )}
    </div>
  );
};

export default (): JSX.Element => {
  return (
    <INflowProvider>
      <INflow />
    </INflowProvider>
  );
};
