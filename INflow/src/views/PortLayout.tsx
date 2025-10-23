import { useEffect, useState } from 'react';
import { type Edge, Handle, HandleProps, useNodeConnections, useReactFlow } from '@xyflow/react';

import { type Agent } from '../nets';

export default (props: HandleProps): JSX.Element => {
  const { setEdges } = useReactFlow<Agent, Edge>();

  const connectionsS = useNodeConnections({
    handleType: props.type,
  });
  const connectionsT = useNodeConnections({
    handleType: 'target',
  });

  const [isNotConnectable, setIsNotConnectable] = useState(true);

  useEffect(() => {
    const idsEdge: string[] = [];
    connectionsS.forEach(ed => {
      if (ed.sourceHandle === props.id) idsEdge.push(ed.edgeId);
    });
    connectionsT.forEach(ed => {
      if (ed.targetHandle === `${props.id}t`) idsEdge.push(ed.edgeId);
    });

    setIsNotConnectable(idsEdge.length > 0);

    const idsEdgeInvalid: string[] = [];
    const connects = [...connectionsS, ...connectionsT];
    connects.forEach(ed => {
      if (ed.source === ed.target) idsEdgeInvalid.push(ed.edgeId);
    });

    if (idsEdge.length > 1) {
      const idEdgeValid = idsEdge.find(id => !idsEdgeInvalid.includes(id));
      idsEdge.forEach(id => {
        if (id !== idEdgeValid) idsEdgeInvalid.push(id);
      });
    }

    setEdges(eds => eds.filter(e => !idsEdgeInvalid.includes(e.id)));
  }, [setEdges, connectionsS, connectionsT]);

  return (
    <>
      <Handle {...props} isConnectable={!isNotConnectable} />
      <Handle
        {...props}
        type="target"
        key={`${props.id}t`}
        id={`${props.id}t`}
        isConnectable={!isNotConnectable}
      />
    </>
  );
};
