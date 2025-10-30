import { useCallback, useState } from 'react';
import { Panel, useReactFlow, XYPosition } from '@xyflow/react';

import { FaInfoCircle } from 'react-icons/fa';
import '@xyflow/react/dist/style.css';

import { useDnD } from '@utils/DnDContext';

import { defPort, type Agent, defPointCon } from '@/nets';
import NodeLayoutGen from '@components/NodeLayoutGen';
import { useNodeParametersState } from '@utils/MCContext';

interface PropsMenuConfig {
  addItem: (position: XYPosition) => void;
  isAllowed: () => boolean;
  nodeSelected?: Agent;
  isRunningLayout: boolean;
  typeNode: string;
}

export default (props: PropsMenuConfig): JSX.Element => {
  const {
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
  } = useNodeParametersState();
  const { addItem, isAllowed, nodeSelected, isRunningLayout, typeNode } = props;

  const [linkShowed, setLinkShowed] = useState<boolean>(false);

  const dndContext = useDnD();

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    if (dndContext) dndContext.setType(nodeType);
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
  }, [getInternalNode, addItem, nodeSelected]);

  return (
    <div data-testid="MenuConfig">
      {!isRunningLayout && (
        <Panel position="top-left">
          <div className="react-flow__node">
            <table>
              <tbody>
                <tr data-testid="help-line">
                  <th>
                    Auxiliary
                    <button
                      data-testid="add_aux-p"
                      disabled={nodeAuxiliaryPorts.length >= 15}
                      onClick={() => {
                        setNodeAuxiliaryPorts(ports => [...ports, defPort]);
                        setNodeAuxiliaryLinks(links => [...links, defPointCon]);
                      }}
                    >
                      +
                    </button>
                  </th>
                  <th>
                    <label className="xy-theme__label">Show links:</label>
                    <input
                      data-testid="show_links"
                      type="checkbox"
                      checked={linkShowed}
                      onChange={event => setLinkShowed(event.target.checked)}
                      className="xy-theme__checkbox"
                    />
                  </th>
                  {linkShowed && <th colSpan={2}></th>}
                  <th>
                    <a
                      href="https://github.com/Lamagraph/interaction-nets-drawing/blob/main/INflow/README.md"
                      target="_blank"
                      className="xy-theme__label"
                      style={{ color: 'inherit' }}
                      rel="noreferrer"
                    >
                      <FaInfoCircle size={20} />
                    </a>
                  </th>
                </tr>

                {/* Auxiliary ports */}
                {nodeAuxiliaryPorts.map((_, i) => (
                  <tr data-testid="auxiliary-line" key={i}>
                    <td>
                      <input
                        placeholder="id"
                        value={nodeAuxiliaryPorts[i].id}
                        onChange={event => {
                          setNodeAuxiliaryPorts(ports =>
                            ports.map((port, j) =>
                              j === i ? { ...port, id: event.target.value } : port,
                            ),
                          );
                        }}
                        className="xy-theme__input input-info"
                      />
                    </td>
                    <td>
                      <input
                        placeholder="label"
                        value={nodeAuxiliaryPorts[i].label ?? ('' as string)}
                        onChange={event => {
                          setNodeAuxiliaryPorts(ports =>
                            ports.map((port, j) =>
                              j === i ? { ...port, label: event.target.value } : port,
                            ),
                          );
                        }}
                        className="xy-theme__input input-info"
                      />
                    </td>

                    {/* Auxiliary links */}
                    {linkShowed && (
                      <>
                        <td>
                          <input
                            placeholder="node id"
                            value={nodeAuxiliaryLinks[i].idNode}
                            onChange={event => {
                              setNodeAuxiliaryLinks(links =>
                                links.map((port, j) =>
                                  j === i ? { ...port, idNode: event.target.value } : port,
                                ),
                              );
                            }}
                            className="xy-theme__input input-info"
                          />
                        </td>
                        <td>
                          <input
                            placeholder="port id"
                            value={nodeAuxiliaryLinks[i].idPort}
                            onChange={event => {
                              setNodeAuxiliaryLinks(links =>
                                links.map((port, j) =>
                                  j === i ? { ...port, idPort: event.target.value } : port,
                                ),
                              );
                            }}
                            className="xy-theme__input input-info"
                          />
                        </td>
                      </>
                    )}

                    <td>
                      <button
                        data-testid="remove_aux-pr"
                        onClick={() => {
                          setNodeAuxiliaryPorts(ports => ports.filter((_, j) => j !== i));
                          setNodeAuxiliaryLinks(links => links.filter((_, j) => j !== i));
                        }}
                      >
                        -
                      </button>
                    </td>
                  </tr>
                ))}

                <tr data-testid="node-info">
                  <th colSpan={2}>Main</th>
                </tr>
                <tr data-testid="node-props">
                  <td>
                    <input
                      data-testid="node-id"
                      placeholder="id"
                      value={nodeId}
                      onChange={event => setNodeId(event.target.value)}
                      className="xy-theme__input input-info"
                    />
                  </td>
                  <td>
                    <input
                      data-testid="node-label"
                      placeholder="label"
                      value={nodeLabel}
                      onChange={event => setNodeLabel(event.target.value)}
                      className="xy-theme__input input-info"
                    />
                  </td>
                </tr>

                <tr>
                  <th colSpan={2}>Principle</th>
                </tr>
                <tr data-testid="principle-line">
                  <td>
                    <input
                      data-testid="pr-p-id"
                      placeholder="id"
                      value={nodePrincipalPort.id}
                      onChange={event => {
                        setNodePrincipalPort(port => ({ ...port, id: event.target.value }));
                      }}
                      className="xy-theme__input input-info"
                    />
                  </td>
                  <td>
                    <input
                      data-testid="pr-p-label"
                      placeholder="label"
                      value={nodePrincipalPort.label ?? ('' as string)}
                      onChange={event => {
                        setNodePrincipalPort(port => ({ ...port, label: event.target.value }));
                      }}
                      className="xy-theme__input input-info"
                    />
                  </td>

                  {/* Principle link */}
                  {linkShowed && (
                    <>
                      <td>
                        <input
                          data-testid="pr-link_node-id"
                          placeholder="node id"
                          value={nodePrincipalLink.idNode}
                          onChange={event => {
                            setNodePrincipalLink(link => ({
                              ...link,
                              idNode: event.target.value,
                            }));
                          }}
                          className="xy-theme__input input-info"
                        />
                      </td>
                      <td>
                        <input
                          data-testid="pr-link_port-id"
                          placeholder="port id"
                          value={nodePrincipalLink.idPort}
                          onChange={event => {
                            setNodePrincipalLink(link => ({
                              ...link,
                              idPort: event.target.value,
                            }));
                          }}
                          className="xy-theme__input input-info"
                        />
                      </td>
                    </>
                  )}
                </tr>

                {/* 'Add' button */}
                <tr>
                  <td colSpan={2} style={{ padding: '10px' }}>
                    <button
                      data-testid="add-edit"
                      className="xy-theme__button"
                      onClick={onAdd}
                      disabled={!isAllowed()}
                    >
                      {nodeSelected && !isRunningLayout ? 'Edit agent' : 'Add agent'}
                    </button>
                  </td>
                </tr>

                <tr data-testid="node-preview">
                  <td colSpan={2}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div
                        className="react-flow__node"
                        style={{
                          position: 'relative',
                          cursor: isAllowed() ? 'grab' : 'not-allowed',
                        }}
                        draggable={isAllowed() ? true : false}
                        onDragStart={event => onDragStart(event, typeNode)}
                      >
                        <NodeLayoutGen
                          id={nodeId}
                          data={{
                            label: nodeLabel,
                            auxiliaryPorts: nodeAuxiliaryPorts,
                            principalPort: nodePrincipalPort,
                          }}
                          isNoPreview={false}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
};
