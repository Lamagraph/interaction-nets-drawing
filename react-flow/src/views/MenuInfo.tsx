
import { Panel } from '@xyflow/react';

export default ({ setTypeNode, setTypeEdge, fileOpened }: {
  setTypeNode: React.Dispatch<React.SetStateAction<string>>,
  setTypeEdge: React.Dispatch<React.SetStateAction<string>>,
  fileOpened: string,
}) => {
  const onChangeNode = (event: any) => {
    setTypeNode(event.target.value);
  };
  const onChangeEdge = (event: any) => {
    setTypeEdge(event.target.value);
  };

  return (
    <Panel position='bottom-left' className='panel-info' >
      <div className='item-info'>
        <label className='label-info'>Node:</label>
        <select
          className='xy-theme__select select-info'
          onChange={onChangeNode}
          data-testid='colormode-select'
        >
          <option value='agent'>horizontal</option>
          <option value='agentVert'>vertical</option>
          <option value='agentGen'>general</option>
        </select>
      </div>

      <div className='item-info'>
        <label className='label-info'>Edge:</label>
        <select
          className='xy-theme__select select-info'
          onChange={onChangeEdge}
          data-testid='colormode-select'
        >
          <option value='bezier'>bezier</option>
          <option value='smoothstep'>smoothstep</option>
          <option value='smartBezier'>smart bezier</option>
          <option value='smartStraight'>smart straight</option>
          <option value='smartStep'>smart step</option>
        </select>
      </div>

      <div className='item-info'>
        <label className='label-info'>File:</label>
        <label className='label-info'>{fileOpened}</label>
      </div>
    </Panel>
  );
};
