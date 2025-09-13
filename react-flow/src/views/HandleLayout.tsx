import { Handle, useNodeConnections } from '@xyflow/react';

export default (props) => {
  const connections = useNodeConnections({
    handleType: props.type,
  });

  return (
    <Handle
      {...props}
      isConnectable={connections.length < 1}
    />
  );
};
