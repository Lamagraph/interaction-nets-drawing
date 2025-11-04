import { createContext, useContext, useState } from 'react';
import { type Edge } from '@xyflow/react';

import {
  type PointConnection,
  type Port,
  defPort,
  defPointCon,
  Agent,
  getTargetHandle,
} from '@/nets';

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
  setMCContext: (nodeSelected: Agent | undefined, edges: Edge[]) => void;
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

  const setMCContext = (nodeSelected: Agent | undefined, edges: Edge[]) => {
    if (!nodeSelected) {
      cleanUpInfoNode();
      return;
    }

    setNodeId(nodeSelected.id);
    setNodeLabel(nodeSelected.data.label);
    const auxPorts = nodeSelected.data.auxiliaryPorts;
    setNodeAuxiliaryPorts(auxPorts);
    setNodePrincipalPort(nodeSelected.data.principalPort);
    setNodeAuxiliaryLinks(Array(auxPorts.length).fill(defPointCon));

    edges.forEach(edge => {
      if (edge.source === nodeSelected.id) {
        if (nodeSelected.data.principalPort.id === edge.sourceHandle) {
          setNodePrincipalLink({ idNode: edge.target, idPort: getTargetHandle(edge) });
        } else {
          const indexAuxPort = auxPorts.findIndex(port => port.id === edge.sourceHandle);
          setNodeAuxiliaryLinks(links =>
            links.map((port, i) =>
              i === indexAuxPort
                ? { ...port, idNode: edge.target, idPort: getTargetHandle(edge) }
                : port,
            ),
          );
        }
      } else if (edge.target === nodeSelected.id) {
        if (nodeSelected.data.principalPort.id === getTargetHandle(edge)) {
          setNodePrincipalLink({ idNode: edge.source, idPort: edge.sourceHandle ?? '' });
        } else {
          const indexAuxPort = auxPorts.findIndex(port => port.id === getTargetHandle(edge));
          setNodeAuxiliaryLinks(links =>
            links.map((port, i) =>
              i === indexAuxPort
                ? { ...port, idNode: edge.source, idPort: edge.sourceHandle ?? '' }
                : port,
            ),
          );
        }
      }
    });
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
        setMCContext,
      }}
    >
      {children}
    </MCContext.Provider>
  );
};

export const useNodeParametersState = () => {
  const context = useContext(MCContext);
  if (context) {
    return context;
  }
  throw new Error('useNodeParametersState must be used within MCProvider');
};
