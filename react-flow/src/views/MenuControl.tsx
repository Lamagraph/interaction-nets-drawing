import { useCallback, useState } from 'react';
import {
  useReactFlow,
  ControlButton,
  Controls,
  Edge,
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

export default ({
  nodes,
  edges,
  typeEdge,
  fileOpened,
  rfInstance,
  isRunning,
  setFileOpened,
  setIsRunning
}: {
  nodes: Agent[];
  edges: Edge[];
  typeEdge: string;
  fileOpened: string;
  rfInstance: any;
  isRunning: boolean;
  setFileOpened: React.Dispatch<React.SetStateAction<string>>,
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>,
}) => {
  const { setNodes, setEdges } = useReactFlow();
  const { setViewport } = useReactFlow();

  const [netsSaved, setNetsSaved] = useState<[Agent[], Edge[], string][]>([]);
  const [indexCur, setIndexCur] = useState<number>(-1);

  const onDownload = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      function transformObject(obj) {
        if (Array.isArray(obj)) {
          return obj.map(transformObject);
        } else if (obj && typeof obj === 'object') {
          const result = {};
          for (const [key, value] of Object.entries(obj)) {
            if (key === 'data') {
              Object.assign(result, transformObject(value))
            } else if (allowedKeys.includes(key)) {
              const newKey = mapKeys[key] || key;
              result[newKey] = key === 'targetHandle'
                ? value.slice(0, -1)
                : transformObject(value);
            }
          }
          return result;
        }
        return obj;
      }

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
      const files = (event.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      const arrayFiles = Array.from(files)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: 'base'
        }));

      for (const file of arrayFiles) {
        const net = await getObjectsFromFile(file);
        const [nds, eds] = await parseJSON(net, typeEdge);
        nets.push([nds, eds, file.name]);
      }

      const indexNew = 0;
      setIndexCur(indexNew);
      setNetsSaved(nets);
      setNodes(nets[indexNew][0]);
      setEdges(nets[indexNew][1]);
      setFileOpened(nets[indexNew][2]);
    };

    input.click();
  }, [setNodes, setEdges, setViewport]);

  const updateNetwork = useCallback((isStepUp: boolean) => {
    if (indexCur < 0) return

    const indexNew = isStepUp ? indexCur + 1 : indexCur - 1;
    const color = isStepUp ? 'lightgreen' : 'lightsalmon';

    const editItems = (arr, arrOld, arrNew, isNode) => {
      arrOld.forEach((item) => {
        const itemExisted = arr.find(i => i.id === item.id);
        if (itemExisted) {
          arrNew.push({
            ...itemExisted,
            style: item.style,
          });
        } else {
          arrNew.push({
            ...item,
            style: {
              ...item.style,
              backgroundColor: isNode ? color : null,
              stroke: isNode ? null : color,
            }
          });
        }
      });
    };

    const ndsNew: Agent[] = []
    editItems(nodes, netsSaved[indexNew][0], ndsNew, true);

    const edsNew: Edge[] = []
    editItems(edges, netsSaved[indexNew][1], edsNew, false);

    setIndexCur(indexNew);
    setFileOpened(netsSaved[indexNew][2]);
    setNodes(ndsNew);
    setEdges(edsNew);

  }, [netsSaved, nodes, edges, isRunning]);

  return (
    <Controls>
      <ControlButton
        title='Next step'
        disabled={indexCur == netsSaved.length - 1}
        onClick={() => updateNetwork(true)}
      ><ArrowRightIcon /></ControlButton>
      <ControlButton
        title='Prev step'
        disabled={indexCur <= 0}
        onClick={() => updateNetwork(false)}
      ><ArrowLeftIcon /></ControlButton>
      <ControlButton title='Upload networks' onClick={onUpload}><UploadIcon /></ControlButton>
      <ControlButton title='Download the network' onClick={onDownload}><DownloadIcon /></ControlButton>
    </Controls >
  );
};
