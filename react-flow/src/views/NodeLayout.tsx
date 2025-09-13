import { Handle, Position } from '@xyflow/react';
import HandleLayout from './HandleLayout';

export default ({ id, data, needLimit = true }) => {
  const handle = (type, pos, id, style = {}) => {
    if (!needLimit) return <Handle type={type} position={pos} key={id} id={id} style={style} />
    return <HandleLayout type={type} position={pos} key={id} id={id} style={style} />
  }

  return (
    <div style={{ position: 'relative' }}>
      <div className='auxiliaryPorts'>
        {data.auxiliaryPorts.map(port => (
          <div style={{ position: 'relative' }}>
            {handle('source', Position.Top, port.id)}
            {handle('target', Position.Top, `${port.id}t`)}
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
          <span style={{ color: 'gray' }}> {data.label ? `(${id})` : 'Write the label'}</span>
        </td></tr>
        <tr><td colSpan={data.auxiliaryPorts.length}>{data.principalPort.label}</td></tr>
      </tbody></table>

      <div className='principalPort'>
        <div style={{ position: 'relative' }}>
          {handle('source', Position.Bottom, data.principalPort.id, { background: 'blue' })}
          {handle('target', Position.Bottom, `${data.principalPort.id}t`, { background: 'blue' })}
        </div>
      </div>
    </div >
  );
}
