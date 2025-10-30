import { useCallback } from 'react';
import { ControlButton, Controls, useReactFlow, type Edge } from '@xyflow/react';

import { DownloadIcon, UploadIcon, ArrowRightIcon, ArrowLeftIcon } from '@radix-ui/react-icons';
import { FaEdit, FaSave } from 'react-icons/fa';
import { RiArrowGoBackLine } from 'react-icons/ri';
import '@xyflow/react/dist/style.css';

import { useINflowState } from '@utils/INflowContext';

import { type Agent, type Net, getObjectFromFile, toNetFromObject, toObjectFromNet } from '@/nets';

export enum NetMode {
  edit = 0,
  sequence = 1,
  comparison = 2,
}

const modeDefault = NetMode.comparison;

const downloadNet = async (net: Net) => {
  const netObj = await toObjectFromNet(net);
  const netJSON = JSON.stringify(netObj, null, 2);
  const netUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(netJSON);
  const exportFileDefaultName = net.name.slice(0, -5) + '_edited.json';

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', netUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

interface PropsUpdateNet {
  netOne: Net;
  netTwo: Net;
  types: [typeNode: string, typeEdge: string];
  isStepUp: boolean;
  isPinPos: boolean;
}

export function compareNet(props: PropsUpdateNet): Net {
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
  isRunningLayout: boolean;
  goToEditNet: () => void;
}

export const SimplifyMenuControl = (props: PropsSimplifyMenuControl): JSX.Element => {
  const { fileOpened, isRunningLayout, goToEditNet } = props;
  const { getNodes, getEdges } = useReactFlow<Agent, Edge>();

  const onDownload = useCallback(() => {
    downloadNet({ agents: getNodes(), edges: getEdges(), name: fileOpened });
  }, [getNodes, getEdges, fileOpened]);

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
  isRunningLayout: boolean;
  indexNet: number;
  setNetIndexCur: (index: number, net: Net) => void;
}

export default (props: PropsMenuControl) => {
  const {
    instanceINflow: { netsSaved, indexCur, modeNet, typeNode, typeEdge, filesOpened },
    setNetsSaved,
    setModeNet,
  } = useINflowState();
  const { nodes, edges, isRunningLayout, indexNet, setNetIndexCur } = props;
  const { getNodes, getEdges } = useReactFlow<Agent, Edge>();

  const onDownload = useCallback(() => {
    downloadNet({ agents: getNodes(), edges: getEdges(), name: filesOpened[0] });
  }, [getNodes, getEdges, filesOpened[0]]);

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
        const netObj = await getObjectFromFile(file);
        const net = await toNetFromObject(netObj, typeNode, typeEdge);
        nets.push({ ...net, name: file.name });
      }

      if (nets.length > 0) {
        const indexNew = 0;
        setNetsSaved(nets);
        setNetIndexCur(indexNew, nets[indexNew]);
        if (nets.length === 1) setModeNet(NetMode.edit);
        else setModeNet(modeDefault);
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
