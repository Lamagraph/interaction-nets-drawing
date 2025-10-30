import { type AgentData } from '@/nets';
import { labelAgentHTML } from '@components/NodeLayout';
import { auxiliaryPortTD, principalPortTD } from '@components/NodeLayoutGen';

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
    <div className={isNoPreview ? 'node-layout__vert' : undefined}>
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
                {auxiliaryPortTD(port, isNoPreview)}
                {index === 0 && principalPortTD(data, isNoPreview, data.auxiliaryPorts.length)}
              </tr>
            ))
          ) : (
            <tr>{principalPortTD(data, isNoPreview, data.auxiliaryPorts.length)}</tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
