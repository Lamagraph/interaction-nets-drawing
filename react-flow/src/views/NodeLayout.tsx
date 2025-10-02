import { Handle, HandleType, Position } from '@xyflow/react';

import { type Port, type AgentData } from '../nets'
import HandleLayout from './HandleLayout';

interface PropsHandle {
  type: HandleType;
  pos: Position;
  id: string;
  style: {};
  needLimit: boolean;
}

const handle = (props: PropsHandle): React.JSX.Element => {
  const { type, pos, id, style } = props;
  if (!props.needLimit) return <Handle type={type} position={pos} key={id} id={id} style={style} />
  return <HandleLayout type={type} position={pos} key={id} id={id} style={style} />
}

export const handleAuxiliaryPort = (port: Port, pos: Position, needLimit: boolean): React.JSX.Element => {
  return handle({ type: 'source', pos: pos, id: port.id, style: {}, needLimit: needLimit })
};

export const handlePrinciplePort = (data: AgentData, pos: Position, needLimit: boolean): React.JSX.Element => {
  return handle({
    type: 'source',
    pos: pos,
    id: data.principalPort.id,
    style: { background: 'blue' },
    needLimit: needLimit,
  })
};

export const labelAgentHTML = (data: AgentData, id: string): React.JSX.Element => {
  return <>
    {data.label}
    <span style={{ color: 'gray' }}> {data.label ? `(${id})` : 'Write the label'}</span>
  </>
};

export default ({ id, data, needLimit = true }: {
  id: string; data: AgentData; needLimit?: boolean
}): React.JSX.Element => {
  return (
    <div style={{ position: 'relative' }}>
      <div className='auxiliaryPorts-def'>
        {data.auxiliaryPorts.map(port => (
          <div style={{ position: 'relative' }}>
            {handleAuxiliaryPort(port, Position.Top, needLimit)}
          </div>
        ))}
      </div>

      <table><tbody>
        <tr>
          {data.auxiliaryPorts.map(port => (
            <td>{port.label}</td>
          ))}
        </tr>

        <tr><td colSpan={data.auxiliaryPorts.length}>
          {labelAgentHTML(data, id)}
        </td></tr>

        <tr><td colSpan={data.auxiliaryPorts.length}>{data.principalPort.label}</td></tr>
      </tbody></table>

      <div className='principalPort-def'>
        <div style={{ position: 'relative' }}>
          {handlePrinciplePort(data, Position.Bottom, needLimit)}
        </div>
      </div>
    </div>
  );
}
