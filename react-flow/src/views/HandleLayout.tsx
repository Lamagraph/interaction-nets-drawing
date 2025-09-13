import { Handle, useNodeConnections } from '@xyflow/react';
import { useEffect, useState } from 'react';

export default (props) => {
  const connectionsS = useNodeConnections({
    handleType: props.type,
  });
  const connectionsT = useNodeConnections({
    handleType: 'target',
  });

  const [isNotConnectable, setIsNotConnectable] = useState(true);

  useEffect(() => {
    setIsNotConnectable(
      connectionsS.some(eds => eds.sourceHandle === props.id) ||
      connectionsT.some(eds => eds.targetHandle === `${props.id}t`)
    );
  }, [connectionsS, connectionsT]);

  return (
    <div>
      <Handle
        {...props}
        isConnectable={!isNotConnectable}
      />
      <Handle
        {...props}
        type='target'
        key={`${props.id}t`}
        id={`${props.id}t`}
        isConnectable={!isNotConnectable}
      />
    </div>
  );
};
