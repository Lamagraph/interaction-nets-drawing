import { type AgentData } from '../nets'
import { labelAgentHTML } from './NodeLayout';
import { auxiliaryPortHTML, principalPortHTML } from './NodeLayoutGen';

export default ({ id, data, needLimit = true }: {
  id: string; data: AgentData; needLimit?: boolean
}): React.JSX.Element => {
  return <>
    <table style={{ textAlign: 'left' }}><tbody>
      <tr><td colSpan={2} style={{ paddingBottom: '8px', textAlign: 'center' }}>
        {labelAgentHTML(data, id)}
      </td></tr>

      {data.auxiliaryPorts.length ? (
        data.auxiliaryPorts.map((port, index) => (
          <tr key={index}>
            {auxiliaryPortHTML(port, needLimit)}
            {index === 0 && principalPortHTML(data, data.auxiliaryPorts.length, needLimit)}
          </tr>
        ))
      ) : principalPortHTML(data, data.auxiliaryPorts.length, needLimit)}
    </tbody></table>
  </>;
}
