// https://reactflow.dev/examples/interaction/drag-and-drop

import { createContext, useContext, useState } from 'react';

// Drag-and-drop

interface DnDContextType {
  type: string;
  setType: React.Dispatch<React.SetStateAction<string>>;
}

export const DnDContext = createContext<DnDContextType | null>(null);

export const DnDProvider = ({ children }: { children: JSX.Element }): JSX.Element => {
  const [type, setType] = useState('agentHor');

  return <DnDContext.Provider value={{ type, setType }}>{children}</DnDContext.Provider>;
};

export const useDnD = () => {
  return useContext(DnDContext);
};
