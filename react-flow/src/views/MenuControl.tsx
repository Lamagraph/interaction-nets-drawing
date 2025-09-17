import { useCallback, useState } from 'react';
import {
  useReactFlow,
  ControlButton,
  Controls,
  type Edge,
} from '@xyflow/react';

import { DownloadIcon, UploadIcon, ArrowRightIcon, ArrowLeftIcon } from '@radix-ui/react-icons'

import '@xyflow/react/dist/style.css';

import { type Agent, getObjectsFromFile, parseJSON } from '../nets';

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

interface PropsMenuControl {
  nodes: Agent[];
  edges: Edge[];
  typeEdge: string;
  fileOpened: string;
  rfInstance: any;
  isRunningLayout: boolean;
  setFileOpened: React.Dispatch<React.SetStateAction<string>>,
}

export default (props: PropsMenuControl) => {
  const {
    nodes,
    edges,
    typeEdge,
    fileOpened,
    rfInstance,
    isRunningLayout,
    setFileOpened,
  } = props;

  const { setNodes, setEdges, fitView } = useReactFlow<Agent, Edge>();

  const [netsSaved, setNetsSaved] = useState<[Agent[], Edge[], string][]>([]);
  const [indexCur, setIndexCur] = useState<number>(-1);

  const onDownload = useCallback(() => {
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
  }, [rfInstance, fileOpened]);

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
        const [nds, eds] = await parseJSON(net, typeEdge);
        nets.push([nds, eds, file.name]);
      }

      if (nets.length > 0) {
        const indexNew = 0;
        setIndexCur(indexNew);
        setNetsSaved(nets);
        setNodes(nets[indexNew][0]);
        setEdges(nets[indexNew][1]);
        setFileOpened(nets[indexNew][2]);
        fitView();
      }
    };

    input.click();
  }, []);

  const updateNetwork = useCallback((isStepUp: boolean) => {
    if (indexCur < 0) return

    const indexNew = isStepUp ? indexCur + 1 : indexCur - 1;
    const color = isStepUp ? 'lightgreen' : 'lightsalmon';

    const ndsNew: Agent[] = [];
    netsSaved[indexNew][0].forEach((node) => {
      const nodeExisted = nodes.find(n => n.id === node.id);
      if (nodeExisted) {
        ndsNew.push({ ...nodeExisted, style: node.style });
      } else {
        ndsNew.push({
          ...node,
          style: { ...node.style, backgroundColor: color },
        });
      }
    });

    const edsNew: Edge[] = [];
    netsSaved[indexNew][1].forEach((edge) => {
      const edgeExisted = edges.find(e => e.id === edge.id);
      if (edgeExisted) {
        edsNew.push({
          ...edgeExisted,
          style: edge.style,
          type: typeEdge,
        });
      } else {
        edsNew.push({
          ...edge,
          style: {
            ...edge.style,
            stroke: color,
          },
          type: typeEdge,
        });
      }
    });

    setIndexCur(indexNew);
    setFileOpened(netsSaved[indexNew][2]);
    setNodes(ndsNew);
    setEdges(edsNew);
    fitView();
  }, [netsSaved, nodes, edges, indexCur]);

  return (
    <Controls>
      <ControlButton
        title='Next step'
        disabled={isRunningLayout || (indexCur === netsSaved.length - 1)}
        onClick={() => updateNetwork(true)}
      ><ArrowRightIcon /></ControlButton>
      <ControlButton
        title='Prev step'
        disabled={isRunningLayout || (indexCur <= 0)}
        onClick={() => updateNetwork(false)}
      ><ArrowLeftIcon /></ControlButton>
      <ControlButton
        title='Upload networks'
        disabled={isRunningLayout}
        onClick={onUpload}
      ><UploadIcon /></ControlButton>
      <ControlButton
        title='Download the network'
        disabled={isRunningLayout}
        onClick={onDownload}
      ><DownloadIcon /></ControlButton>
    </Controls >
  );
};
