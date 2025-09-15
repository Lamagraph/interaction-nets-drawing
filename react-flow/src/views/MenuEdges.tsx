import { Panel } from "@xyflow/react";

export default ({ setTypeEdge }) => {
  const onChange = (evt) => {
    setTypeEdge(evt.target.value);
  };

  return (
    <Panel position="bottom-left" style={{ left: '40px' }}>
      <select
        className="xy-theme__select"
        onChange={onChange}
        data-testid="colormode-select"
      >
        <option value="bazier">bazier</option>
        <option value="smoothstep">smoothstep</option>
        <option value="smartBezier">smart bezier</option>
        <option value="smartStraight">smart straight</option>
        <option value="smartStep">smart step</option>
      </select>
    </Panel>
  );
};
