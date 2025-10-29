import { createContext, useContext, useState } from 'react';

import { type PointConnection, type Port, defPort, defPointCon } from '@/nets';

// MenuConfig
interface MCContextType {
  nodeId: string;
  setNodeId: React.Dispatch<React.SetStateAction<string>>;
  nodeLabel: string;
  setNodeLabel: React.Dispatch<React.SetStateAction<string>>;
  nodeAuxiliaryPorts: Port[];
  setNodeAuxiliaryPorts: React.Dispatch<React.SetStateAction<Port[]>>;
  nodePrincipalPort: Port;
  setNodePrincipalPort: React.Dispatch<React.SetStateAction<Port>>;
  nodeAuxiliaryLinks: PointConnection[];
  setNodeAuxiliaryLinks: React.Dispatch<React.SetStateAction<PointConnection[]>>;
  nodePrincipalLink: PointConnection;
  setNodePrincipalLink: React.Dispatch<React.SetStateAction<PointConnection>>;
  cleanUpInfoNode: () => void;
}

export const MCContext = createContext<MCContextType | null>(null);

export const MCProvider = ({ children }: { children: JSX.Element }): JSX.Element => {
  // Add and edit net

  const [nodeId, setNodeId] = useState<string>('');
  const [nodeLabel, setNodeLabel] = useState<string>('');
  const [nodePrincipalPort, setNodePrincipalPort] = useState<Port>(defPort);
  const [nodeAuxiliaryPorts, setNodeAuxiliaryPorts] = useState<Port[]>([]);

  const [nodePrincipalLink, setNodePrincipalLink] = useState<PointConnection>(defPointCon);
  const [nodeAuxiliaryLinks, setNodeAuxiliaryLinks] = useState<PointConnection[]>([]);

  const cleanUpInfoNode = () => {
    setNodeId('');
    setNodeLabel('');
    setNodeAuxiliaryPorts([]);
    setNodePrincipalPort(defPort);
    setNodeAuxiliaryLinks([]);
    setNodePrincipalLink(defPointCon);
  };

  return (
    <MCContext.Provider
      value={{
        nodeId,
        setNodeId,
        nodeLabel,
        setNodeLabel,
        nodeAuxiliaryPorts,
        setNodeAuxiliaryPorts,
        nodePrincipalPort,
        setNodePrincipalPort,
        nodeAuxiliaryLinks,
        setNodeAuxiliaryLinks,
        nodePrincipalLink,
        setNodePrincipalLink,
        cleanUpInfoNode,
      }}
    >
      {children}
    </MCContext.Provider>
  );
};

export const useNodeParametersState = () => {
  const mcContext = useContext(MCContext);

  if (!mcContext) {
    throw new Error('useNodeParametersState must be used within MCProvider');
  }

  return mcContext;
};
