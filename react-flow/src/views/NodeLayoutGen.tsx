import { Position } from '@xyflow/react';
import { type Port, type AgentData } from '../nets';
import { handleAuxiliaryPort, handlePrinciplePort, labelAgentHTML } from './NodeLayout';

export const auxiliaryPortHTML = (port: Port, needLimit: boolean): React.JSX.Element => {
  return <>
    <td style={{ left: '-12px' }}>
      {handleAuxiliaryPort(port, Position.Left, needLimit)}
      <div style={{ paddingLeft: '4px' }}>
        <span style={{ color: 'gray', left: '-10px' }}>{port.id ? `(${port.id})` : undefined} </span>
        {port.label}
      </div>
    </td>
  </>
};

export const principalPortHTML = (
  data: AgentData,
  rowSpan: number | undefined,
  needLimit: boolean,
): React.JSX.Element => {
  return <>
    <td style={{ right: '-12px', textAlign: 'right' }} rowSpan={rowSpan}>
      <div style={{ paddingRight: '4px' }}>
        {data.principalPort.label}
        <span style={{ color: 'gray' }}> {data.principalPort.id ? `(${data.principalPort.id})` : undefined}</span>
      </div>
      {handlePrinciplePort(data, Position.Right, needLimit)}
      {/* {needLimit || data.principalPort.id || data.principalPort.label ? handle('source', Position.Bottom, data.principalPort.id, { background: 'blue' }) : ''} */}
    </td>
  </>
};

export default ({ id, data, needLimit = true }: {
  id: string; data: AgentData; needLimit?: boolean
}): React.JSX.Element => {
  return <>
    <table style={{ textAlign: 'left', margin: '2px' }}><tbody>
      <tr><td style={{ paddingBottom: '8px', textAlign: 'center' }}>
        {labelAgentHTML(data, id)}
      </td></tr>

      {/* <div className='auxiliaryPorts-gen'> */}
      {data.auxiliaryPorts.map((port, index) => (
        <tr key={index}>
          {auxiliaryPortHTML(port, needLimit)}
        </tr>
      ))}
      {/* </div> */}

      <tr>
        {principalPortHTML(data, undefined, needLimit)}
      </tr>
    </tbody></table >
  </>;
}
