import { Handle, HandleType, Position } from '@xyflow/react';

import { type Port, type AgentData } from '../nets';
import PortLayout from './PortLayout';

interface PropsHandle {
  type: HandleType;
  pos: Position;
  id: string;
  style: React.CSSProperties;
  needLimit: boolean;
}

const handle = (props: PropsHandle): JSX.Element => {
  const { type, pos, id, style } = props;
  if (!props.needLimit) return <Handle type={type} position={pos} key={id} id={id} style={style} />;
  return <PortLayout type={type} position={pos} key={id} id={id} style={style} />;
};

export const handleAuxiliaryPort = (port: Port, pos: Position, needLimit: boolean): JSX.Element => {
  return handle({ type: 'source', pos: pos, id: port.id, style: {}, needLimit: needLimit });
};

export const handlePrinciplePort = (
  data: AgentData,
  pos: Position,
  needLimit: boolean,
): JSX.Element => {
  return handle({
    type: 'source',
    pos: pos,
    id: data.principalPort.id,
    style: { background: 'blue' },
    needLimit: needLimit,
  });
};

export const labelAgentHTML = (data: AgentData, id: string): JSX.Element => {
  return (
    <>
      {data.label}
      <span style={{ color: 'gray' }}> {data.label ? `(${id})` : 'Write the label'}</span>
    </>
  );
};

export default ({
  id,
  data,
  needLimit = true,
}: {
  id: string;
  data: AgentData;
  needLimit?: boolean;
}): JSX.Element => {
  return (
    <div className={needLimit ? 'node-layout__hor' : undefined} style={{ position: 'relative' }}>
      <div className="auxiliaryPorts-def">
        {data.auxiliaryPorts.map(port => (
          <div key={port.id} style={{ position: 'relative' }}>
            {handleAuxiliaryPort(port, Position.Top, needLimit)}
          </div>
        ))}
      </div>

      <table>
        <tbody>
          <tr>
            {data.auxiliaryPorts.map(port => (
              <td key={port.id}>{port.label}</td>
            ))}
          </tr>

          <tr>
            <td colSpan={data.auxiliaryPorts.length}>{labelAgentHTML(data, id)}</td>
          </tr>

          <tr>
            <td colSpan={data.auxiliaryPorts.length}>{data.principalPort.label}</td>
          </tr>
        </tbody>
      </table>

      <div className="principalPort-def">
        <div style={{ position: 'relative' }}>
          {handlePrinciplePort(data, Position.Bottom, needLimit)}
        </div>
      </div>
    </div>
  );
};
