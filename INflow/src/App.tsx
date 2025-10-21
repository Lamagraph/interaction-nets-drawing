import { ReactFlowProvider } from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { FlowProvider, useFlowState } from './utils/FlowContext';
import { DnDProvider } from './utils/DnDContext';
import { MCProvider } from './utils/MCContext';

import { NetMode } from './views/MenuControl';
import MainFlow from './flows/MainFlow';
import SubFlow from './flows/SubFlow';

const Flow = (): JSX.Element => {
  const { netsSaved, modeNet } = useFlowState();

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
    <FlowProvider>
      <Flow />
    </FlowProvider>
  );
};
