import { useReactFlow } from '@xyflow/react';

import { useCallback, useState } from 'react';
import { Panel } from '@xyflow/react';

import { FaInfoCircle } from "react-icons/fa";
import '@xyflow/react/dist/style.css';

import NodeLayout from './NodeLayout';
import { useDnD } from './DnDContext';

export default ({
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
  nodeSelected
}) => {
  const { setNodes, setEdges } = useReactFlow();

  const [linkShowed, setLinkShowed] = useState(false);

  const [_, setType] = useDnD();

  const onDragStart = (event, nodeType) => {
    setType(nodeType);
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
  }, [nodeId, nodeLabel, nodeAuxiliaryPorts, nodePrincipalPort, nodeAuxiliaryLinks, nodePrincipalLink, setNodes, setEdges]);

  return (
    <Panel position='top-left'>
      <div className='react-flow__node'>
        <table style={{ borderCollapse: 'collapse' }}><tbody>
          <tr>
            <th>
              Auxiliary
              <button onClick={() => {
                setNodeAuxiliaryPorts(prev => [
                  ...prev,
                  { id: '', label: null }
                ]);
                setNodeAuxiliaryLinks(prev => [
                  ...prev,
                  { idNode: '', idPort: '' }
                ]);
              }}>+</button>
            </th>
            <th>
              <label className='xy-theme__label'>Show links:</label>
              <input
                type='checkbox'
                checked={linkShowed}
                onChange={(evt) => setLinkShowed(evt.target.checked)}
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
          {nodeAuxiliaryPorts.map((_, i) => (
            <tr key={i}>
              <td><input
                placeholder='id'
                value={nodeAuxiliaryPorts[i].id}
                onChange={(evt) => {
                  setNodeAuxiliaryPorts(prev =>
                    prev.map((port, j) => j === i ? { ...port, id: evt.target.value } : port)
                  );
                }}
                className='xy-theme__input input-info'
              /></td>
              <td><input
                placeholder='label'
                value={nodeAuxiliaryPorts[i].label ?? '' as string}
                onChange={(evt) => {
                  setNodeAuxiliaryPorts(prev =>
                    prev.map((port, j) => j === i ? { ...port, label: evt.target.value } : port)
                  );
                }}
                className='xy-theme__input input-info'
              /></td>

              {linkShowed && (
                <>
                  <td>
                    <input
                      placeholder='node id'
                      value={nodeAuxiliaryLinks[i].idNode}
                      onChange={(evt) => {
                        setNodeAuxiliaryLinks(prev =>
                          prev.map((port, j) =>
                            j === i ? { ...port, idNode: evt.target.value } : port
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
                      onChange={(evt) => {
                        setNodeAuxiliaryLinks(prev =>
                          prev.map((port, j) =>
                            j === i ? { ...port, idPort: evt.target.value } : port
                          )
                        );
                      }}
                      className='xy-theme__input input-info'
                    />
                  </td>
                </>
              )}

              <td><button onClick={() => {
                setNodeAuxiliaryPorts(prev => prev.filter((_, j) => j !== i));
                setNodeAuxiliaryLinks(prev => prev.filter((_, j) => j !== i));
              }}>-</button></td>
            </tr>
          ))}

          <tr><th colSpan={2}>Main</th></tr>
          <tr>
            <td><input
              placeholder='id'
              value={nodeId}
              onChange={(evt) => setNodeId(evt.target.value)}
              className='xy-theme__input input-info'
            /></td>
            <td><input
              placeholder='label'
              value={nodeLabel}
              onChange={(evt) => setNodeLabel(evt.target.value)}
              className='xy-theme__input input-info'
            /></td>
          </tr>

          <tr><th colSpan={2}>Principle</th></tr>
          <tr>
            <td><input
              placeholder='id'
              value={nodePrincipalPort.id}
              onChange={(evt) => {
                setNodePrincipalPort(prev => ({
                  ...prev,
                  id: evt.target.value
                }));
              }}
              className='xy-theme__input input-info'
            /></td>
            <td><input
              placeholder='label'
              value={nodePrincipalPort.label ?? '' as string}
              onChange={(evt) => {
                setNodePrincipalPort(prev => ({
                  ...prev,
                  label: evt.target.value
                }));
              }}
              className='xy-theme__input input-info'
            /></td>

            {linkShowed && (
              <>
                <td>
                  <input
                    placeholder='node id'
                    value={nodePrincipalLink.idNode}
                    onChange={(evt) => {
                      setNodePrincipalLink(prev => ({
                        ...prev,
                        idNode: evt.target.value
                      }));
                    }}
                    className='xy-theme__input input-info'
                  />
                </td>
                <td>
                  <input
                    placeholder='port id'
                    value={nodePrincipalLink.idPort}
                    onChange={(evt) => {
                      setNodePrincipalLink(prev => ({
                        ...prev,
                        idPort: evt.target.value
                      }));
                    }}
                    className='xy-theme__input input-info'
                  />
                </td>
              </>
            )}
          </tr>
          <tr><td colSpan={2} style={{ padding: '10px' }}>
            <button
              className='xy-theme__button'
              onClick={onAdd}
              disabled={!isAllowed()}
            >{nodeSelected ? "Edit node" : "Add node"}</button>
          </td></tr>
          <tr><td colSpan={2}>
            <div
              className='react-flow__node'
              style={{ position: 'relative', cursor: isAllowed() ? 'grab' : 'not-allowed' }}
              draggable={isAllowed() ? true : false}
              onDragStart={(event) => onDragStart(event, 'custom')}
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
  );
};
