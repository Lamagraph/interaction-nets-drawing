import { useCallback, useState } from 'react';
import { Panel, useReactFlow, XYPosition } from '@xyflow/react';

import { FaInfoCircle } from 'react-icons/fa';
import '@xyflow/react/dist/style.css';

import NodeLayout from './NodeLayout';
import { useDnD } from './DnDContext';
import { defPort, type Port, type Agent, PointConnetion, defPointCon } from '../nets';

interface PropsMenuConfig {
  addItem: (position: XYPosition) => void,
  isAllowed: () => boolean,
  nodeId: string,
  setNodeId: React.Dispatch<React.SetStateAction<string>>,
  nodeLabel: string,
  setNodeLabel: React.Dispatch<React.SetStateAction<string>>,
  nodeAuxiliaryPorts: Port[],
  setNodeAuxiliaryPorts: React.Dispatch<React.SetStateAction<Port[]>>,
  nodePrincipalPort: Port,
  setNodePrincipalPort: React.Dispatch<React.SetStateAction<Port>>,
  nodeAuxiliaryLinks: PointConnetion[],
  setNodeAuxiliaryLinks: React.Dispatch<React.SetStateAction<PointConnetion[]>>,
  nodePrincipalLink: PointConnetion,
  setNodePrincipalLink: React.Dispatch<React.SetStateAction<PointConnetion>>,
  nodeSelected: Agent | undefined,
  isRunningLayout: boolean,
}

export default (props: PropsMenuConfig) => {
  const {
    addItem,
    isAllowed,
    nodeId,
    setNodeId,
    nodeLabel,
    setNodeLabel,
    nodeAuxiliaryPorts,
    setNodeAuxiliaryPorts,
    nodePrincipalPort,
    setNodePrincipalPort,
    nodeAuxiliaryLinks,
    setNodeAuxiliaryLinks,
    nodePrincipalLink,
    setNodePrincipalLink,
    nodeSelected,
    isRunningLayout,
  } = props;

  const [linkShowed, setLinkShowed] = useState<boolean>(false);

  const [_, setType] = useDnD();

  const onDragStart = (event, nodeType) => {
    if (setType) setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const { getInternalNode } = useReactFlow();

  const onAdd = useCallback(() => {
    if (isAllowed()) {
      if (nodeSelected) {
        const nodeInternal = getInternalNode(nodeSelected.id);
        if (!nodeInternal) return null;

        const absPosition = nodeInternal?.internals.positionAbsolute;
        addItem(absPosition);
      } else {
        addItem({ x: 50, y: 50 });
      }
    }
  }, [
    nodeId, nodeLabel, nodeAuxiliaryPorts,
    nodePrincipalPort, nodeAuxiliaryLinks,
    nodePrincipalLink, nodeSelected,
  ]);

  return (
    !isRunningLayout && (
      <Panel position='top-left'>
        <div className='react-flow__node'>
          <table style={{ borderCollapse: 'collapse' }}><tbody>

            {/* Help line */}
            <tr>
              <th>
                Auxiliary
                <button onClick={() => {
                  setNodeAuxiliaryPorts(ports => [...ports, defPort]);
                  setNodeAuxiliaryLinks(links => [...links, defPointCon]);
                }}>+</button>
              </th>
              <th>
                <label className='xy-theme__label'>Show links:</label>
                <input
                  type='checkbox'
                  checked={linkShowed}
                  onChange={(event) => setLinkShowed(event.target.checked)}
                  className='xy-theme__checkbox'
                />
              </th>
              {linkShowed && <th colSpan={2}></th>}
              <th><a
                href='https://github.com/Friend-zva/interaction-nets-drawing/blob/main/react-flow/README.md'
                target='_blank'
                className='xy-theme__label'
                style={{ color: 'inherit' }}
              >
                <FaInfoCircle size={20} />
              </a></th>
            </tr>

            {/* Auxiliary ports */}
            {nodeAuxiliaryPorts.map((_, i) => (
              <tr key={i}>
                <td><input
                  placeholder='id'
                  value={nodeAuxiliaryPorts[i].id}
                  onChange={(event) => {
                    setNodeAuxiliaryPorts(ports =>
                      ports.map((port, j) => j === i ? { ...port, id: event.target.value } : port)
                    );
                  }}
                  className='xy-theme__input input-info'
                /></td>
                <td><input
                  placeholder='label'
                  value={nodeAuxiliaryPorts[i].label ?? '' as string}
                  onChange={(event) => {
                    setNodeAuxiliaryPorts(ports =>
                      ports.map((port, j) => j === i ? { ...port, label: event.target.value } : port)
                    );
                  }}
                  className='xy-theme__input input-info'
                /></td>

                {/* Auxiliary links */}
                {linkShowed && (
                  <>
                    <td>
                      <input
                        placeholder='node id'
                        value={nodeAuxiliaryLinks[i].idNode}
                        onChange={(event) => {
                          setNodeAuxiliaryLinks(links =>
                            links.map((port, j) =>
                              j === i ? { ...port, idNode: event.target.value } : port
                            )
                          );
                        }}
                        className='xy-theme__input input-info'
                      />
                    </td>
                    <td>
                      <input
                        placeholder='port id'
                        value={nodeAuxiliaryLinks[i].idPort}
                        onChange={(event) => {
                          setNodeAuxiliaryLinks(links =>
                            links.map((port, j) =>
                              j === i ? { ...port, idPort: event.target.value } : port
                            )
                          );
                        }}
                        className='xy-theme__input input-info'
                      />
                    </td>
                  </>
                )}

                <td><button onClick={() => {
                  setNodeAuxiliaryPorts(ports => ports.filter((_, j) => j !== i));
                  setNodeAuxiliaryLinks(links => links.filter((_, j) => j !== i));
                }}>-</button></td>
              </tr>
            ))}

            {/* Node info */}
            <tr><th colSpan={2}>Main</th></tr>
            <tr>
              <td><input
                placeholder='id'
                value={nodeId}
                onChange={(event) => setNodeId(event.target.value)}
                className='xy-theme__input input-info'
              /></td>
              <td><input
                placeholder='label'
                value={nodeLabel}
                onChange={(event) => setNodeLabel(event.target.value)}
                className='xy-theme__input input-info'
              /></td>
            </tr>

            {/* Principle port */}
            <tr><th colSpan={2}>Principle</th></tr>
            <tr>
              <td><input
                placeholder='id'
                value={nodePrincipalPort.id}
                onChange={(event) => {
                  setNodePrincipalPort(port => ({ ...port, id: event.target.value }));
                }}
                className='xy-theme__input input-info'
              /></td>
              <td><input
                placeholder='label'
                value={nodePrincipalPort.label ?? '' as string}
                onChange={(event) => {
                  setNodePrincipalPort(port => ({ ...port, label: event.target.value }));
                }}
                className='xy-theme__input input-info'
              /></td>

              {/* Principle link */}
              {linkShowed && (
                <>
                  <td>
                    <input
                      placeholder='node id'
                      value={nodePrincipalLink.idNode}
                      onChange={(event) => {
                        setNodePrincipalLink(link => ({ ...link, idNode: event.target.value }));
                      }}
                      className='xy-theme__input input-info'
                    />
                  </td>
                  <td>
                    <input
                      placeholder='port id'
                      value={nodePrincipalLink.idPort}
                      onChange={(event) => {
                        setNodePrincipalLink(link => ({ ...link, idPort: event.target.value }));
                      }}
                      className='xy-theme__input input-info'
                    />
                  </td>
                </>
              )}
            </tr>

            {/* 'Add' button */}
            <tr><td colSpan={2} style={{ padding: '10px' }}>
              <button
                className='xy-theme__button'
                onClick={onAdd}
                disabled={!isAllowed()}
              >{nodeSelected && !isRunningLayout ? 'Edit agent' : 'Add agent'}</button>
            </td></tr>

            {/* Node preview */}
            <tr><td colSpan={2}>
              <div
                className='react-flow__node'
                style={{ position: 'relative', cursor: isAllowed() ? 'grab' : 'not-allowed' }}
                draggable={isAllowed() ? true : false}
                onDragStart={(event) => onDragStart(event, 'agent')}
              >
                <NodeLayout
                  id={nodeId}
                  data={{
                    label: nodeLabel,
                    auxiliaryPorts: nodeAuxiliaryPorts,
                    principalPort: nodePrincipalPort
                  }}
                  needLimit={false}
                />
              </div>
            </td></tr>

          </tbody></table>

        </div>
      </Panel>
    )
  );
};
