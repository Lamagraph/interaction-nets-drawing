// https://reactflow.dev/examples/interaction/drag-and-drop

import { createContext, useContext, useState } from 'react';

export const DnDContext = createContext([null, () => {}]);

export const DnDProvider = ({ children }: { children: any }) => {
  const [type, setType] = useState(null);

  return <DnDContext.Provider value={[type, setType]}>{children}</DnDContext.Provider>;
};

export const useDnD = () => {
  return useContext(DnDContext);
};
