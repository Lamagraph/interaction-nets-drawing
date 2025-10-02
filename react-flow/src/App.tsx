import { useState } from 'react';
import { ReactFlowProvider, type Edge } from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { type Agent } from './nets';

import { NetMode } from './views/MenuControl';
import { DnDProvider } from './utils/DnDContext';
import Flow from './flows/Flow';
import SubFlow from './flows/SubFlow';

export default (): JSX.Element => {
  // Several nets

  const [netsSaved, setNetsSaved] = useState<[Agent[], Edge[], string][]>([]);
  const [indexCur, setIndexCur] = useState<number>(-1);
  const [filesOpened, setFilesOpened] = useState<[string, string]>(['', '']);

  // Net mode

  const [modeNet, setModeNet] = useState<NetMode>(NetMode.edit);

  // Node and edge types

  const [typeNode, setTypeNode] = useState<string>('agent');

  const [typeEdge, setTypeEdge] = useState<string>('bezier');

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flex: 1 }}>
        <ReactFlowProvider>
          <DnDProvider>
            <Flow
              filesOpened={filesOpened}
              setFilesOpened={setFilesOpened}
              modeNet={modeNet}
              setModeNet={setModeNet}
              netsSaved={netsSaved}
              setNetsSaved={setNetsSaved}
              indexCur={indexCur}
              setIndexCur={setIndexCur}
              typeNode={typeNode}
              setTypeNode={setTypeNode}
              typeEdge={typeEdge}
              setTypeEdge={setTypeEdge}
            />
          </DnDProvider>
        </ReactFlowProvider>
      </div>

      {netsSaved.length > 1 && (
        <div style={{ flex: modeNet === NetMode.comparison ? 1 : 0 }}>
          <ReactFlowProvider>
            <SubFlow
              filesOpened={filesOpened}
              setFilesOpened={setFilesOpened}
              modeNet={modeNet}
              setModeNet={setModeNet}
              netsSaved={netsSaved}
              setNetsSaved={setNetsSaved}
              indexCur={indexCur}
              setIndexCur={setIndexCur}
              typeNode={typeNode}
              typeEdge={typeEdge}
            />
          </ReactFlowProvider>
        </div>
      )}
    </div>
  );
}
