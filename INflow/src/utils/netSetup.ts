import { type Net, calculatePosition } from '@/nets';

export const netSetup: Net = {
    agents: [
        {
            id: 'N1',
            data: {
                label: '2',
                auxiliaryPorts: [],
                principalPort: { id: 'P0', label: null },
            },
            type: 'agentHor',
            position: calculatePosition(0),
        },
        {
            id: 'N2',
            data: {
                label: 'Cons',
                auxiliaryPorts: [
                    { id: 'P1', label: null },
                    { id: 'P2', label: '123' },
                ],
                principalPort: { id: 'P0', label: null },
            },
            type: 'agentHor',
            position: calculatePosition(1),
        },
        {
            id: 'N3',
            data: {
                label: '1',
                auxiliaryPorts: [],
                principalPort: { id: 'P0', label: null },
            },
            type: 'agentHor',
            position: calculatePosition(2),
        },
        {
            id: 'N4',
            data: {
                label: 'Cons',
                auxiliaryPorts: [
                    {
                        id: 'P1',
                        label: null,
                    },
                    {
                        id: 'P2',
                        label: null,
                    },
                ],
                principalPort: {
                    id: 'P0',
                    label: null,
                },
            },
            type: 'agentHor',
            position: calculatePosition(3),
        },
        {
            id: 'N5',
            data: {
                label: 'Diff',
                auxiliaryPorts: [
                    {
                        id: 'P1',
                        label: null,
                    },
                    {
                        id: 'P2',
                        label: null,
                    },
                ],
                principalPort: { id: 'P0', label: '012' },
            },
            type: 'agentHor',
            position: calculatePosition(4),
        },
        {
            id: 'N6',
            data: {
                label: '3',
                auxiliaryPorts: [],
                principalPort: {
                    id: 'P0',
                    label: null,
                },
            },
            type: 'agentHor',
            position: calculatePosition(5),
        },
        {
            id: 'N7',
            data: {
                label: 'Cons',
                auxiliaryPorts: [
                    { id: 'P1', label: '12345' },
                    { id: 'P2', label: '6789' },
                ],
                principalPort: {
                    id: 'P0',
                    label: null,
                },
            },
            type: 'agentHor',
            position: calculatePosition(6),
        },
        {
            id: 'N8',
            data: {
                label: 'Diff',
                auxiliaryPorts: [
                    {
                        id: 'P1',
                        label: null,
                    },
                    {
                        id: 'P2',
                        label: null,
                    },
                ],
                principalPort: {
                    id: 'P0',
                    label: null,
                },
            },
            type: 'agentHor',
            position: calculatePosition(7),
        },
        {
            id: 'N9',
            data: {
                label: 'Append',
                auxiliaryPorts: [
                    { id: 'P1', label: '111' },
                    {
                        id: 'P2',
                        label: null,
                    },
                ],
                principalPort: { id: 'P0', label: '000' },
            },
            type: 'agentHor',
            position: calculatePosition(8),
        },
    ],
    edges: [
        {
            id: 'E_N1:P0-N2:P1',
            source: 'N1',
            target: 'N2',
            sourceHandle: 'P0',
            targetHandle: 'P1t',
            type: 'bezier',
            animated: false,
        },
        {
            id: 'E_N3:P0-N4:P1',
            source: 'N3',
            target: 'N4',
            sourceHandle: 'P0',
            targetHandle: 'P1t',
            type: 'bezier',
            animated: false,
        },
        {
            id: 'E_N2:P0-N4:P2',
            source: 'N2',
            target: 'N4',
            sourceHandle: 'P0',
            targetHandle: 'P2t',
            type: 'bezier',
            animated: false,
        },
        {
            id: 'E_N4:P0-N5:P1',
            source: 'N4',
            target: 'N5',
            sourceHandle: 'P0',
            targetHandle: 'P1t',
            type: 'bezier',
            animated: false,
        },
        {
            id: 'E_N2:P2-N5:P2',
            source: 'N2',
            target: 'N5',
            sourceHandle: 'P2',
            targetHandle: 'P2t',
            type: 'bezier',
            animated: false,
        },
        {
            id: 'E_N6:P0-N7:P1',
            source: 'N6',
            target: 'N7',
            sourceHandle: 'P0',
            targetHandle: 'P1t',
            type: 'bezier',
            animated: false,
        },
        {
            id: 'E_N7:P0-N8:P1',
            source: 'N7',
            target: 'N8',
            sourceHandle: 'P0',
            targetHandle: 'P1t',
            type: 'bezier',
            animated: false,
        },
        {
            id: 'E_N7:P2-N8:P2',
            source: 'N7',
            target: 'N8',
            sourceHandle: 'P2',
            targetHandle: 'P2t',
            type: 'bezier',
            animated: false,
        },
        {
            id: 'E_N8:P0-N9:P1',
            source: 'N8',
            target: 'N9',
            sourceHandle: 'P0',
            targetHandle: 'P1t',
            type: 'bezier',
            animated: false,
        },
        {
            id: 'E_N5:P0-N9:P0',
            source: 'N5',
            target: 'N9',
            sourceHandle: 'P0',
            targetHandle: 'P0t',
            type: 'bezier',
            animated: true,
            style: { stroke: 'blue' },
        },
    ],
    name: 'list_add_1.json',
};
