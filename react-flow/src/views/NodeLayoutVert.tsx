import { type AgentData } from '../nets';
import { labelAgentHTML } from './NodeLayout';
import { auxiliaryPortTD, principalPortTD } from './NodeLayoutGen';

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
    <table style={{ textAlign: 'left' }}>
      <tbody>
        <tr>
          <td colSpan={2} style={{ paddingBottom: '8px', textAlign: 'center' }}>
            {labelAgentHTML(data, id)}
          </td>
        </tr>

        {data.auxiliaryPorts.length ? (
          data.auxiliaryPorts.map((port, index) => (
            <tr key={index}>
              {auxiliaryPortTD(port, needLimit)}
              {index === 0 && principalPortTD(data, data.auxiliaryPorts.length, needLimit)}
            </tr>
          ))
        ) : (
          <tr>{principalPortTD(data, data.auxiliaryPorts.length, needLimit)}</tr>
        )}
      </tbody>
    </table>
  );
};
