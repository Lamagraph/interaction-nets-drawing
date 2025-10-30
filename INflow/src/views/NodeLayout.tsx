import { HandleType, Position } from '@xyflow/react';

import { type Port, type AgentData } from '@/nets';
import PortLayout from '@components/PortLayout';

interface PropsHandle {
  id: string;
  type: HandleType;
  pos: Position;
  style: React.CSSProperties;
  isNoPreview: boolean;
}

const handle = (props: PropsHandle): JSX.Element => {
  const { type, pos, id, style } = props;
  if (!props.isNoPreview) {
    return (
      <div
        id={id || 'P0'}
        key={'preview_port'}
        className={`react-flow__handle react-flow__handle-${pos} nodrag nopan source connectablestart connectableend`}
        style={style}
      />
    );
  }
  return <PortLayout type={type} position={pos} key={id} id={id} style={style} />;
};

export const handleAuxiliaryPort = (
  port: Port,
  pos: Position,
  isNoPreview: boolean,
): JSX.Element => {
  return handle({ type: 'source', pos: pos, id: port.id, style: {}, isNoPreview: isNoPreview });
};

export const handlePrinciplePort = (
  data: AgentData,
  pos: Position,
  isNoPreview: boolean,
): JSX.Element => {
  return handle({
    type: 'source',
    pos: pos,
    id: data.principalPort.id,
    style: { background: 'blue' },
    isNoPreview: isNoPreview,
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
  isNoPreview = true,
}: {
  id: string;
  data: AgentData;
  isNoPreview?: boolean;
}): JSX.Element => {
  return (
    <div style={{ position: 'relative' }}>
      <div className="auxiliaryPorts-def">
        {data.auxiliaryPorts.map(port => (
          <div key={port.id} style={{ position: 'relative' }}>
            {handleAuxiliaryPort(port, Position.Top, isNoPreview)}
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
          {handlePrinciplePort(data, Position.Bottom, isNoPreview)}
        </div>
      </div>
    </div>
  );
};
