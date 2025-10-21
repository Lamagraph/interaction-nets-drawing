import { ReactFlowProvider } from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { AppProvider, useApp } from './utils/AppContext';

import { NetMode } from './views/MenuControl';
import { DnDProvider } from './utils/DnDContext';
import MainFlow from './flows/MainFlow';
import SubFlow from './flows/SubFlow';

const Flow = (): JSX.Element => {
  const { netsSaved, modeNet } = useApp();

  return (
    <div style={{ display: 'flex', height: '100%', gap: 10 }}>
      <div style={{ flex: 1 }}>
        <ReactFlowProvider>
          <DnDProvider>
            <MainFlow />
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
    <AppProvider>
      <Flow />
    </AppProvider>
  );
};
