import { createContext, useContext, useState } from 'react';

import { NetMode } from '@components/MenuControl';
import { transformObject, type Net } from '@/nets';

export type INflowInstance = {
  netsSaved: Net[];
  indexCur: number;
  modeNet: NetMode;
  typeNode: string;
  typeEdge: string;
  filesOpened: [string, string];
};

export const instanceToObject = (instance: INflowInstance) => {
  return {
    netsSaved: instance.netsSaved.map(transformObject),
    indexCur: instance.indexCur,
    modeNet: instance.modeNet,
    typeNode: instance.typeNode,
    typeEdge: instance.typeEdge,
    filesOpened: instance.filesOpened,
  };
};

interface INflowContextType {
  instanceINflow: INflowInstance;
  setNetsSaved: React.Dispatch<React.SetStateAction<Net[]>>;
  setIndexCur: React.Dispatch<React.SetStateAction<number>>;
  setModeNet: React.Dispatch<React.SetStateAction<NetMode>>;
  setTypeNode: React.Dispatch<React.SetStateAction<string>>;
  setTypeEdge: React.Dispatch<React.SetStateAction<string>>;
  setFilesOpened: React.Dispatch<React.SetStateAction<[string, string]>>;
  isRunningLayouts: [boolean, boolean];
  setIsRunningLayouts: React.Dispatch<React.SetStateAction<[boolean, boolean]>>;
}

export const INflowContext = createContext<INflowContextType | null>(null);

export const INflowProvider = ({ children }: { children: JSX.Element }): JSX.Element => {
  // Several nets

  const [netsSaved, setNetsSaved] = useState<Net[]>([]);
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
    <INflowContext.Provider
      value={{
        instanceINflow: {
          netsSaved: netsSaved,
          indexCur: indexCur,
          modeNet: modeNet,
          typeNode: typeNode,
          typeEdge: typeEdge,
          filesOpened: filesOpened,
        },
        setNetsSaved,
        setIndexCur,
        setModeNet,
        setTypeNode,
        setTypeEdge,
        setFilesOpened,
        isRunningLayouts,
        setIsRunningLayouts,
      }}
    >
      {children}
    </INflowContext.Provider>
  );
};

export const useINflowState = (): INflowContextType => {
  const context = useContext(INflowContext);

  if (!context) {
    throw new Error('useINflowState must be used within FlowProvider');
  }

  return context;
};
