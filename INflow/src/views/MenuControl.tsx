import { useCallback } from 'react';
import { ControlButton, Controls, type Edge } from '@xyflow/react';

import { DownloadIcon, UploadIcon, ArrowRightIcon, ArrowLeftIcon } from '@radix-ui/react-icons';
import { FaEdit, FaSave } from 'react-icons/fa';
import { RiArrowGoBackLine } from 'react-icons/ri';
import '@xyflow/react/dist/style.css';

import { useFlowState } from '../utils/FlowContext';

import { type Agent, type Net, getObjectsFromFile, parseObjects } from '../nets';

export enum NetMode {
  edit = 0,
  sequence = 1,
  comparison = 2,
}

const allowedKeys = [
  'nodes',
  'id',
  'data',
  'label',
  'auxiliaryPorts',
  'principalPort',
  'edges',
  'source',
  'target',
  'sourcePort',
  'sourceHandle',
  'targetPort',
  'targetHandle',
  'activePair',
  'animated',
];

const mapKeys = {
  animated: 'activePair',
  sourceHandle: 'sourcePort',
  targetHandle: 'targetPort',
};

const modeDefault = NetMode.comparison;

const downloadNet = (rfInstance: any, fileOpened: string) => {
  const transformObject = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(transformObject);
    } else if (obj && typeof obj === 'object') {
      const result: Record<string, any> = {};

      for (const [key, value] of Object.entries(obj)) {
        if (key === 'data') {
          Object.assign(result, transformObject(value));
        } else if (allowedKeys.includes(key)) {
          const newKey = (mapKeys as Record<string, string>)[key] || key;
          const newValue =
            key === 'targetHandle' && typeof value === 'string'
              ? value.slice(0, -1)
              : transformObject(value);
          result[newKey] = newValue;
        }
      }

      return result;
    }
    return obj;
  };

  if (rfInstance) {
    const flow = rfInstance.toObject();

    const dataStr = JSON.stringify(transformObject(flow), null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = fileOpened.slice(0, -5) + '_edited.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
};

interface PropsUpdateNet {
  netOne: Net;
  netTwo: Net;
  types: [typeNode: string, typeEdge: string];
  isStepUp: boolean;
  isPinPos: boolean;
}

export function compareNet(props: PropsUpdateNet): Net | undefined {
  const {
    netOne,
    netTwo,
    types: [typeNode, typeEdge],
    isStepUp,
    isPinPos,
  } = props;

  const color = isStepUp ? 'lightgreen' : 'lightsalmon';

  const updateNode = (node: Agent) => {
    const nodeExisted = netTwo.agents.find(n => n.id === node.id);
    return nodeExisted
      ? {
          ...nodeExisted,
          style: node.style,
          type: typeNode,
          position: isPinPos ? node.position : nodeExisted.position,
        }
      : { ...node, style: { ...node.style, backgroundColor: color }, type: typeNode };
  };

  const nodesComp: Agent[] = [];
  netOne.agents.forEach(node => {
    const nodeComp = updateNode(node);
    nodesComp.push(nodeComp);
  });

  const updateEdge = (edge: Edge) => {
    const edgeExisted = netTwo.edges.find(e => e.id === edge.id);
    return edgeExisted
      ? { ...edgeExisted, style: edge.style, type: typeEdge }
      : { ...edge, style: { ...edge.style, stroke: color }, type: typeEdge };
  };

  const edgesComp: Edge[] = [];
  netOne.edges.forEach(edge => {
    const edgeComp = updateEdge(edge);
    edgesComp.push(edgeComp);
  });

  return {
    agents: nodesComp,
    edges: edgesComp,
    name: netOne.name,
  };
}

interface PropsSimplifyMenuControl {
  fileOpened: string;
  rfInstance: any;
  isRunningLayout: boolean;
  goToEditNet: () => void;
}

export const SimplifyMenuControl = (props: PropsSimplifyMenuControl): JSX.Element => {
  const { fileOpened, rfInstance, isRunningLayout, goToEditNet } = props;

  const onDownload = useCallback(() => {
    downloadNet(rfInstance, fileOpened);
  }, [rfInstance, fileOpened]);

  return (
    <div id="SimplifyMenuControl">
      <Controls>
        <ControlButton title="Edit net" disabled={isRunningLayout} onClick={goToEditNet}>
          <FaEdit />
        </ControlButton>
        <ControlButton title="Download the Net" disabled={isRunningLayout} onClick={onDownload}>
          <DownloadIcon />
        </ControlButton>
      </Controls>
    </div>
  );
};

interface PropsMenuControl {
  nodes: Agent[];
  edges: Edge[];
  rfInstance: any;
  isRunningLayout: boolean;
  indexNet: number;
  setNetIndexCur: (index: number, net: Net) => void;
}

export default (props: PropsMenuControl) => {
  const {
    netsSaved,
    setNetsSaved,
    indexCur,
    modeNet,
    setModeNet,
    typeNode,
    typeEdge,
    filesOpened,
  } = useFlowState();
  const { nodes, edges, rfInstance, isRunningLayout, indexNet, setNetIndexCur } = props;

  const onDownload = useCallback(() => {
    downloadNet(rfInstance, filesOpened[0]);
  }, [rfInstance, filesOpened]);

  const onUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.webkitdirectory = true;
    input.multiple = true;

    const nets: Net[] = [];

    input.onchange = async event => {
      const fileList = (event.target as HTMLInputElement).files;
      if (!fileList || fileList.length === 0) return;

      const files = Array.from(fileList).sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: 'base',
        }),
      );

      for (const file of files) {
        const net = await getObjectsFromFile(file);
        const [nds, eds] = await parseObjects(net, typeNode, typeEdge);
        nets.push({
          agents: nds,
          edges: eds,
          name: file.name,
        });
      }

      if (nets.length > 0) {
        const indexNew = 0;
        setNetsSaved(nets);
        setNetIndexCur(indexNew, nets[indexNew]);
        setModeNet(modeDefault);
      }
    };

    input.click();
  }, [typeNode, typeEdge, modeNet]);

  const toggleNet = useCallback(
    (flag: boolean) => {
      const indexNew = indexCur + (flag ? 1 : -1);

      const netOne = netsSaved[indexNew];
      const netTwo =
        modeNet === NetMode.sequence
          ? {
              agents: nodes,
              edges: edges,
              name: filesOpened[0],
            }
          : netsSaved[indexCur];
      const isStepUp = modeNet === NetMode.sequence ? flag : Boolean(indexNet);

      const netComp = compareNet({
        netOne,
        netTwo,
        types: [typeNode, typeEdge],
        isStepUp,
        isPinPos: false,
      });
      if (netComp) setNetIndexCur(indexNew, netComp);
    },
    [netsSaved, indexCur, nodes, edges, typeNode, typeEdge, modeNet, filesOpened, indexNet],
  );

  const saveNetEdited = useCallback(() => {
    const index = indexCur - (filesOpened[0] === filesOpened[1] && indexCur > 0 ? 1 : 0);
    setNetsSaved(nets =>
      nets.map((net, i) =>
        i === index
          ? {
              agents: nodes,
              edges: edges,
              name: filesOpened[0],
            }
          : net,
      ),
    );
  }, [indexCur, nodes, edges, filesOpened]);

  const goBackToNets = useCallback(() => {
    const index = indexCur - (filesOpened[0] === filesOpened[1] && indexCur > 0 ? 1 : 0);
    setNetIndexCur(index, netsSaved[index]);
    setModeNet(modeDefault);
  }, [netsSaved, indexCur, filesOpened]);

  return (
    <div id="MenuControl">
      <Controls>
        {netsSaved.length > 0 && (
          <>
            {modeNet !== NetMode.edit ? (
              <ControlButton
                title="Edit net"
                disabled={isRunningLayout}
                onClick={() => setModeNet(NetMode.edit)}
              >
                <FaEdit />
              </ControlButton>
            ) : (
              <>
                <ControlButton title="Save" disabled={isRunningLayout} onClick={saveNetEdited}>
                  <FaSave />
                </ControlButton>

                <ControlButton
                  title="Go back to nets"
                  disabled={isRunningLayout}
                  onClick={goBackToNets}
                >
                  <RiArrowGoBackLine />
                </ControlButton>
              </>
            )}
          </>
        )}

        {modeNet !== NetMode.edit && (
          <>
            <ControlButton
              title="Next step"
              disabled={
                isRunningLayout ||
                (modeNet === NetMode.sequence && indexCur >= netsSaved.length - 1) ||
                (modeNet === NetMode.comparison && indexCur >= netsSaved.length - 2)
              }
              onClick={() => toggleNet(true)}
            >
              <ArrowRightIcon />
            </ControlButton>
            <ControlButton
              title="Prev step"
              disabled={isRunningLayout || indexCur <= 0}
              onClick={() => toggleNet(false)}
            >
              <ArrowLeftIcon />
            </ControlButton>
          </>
        )}

        <ControlButton title="Upload Nets" disabled={isRunningLayout} onClick={onUpload}>
          <UploadIcon />
        </ControlButton>

        <ControlButton title="Download the Net" disabled={isRunningLayout} onClick={onDownload}>
          <DownloadIcon />
        </ControlButton>
      </Controls>
    </div>
  );
};
