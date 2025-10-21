import { Panel } from '@xyflow/react';

import { useFlowState } from '../utils/FlowContext';

import { NetMode } from './MenuControl';

interface PropsMenuInfo {
  fileOpened: string;
  setModeNet: (mode: NetMode) => void;
  isRunningLayout: boolean;
}

export default (props: PropsMenuInfo): JSX.Element => {
  const { modeNet, setTypeNode, setTypeEdge } = useFlowState();
  const { fileOpened, setModeNet, isRunningLayout } = props;

  const onChangeMode = (event: any) => {
    setModeNet(Number(event.target.value));
  };
  const onChangeNode = (event: any) => {
    setTypeNode(event.target.value);
  };
  const onChangeEdge = (event: any) => {
    setTypeEdge(event.target.value);
  };

  return (
    <Panel position="bottom-left" className="panel-info">
      {modeNet !== NetMode.edit && (
        <div className="item-info">
          <label className="label-info">Mode:</label>
          <select
            className="xy-theme__select select-info"
            onChange={onChangeMode}
            data-testid="colormode-select"
            disabled={isRunningLayout}
          >
            <option value={NetMode.comparison}>comparison</option>
            <option value={NetMode.sequence}>sequence</option>
          </select>
        </div>
      )}

      <div className="item-info">
        <label className="label-info">Node:</label>
        <select
          className="xy-theme__select select-info"
          onChange={onChangeNode}
          data-testid="colormode-select"
          disabled={isRunningLayout}
        >
          <option value="agentHor">horizontal</option>
          <option value="agentVert">vertical</option>
          <option value="agentGen">general</option>
        </select>
      </div>

      <div className="item-info">
        <label className="label-info">Edge:</label>
        <select
          className="xy-theme__select select-info"
          onChange={onChangeEdge}
          data-testid="colormode-select"
          disabled={isRunningLayout}
        >
          <option value="bezier">bezier</option>
          <option value="smoothstep">smoothstep</option>
          <option value="smartBezier">smart bezier</option>
          <option value="smartStraight">smart straight</option>
          <option value="smartStep">smart step</option>
        </select>
      </div>

      <div className="item-info">
        <label className="label-info">File:</label>
        <label className="label-info">{fileOpened}</label>
      </div>
    </Panel>
  );
};
