import { useCallback } from 'react';
import {
  useReactFlow,
  ControlButton,
  Controls,
} from '@xyflow/react';

import { DownloadIcon, UploadIcon } from '@radix-ui/react-icons'

import '@xyflow/react/dist/style.css';

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

export default ({ loadData, fileOpened, rfInstance }) => {
  const { setNodes, setEdges } = useReactFlow();
  const { setViewport } = useReactFlow();

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
  }, [rfInstance]);

  const onUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);
          loadData(file.name, jsonData);
        } catch (err) {
          console.error(`Error parsing ${file}:`, err);
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }, [setNodes, setEdges, setViewport]);

  return (
    <Controls>
      <ControlButton title='Download the network' onClick={onDownload}><DownloadIcon /></ControlButton>
      <ControlButton title='Upload the network' onClick={onUpload}><UploadIcon /></ControlButton>
    </Controls >
  );
};
