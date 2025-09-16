import { useCallback, useState } from 'react';
import {
  useReactFlow,
  ControlButton,
  Controls,
  type Edge,
} from '@xyflow/react';

import { DownloadIcon, UploadIcon, ArrowRightIcon, ArrowLeftIcon } from '@radix-ui/react-icons'

import '@xyflow/react/dist/style.css';

import { type Agent, getObjectsFromFile, getTargetHandle, parseJSON } from '../nets';

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
  setIsRunningLayout: React.Dispatch<React.SetStateAction<boolean>>,
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
    setIsRunningLayout,
  } = props;

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
                ? getTargetHandle(value)
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
      }
    };

    input.click();
  }, [setNodes, setEdges, setViewport]);

  const updateNetwork = useCallback((isStepUp: boolean) => {
    if (indexCur < 0) return

    const indexNew = isStepUp ? indexCur + 1 : indexCur - 1;
    const color = isStepUp ? 'lightgreen' : 'lightsalmon';

    const editItems = (
      arrCur: (Agent | Edge)[],
      arrSaved: (Agent | Edge)[],
      arrNew: (Agent | Edge)[],
      isNode: boolean
    ) => {
      arrSaved.forEach((item) => {
        const itemExisted = arrCur.find(i => i.id === item.id);
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
              backgroundColor: isNode ? color : undefined,
              stroke: isNode ? undefined : color,
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
  }, [netsSaved, nodes, edges]);

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
