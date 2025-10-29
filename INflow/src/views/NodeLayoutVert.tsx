import { type AgentData } from '@/nets';
import { labelAgentHTML } from '@components/NodeLayout';
import { auxiliaryPortTD, principalPortTD } from '@components/NodeLayoutGen';

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
    <div className={needLimit ? 'node-layout__vert' : undefined}>
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
    </div>
  );
};
