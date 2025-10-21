import { createContext, useContext, useState } from 'react';
import { type Edge } from '@xyflow/react';

import { NetMode } from '../views/MenuControl';
import { type Agent } from '../nets';

interface FlowContextType {
  netsSaved: [Agent[], Edge[], string][];
  setNetsSaved: React.Dispatch<React.SetStateAction<[Agent[], Edge[], string][]>>;
  indexCur: number;
  setIndexCur: React.Dispatch<React.SetStateAction<number>>;
  modeNet: NetMode;
  setModeNet: React.Dispatch<React.SetStateAction<NetMode>>;
  isRunningLayouts: [boolean, boolean];
  setIsRunningLayouts: React.Dispatch<React.SetStateAction<[boolean, boolean]>>;
  typeNode: string;
  setTypeNode: React.Dispatch<React.SetStateAction<string>>;
  typeEdge: string;
  setTypeEdge: React.Dispatch<React.SetStateAction<string>>;
  filesOpened: [string, string];
  setFilesOpened: React.Dispatch<React.SetStateAction<[string, string]>>;
}

export const FlowContext = createContext<FlowContextType | null>(null);

export const FlowProvider = ({ children }: { children: JSX.Element }): JSX.Element => {
  // Several nets

  const [netsSaved, setNetsSaved] = useState<[Agent[], Edge[], string][]>([]);
  const [indexCur, setIndexCur] = useState<number>(-1);
  const [filesOpened, setFilesOpened] = useState<[string, string]>(['', '']);

  // Net mode
  const [modeNet, setModeNet] = useState<NetMode>(NetMode.edit);

  // Node and edge types

  const [typeNode, setTypeNode] = useState<string>('agentHor');

  const [typeEdge, setTypeEdge] = useState<string>('bezier');

  // Layout
  const [isRunningLayouts, setIsRunningLayouts] = useState<[boolean, boolean]>([false, false]);

  return (
    <FlowContext.Provider
      value={{
        netsSaved,
        setNetsSaved,
        indexCur,
        setIndexCur,
        modeNet,
        setModeNet,
        isRunningLayouts,
        setIsRunningLayouts,
        typeNode,
        setTypeNode,
        typeEdge,
        setTypeEdge,
        filesOpened,
        setFilesOpened,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
};

export const useFlowState = (): FlowContextType => {
  const flowContext = useContext(FlowContext);

  if (!flowContext) {
    throw new Error('useFlowState must be used within FlowProvider');
  }

  return flowContext;
};
