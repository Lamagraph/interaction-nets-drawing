import { Handle, Position, useNodeConnections } from '@xyflow/react';

export default ({ id, data }) => {
  // const connections = useNodeConnections({
  //   id: id,
  //   handleType: 'source',
  // });

  return (
    <div style={{ position: 'relative' }}>
      <div className='auxiliaryPorts'>
        {data.auxiliaryPorts.map(port => (
          <div style={{ position: 'relative' }}>
            <Handle
              type='source'
              position={Position.Top}
              key={port.id}
              id={port.id}
            // isConnectable={useNodeConnections({ handleType: 'source' }).length == 0}
            // isConnectableStart={useNodeConnections({ handleType: 'source', handleId: port.id }).length == 0}
            />
            <Handle
              type='target'
              position={Position.Top}
              key={`${port.id}t`}
              id={`${port.id}t`}
            // isConnectable={useNodeConnections({ handleType: 'target' }).length == 0}
            // isConnectable={useNodeConnections({ handleType: 'target', handleId: `${port.id}t` }).length == 0}
            />
          </div>
        ))}
      </div>

      <table style={{ borderCollapse: 'collapse' }}><tbody>
        <tr>
          {data.auxiliaryPorts.map(port => (
            <td>{port.label}</td>
          ))}
        </tr>
        <tr><td colSpan={data.auxiliaryPorts.length}>
          {data.label}
          {/* {connections} */}
          <span style={{ color: 'gray' }}> {data.label ? `(${id})` : 'Write the label'}</span>
        </td></tr>
        <tr><td colSpan={data.auxiliaryPorts.length}>{data.principalPort.label}</td></tr>
      </tbody></table>

      <div className='principalPort'>
        <div style={{ position: 'relative' }}>
          <Handle
            type='source'
            position={Position.Bottom}
            key={data.principalPort.id}
            id={data.principalPort.id}
            // isConnectable={useNodeConnections({ handleType: 'source' }).length == 0}
            // isConnectableStart={useNodeConnections({ handleType: 'source', handleId: data.principalPort.id }).length == 0}
            style={{ background: 'blue' }}
          />
          <Handle
            type='target'
            position={Position.Bottom}
            key={`${data.principalPort.id}t`}
            id={`${data.principalPort.id}t`}
            // isConnectable={useNodeConnections({ handleType: 'target' }).length == 0}
            // isConnectable={useNodeConnections({ handleType: 'target', handleId: `${data.principalPort.id}t` }).length == 0}
            style={{ background: 'blue' }}
          />
        </div>
      </div>
    </div >
  );
}
