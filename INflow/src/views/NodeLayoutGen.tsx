import { Position } from '@xyflow/react';
import { type Port, type AgentData } from '@/nets';
import { handleAuxiliaryPort, handlePrinciplePort, labelAgentHTML } from '@components/NodeLayout';

export const auxiliaryPortTD = (port: Port, isNoPreview: boolean): JSX.Element => {
  return (
    <td style={{ left: '-12px' }}>
      {handleAuxiliaryPort(port, Position.Left, isNoPreview)}
      <div style={{ paddingLeft: '4px' }}>
        <span style={{ color: 'gray', left: '-10px' }}>
          {port.id ? `(${port.id})` : undefined}{' '}
        </span>
        {port.label}
      </div>
    </td>
  );
};

export const principalPortTD = (
  data: AgentData,
  isNoPreview: boolean,
  rowSpan?: number,
): JSX.Element => {
  return (
    <td style={{ right: '-12px', textAlign: 'right' }} rowSpan={rowSpan}>
      <div style={{ paddingRight: '4px' }}>
        {data.principalPort.label}
        <span style={{ color: 'gray' }}>
          {' '}
          {data.principalPort.id ? `(${data.principalPort.id})` : undefined}
        </span>
      </div>
      {handlePrinciplePort(data, Position.Right, isNoPreview)}
    </td>
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
    <table style={{ textAlign: 'left', margin: '2px' }}>
      <tbody>
        <tr>
          <td style={{ paddingBottom: '8px', textAlign: 'center' }}>{labelAgentHTML(data, id)}</td>
        </tr>

        {data.auxiliaryPorts.map((port, index) => (
          <tr key={index}>{auxiliaryPortTD(port, isNoPreview)}</tr>
        ))}

        <tr>{principalPortTD(data, isNoPreview, undefined)}</tr>
      </tbody>
    </table>
  );
};
