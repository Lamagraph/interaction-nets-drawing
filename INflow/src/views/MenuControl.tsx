import { useCallback } from 'react';
import {
  ControlButton,
  Controls,
  useReactFlow,
  type Edge,
  getViewportForBounds,
  Rect,
} from '@xyflow/react';
import { toSvg } from 'html-to-image';

import {
  DownloadIcon,
  UploadIcon,
  ImageIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from '@radix-ui/react-icons';
import { FaEdit, FaSave } from 'react-icons/fa';
import { RiArrowGoBackLine } from 'react-icons/ri';
import '@xyflow/react/dist/style.css';

import { useINflowState } from '@utils/INflowContext';

import { type Agent, type Net } from '@/nets';
import { compareNet } from '@/utils/netCompare';
import { getObjectFromFile, toNetFromObject, toObjectFromNet } from '@utils/dataManagement';

export enum NetMode {
  edit = 0,
  sequence = 1,
  comparison = 2,
}

const modeDefault = NetMode.comparison;

const downloadJSON = async (net: Net) => {
  const netObj = await toObjectFromNet(net);
  const netJSON = JSON.stringify(netObj, null, 2);
  const netURI = 'data:application/json;charset=utf-8,' + encodeURIComponent(netJSON);
  const exportFileDefaultName = net.name.slice(0, -5) + '_edited.json';

  const link = document.createElement('a');
  link.setAttribute('href', netURI);
  link.setAttribute('download', exportFileDefaultName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadSVG = async (boundNodes: Rect, nameNet: string) => {
  const flow = document.querySelector('.react-flow__viewport');
  if (!flow) return;

  const imageWidth = boundNodes.width + 100;
  const imageHeight = boundNodes.height + 100;

  const viewport = getViewportForBounds(boundNodes, imageWidth, imageHeight, 0.5, 2, 0.1);

  toSvg(flow as HTMLElement, {
    // backgroundColor: '#F7F9FB',
    width: imageWidth,
    height: imageHeight,
    style: {
      width: `${imageWidth}px`,
      height: `${imageHeight}px`,
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    },
  }).then(dataUrl => {
    const exportFileDefaultName = nameNet.slice(0, -5) + '_edited.svg';

    const link = document.createElement('a');
    link.setAttribute('href', dataUrl);
    link.setAttribute('download', exportFileDefaultName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};

interface PropsSimplifyMenuControl {
  fileOpened: string;
  isRunningLayout: boolean;
  goToEditNet: () => void;
}

export const SimplifyMenuControl = (props: PropsSimplifyMenuControl): JSX.Element => {
  const { fileOpened, isRunningLayout, goToEditNet } = props;
  const { getNodes, getEdges, getNodesBounds } = useReactFlow<Agent, Edge>();

  const onDownloadJSON = useCallback(() => {
    downloadJSON({ agents: getNodes(), edges: getEdges(), name: fileOpened });
  }, [getNodes, getEdges, fileOpened]);

  const onDownloadSVG = useCallback(() => {
    const boundNodes = getNodesBounds(getNodes());
    downloadSVG(boundNodes, fileOpened);
  }, [getNodes, fileOpened]);

  return (
    <div data-testid="SimplifyMenuControl">
      <Controls>
        <ControlButton
          title="Edit net"
          disabled={isRunningLayout}
          onClick={goToEditNet}
          data-testid="edit-net"
        >
          <FaEdit />
        </ControlButton>
        <ControlButton
          title="Download the Net"
          disabled={isRunningLayout}
          onClick={onDownloadJSON}
          data-testid="download"
        >
          <DownloadIcon />
        </ControlButton>
        <ControlButton
          title="Download as SVG"
          disabled={isRunningLayout}
          onClick={onDownloadSVG}
          data-testid="download-svg"
        >
          <ImageIcon />
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
  const { getNodes, getEdges, getNodesBounds } = useReactFlow<Agent, Edge>();

  const onDownloadJSON = useCallback(() => {
    downloadJSON({ agents: getNodes(), edges: getEdges(), name: filesOpened[0] });
  }, [getNodes, getEdges, filesOpened[0]]);

  const onDownloadSVG = useCallback(() => {
    const boundNodes = getNodesBounds(getNodes());
    downloadSVG(boundNodes, filesOpened[0]);
  }, [getNodes, filesOpened[0]]);

  const onUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.webkitdirectory = true;
    input.multiple = true;

    const nets: Net[] = [];

    input.onchange = async event => {
      try {
        const fileList = (event.target as HTMLInputElement).files;
        if (!fileList || fileList.length === 0) throw new Error('Unselect uploaded files');

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
      } catch (error) {
        console.log(error);
      }
    };

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
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
    setNetsSaved(nets =>
      nets.map((net, i) =>
        i === indexCur
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
    <div data-testid="MenuControl">
      <Controls>
        {netsSaved.length > 1 && (
          <>
            {modeNet !== NetMode.edit ? (
              <ControlButton
                title="Edit net"
                disabled={isRunningLayout}
                onClick={() => setModeNet(NetMode.edit)}
                data-testid="edit-net"
              >
                <FaEdit />
              </ControlButton>
            ) : (
              <>
                <ControlButton
                  title="Save"
                  disabled={isRunningLayout}
                  onClick={saveNetEdited}
                  data-testid="save-net"
                >
                  <FaSave />
                </ControlButton>

                <ControlButton
                  title="Go back to nets"
                  disabled={isRunningLayout}
                  onClick={goBackToNets}
                  data-testid="go-back"
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
              data-testid="next-step"
            >
              <ArrowRightIcon />
            </ControlButton>
            <ControlButton
              title="Prev step"
              disabled={isRunningLayout || indexCur <= 0}
              onClick={() => toggleNet(false)}
              data-testid="prev-step"
            >
              <ArrowLeftIcon />
            </ControlButton>
          </>
        )}

        <ControlButton
          title="Upload Nets"
          disabled={isRunningLayout}
          onClick={onUpload}
          data-testid="upload"
        >
          <UploadIcon />
        </ControlButton>
        <ControlButton
          title="Download the Net in JSON"
          disabled={isRunningLayout}
          onClick={onDownloadJSON}
          data-testid="download"
        >
          <DownloadIcon />
        </ControlButton>
        <ControlButton
          title="Download the Net in SVG"
          disabled={isRunningLayout}
          onClick={onDownloadSVG}
          data-testid="download-svg"
        >
          <ImageIcon />
        </ControlButton>
      </Controls>
    </div>
  );
};
