import { useCallback } from 'react';
import {
  ControlButton,
  Controls,
  type Edge,
} from '@xyflow/react';

import {
  DownloadIcon,
  UploadIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from '@radix-ui/react-icons';
import { FaEdit, FaSave } from "react-icons/fa";
import { RiArrowGoBackLine } from "react-icons/ri";

import '@xyflow/react/dist/style.css';

import { type Agent, getObjectsFromFile, parseJSON } from '../nets';

export enum NetMode {
  edit = 0,
  sequence = 1,
  comparison = 2
};

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
  'animated': 'activePair',
  'sourceHandle': 'sourcePort',
  'targetHandle': 'targetPort',
};

const modeDefault = NetMode.comparison

const onDownloadNets = (rfInstance: any, fileOpened: string) => {
  const transformObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(transformObject);
    } else if (obj && typeof obj === 'object') {
      const result = {};

      for (const [key, value] of Object.entries<string>(obj)) {
        if (key === 'data') {
          Object.assign(result, transformObject(value))
        } else if (allowedKeys.includes(key)) {
          const newKey = mapKeys[key] || key;
          const newValue = key === 'targetHandle'
            ? value.slice(0, -1)
            : transformObject(value);
          result[newKey] = newValue
        }
      }

      return result;
    }
    return obj;
  }

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

interface PropsSimplifyMenuControl {
  nodes: Agent[];
  edges: Edge[];
  indexCur: number;
  netsSaved: [Agent[], Edge[], string][];
  setNetsSaved: React.Dispatch<React.SetStateAction<[Agent[], Edge[], string][]>>;
  fileOpened: string;
  rfInstance: any;
  isRunningLayout: boolean;
  goToEditNet: () => void;
}

export const SimplifyMenuControl = (props: PropsSimplifyMenuControl): JSX.Element => {
  const {
    nodes,
    edges,
    indexCur,
    netsSaved,
    setNetsSaved,
    fileOpened,
    rfInstance,
    isRunningLayout,
    goToEditNet,
  } = props;

  const onDownload = useCallback(() => {
    onDownloadNets(rfInstance, fileOpened);
  }, [rfInstance, fileOpened]);

  const saveNetEdited = useCallback(() => {
    setNetsSaved(nets => nets.map((net, i) => i === (indexCur + 1) ? [nodes, edges, fileOpened] : net));
  }, [netsSaved, indexCur, fileOpened, nodes, edges]);

  return (
    <Controls>
      <ControlButton
        title='Save'
        disabled={isRunningLayout}
        onClick={() => saveNetEdited()}
      ><FaSave /></ControlButton>
      <ControlButton
        title='Edit net'
        disabled={isRunningLayout}
        onClick={() => goToEditNet()}
      ><FaEdit /></ControlButton>
      <ControlButton
        title='Download the Net'
        disabled={isRunningLayout}
        onClick={onDownload}
      ><DownloadIcon /></ControlButton>
    </Controls >
  );
};

interface PropsMenuControl {
  nodes: Agent[];
  edges: Edge[];
  typeNode: string,
  typeEdge: string;
  rfInstance: any;
  isRunningLayout: boolean;
  filesOpened: [string, string];
  modeNet: NetMode;
  setModeNet: (mode: NetMode) => void;
  netsSaved: [Agent[], Edge[], string][];
  setNetsSaved: React.Dispatch<React.SetStateAction<[Agent[], Edge[], string][]>>;
  indexCur: number;
  setNetIndexCur: (index: number, net: [Agent[], Edge[], string]) => void;
}

export default (props: PropsMenuControl) => {
  const {
    nodes,
    edges,
    typeNode,
    typeEdge,
    rfInstance,
    isRunningLayout,
    filesOpened,
    modeNet,
    setModeNet,
    netsSaved,
    setNetsSaved,
    indexCur,
    setNetIndexCur,
  } = props;

  const onDownload = useCallback(() => {
    onDownloadNets(rfInstance, filesOpened[0]);
  }, [rfInstance, filesOpened]);

  const onUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.webkitdirectory = true;
    input.multiple = true;

    const nets: [Agent[], Edge[], string][] = [];

    input.onchange = async (event) => {
      const fileList = (event.target as HTMLInputElement).files;
      if (!fileList || fileList.length === 0) return;

      const files = Array.from(fileList)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: 'base'
        }));

      for (const file of files) {
        const net = await getObjectsFromFile(file);
        const [nds, eds] = await parseJSON(net, typeNode, typeEdge);
        nets.push([nds, eds, file.name]);
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

  const updateNet = useCallback((isStepUp: boolean) => {
    if (indexCur < 0) return;

    const indexNew = isStepUp ? indexCur + 1 : indexCur - 1;
    if (indexNew >= netsSaved.length) return;

    const color = isStepUp ? 'lightgreen' : 'lightsalmon';

    const createNode = (node: Agent, col: string | undefined) => ({
      ...node,
      style: col ? { ...node.style, backgroundColor: col } : node.style,
      type: typeNode,
    });
    const updateNode = (node: Agent) => {
      const nodeExisted = nodes.find(n => n.id === node.id);
      return nodeExisted
        ? { ...nodeExisted, style: node.style, type: typeNode }
        : createNode(node, color)
    };

    const nodesNew: Agent[] = [];
    netsSaved[indexNew][0].forEach(node => {
      const nodeNew = modeNet === NetMode.comparison
        ? createNode(node, undefined)
        : updateNode(node);

      nodesNew.push(nodeNew);
    });

    const createEdge = (edge: Edge, col: string | undefined) => ({
      ...edge,
      style: col ? { ...edge.style, stroke: col, } : edge.style,
      type: typeEdge,
    });
    const updateEdge = (edge: Edge) => {
      const edgeExisted = edges.find(e => e.id === edge.id);
      return edgeExisted
        ? { ...edgeExisted, style: edge.style, type: typeEdge }
        : createEdge(edge, color)
    };

    const edgesNew: Edge[] = [];
    netsSaved[indexNew][1].forEach(edge => {
      const edgeNew = modeNet === NetMode.comparison
        ? createEdge(edge, undefined)
        : updateEdge(edge);

      edgesNew.push(edgeNew);
    });

    setNetIndexCur(indexNew, [nodesNew, edgesNew, netsSaved[indexNew][2]]);
  }, [netsSaved, nodes, edges, indexCur, typeNode, typeEdge, modeNet]);

  const saveNetEdited = useCallback(() => {
    const index = indexCur - (filesOpened[0] === filesOpened[1] && indexCur > 0 ? 1 : 0);
    setNetsSaved(nets => nets.map((net, i) => i === index ? [nodes, edges, filesOpened[0]] : net));
  }, [netsSaved, indexCur, filesOpened, nodes, edges]);

  const goBackToNets = useCallback(() => {
    const index = indexCur - (filesOpened[0] === filesOpened[1] && indexCur > 0 ? 1 : 0);
    setNetIndexCur(index, netsSaved[index]);
    setModeNet(modeDefault);
  }, [netsSaved, indexCur, filesOpened]);

  return (
    <Controls>
      {netsSaved.length > 0 && <>
        {modeNet !== NetMode.sequence && (
          <ControlButton
            title='Save'
            disabled={isRunningLayout}
            onClick={() => saveNetEdited()}
          ><FaSave /></ControlButton>
        )}

        {modeNet !== NetMode.edit ? (
          <ControlButton
            title='Edit net'
            disabled={isRunningLayout}
            onClick={() => setModeNet(NetMode.edit)}
          ><FaEdit /></ControlButton>
        ) : (
          <ControlButton
            title='Go back to nets'
            disabled={isRunningLayout}
            onClick={() => goBackToNets()}
          ><RiArrowGoBackLine /></ControlButton>
        )}
      </>}

      {modeNet !== NetMode.edit && <>
        <ControlButton
          title='Next step'
          disabled={
            isRunningLayout ||
            modeNet === NetMode.sequence && (indexCur >= netsSaved.length - 1) ||
            modeNet === NetMode.comparison && (indexCur >= netsSaved.length - 2)
          }
          onClick={() => updateNet(true)}
        ><ArrowRightIcon /></ControlButton>
        <ControlButton
          title='Prev step'
          disabled={isRunningLayout || (indexCur <= 0)}
          onClick={() => updateNet(false)}
        ><ArrowLeftIcon /></ControlButton>
      </>}

      <ControlButton
        title='Upload Nets'
        disabled={isRunningLayout}
        onClick={onUpload}
      ><UploadIcon /></ControlButton>

      <ControlButton
        title='Download the Net'
        disabled={isRunningLayout}
        onClick={onDownload}
      ><DownloadIcon /></ControlButton>
    </Controls >
  );
};
