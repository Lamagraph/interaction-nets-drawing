import { useState, useCallback } from 'react';
import {
  addEdge,
  useReactFlow,
  Panel,
  ControlButton,
  Controls,
} from '@xyflow/react';

import { ReloadIcon, DownloadIcon, UploadIcon } from '@radix-ui/react-icons'

import '@xyflow/react/dist/style.css';
import { parseFile } from '../nets';

const ignoreKeys = ['type', 'sourcePosition', 'targetPosition', 'style', 'measured', 'viewport'];

const mapKeys = {
  'animated': 'activePair',
  'sourceHandle': 'sourcePort',
  'targetHandle': 'targetPort',
};

export default ({
  loadData,
  fileOpened,
  rfInstance
}) => {
  const { setNodes, setEdges } = useReactFlow();
  const { setViewport } = useReactFlow();

  const onDownload = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      const replacer = (key, value) => {
        if (ignoreKeys.includes(key)) {
          return undefined;
        }
        // if (key in mapKeys) {
        //   flow[mapKeys[key]] = value;
        //   return undefined;
        // }
        if (key === 'targetHandle') {
          return value.slice(0, -1);
        }
        return value;
      };
      const dataStr = JSON.stringify(flow, replacer, 2);
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

  const onReload = useCallback(async () => {
    loadData(`../nets/${fileOpened}`);
  }, [setNodes, setEdges, setViewport]);

  return (
    <Controls>
      <ControlButton onClick={onReload}><ReloadIcon /></ControlButton>
      <ControlButton onClick={onDownload}><DownloadIcon /></ControlButton>
      <ControlButton onClick={onUpload}><UploadIcon /></ControlButton>
    </Controls >
  );
};
