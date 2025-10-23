describe('INflow E2E Tests: multiple options', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    describe('Node type selection', () => {
        const testCases = [
            {
                value: 'agentVert',
                label: 'vertical',
                classNode: 'node-layout__vert',
            },
            {
                value: 'agentGen',
                label: 'general',
                classNode: 'node-layout__gen',
            },
            {
                value: 'agentHor',
                label: 'horizontal',
                classNode: 'node-layout__hor',
            },
        ];

        type TestCase = (typeof testCases)[number];
        const testNodeType = ({ value, label, classNode }: TestCase) => {
            cy.get('#MenuInfo').within(() => {
                cy.get('[data-testid="node-type__select"]')
                    .select(value)
                    .should('have.value', value);

                cy.get(`option[value=${value}]`).should('contain', label);
            });

            cy.wait(100);

            cy.get('.react-flow__nodes').find(`.${classNode}`).should('have.length', 9);
        };

        testCases.forEach(testCase => {
            it(`"${testCase.value}" type`, () => {
                testNodeType(testCase);
            });
        });

        it(`sequence: "${testCases[0].value}" -> "${testCases[1].value}"`, () => {
            testNodeType(testCases[0]);
            testNodeType(testCases[1]);
        });
    });

    describe('Edge type selection', () => {
        const testCases = [
            {
                value: 'smoothstep',
                label: 'smoothstep',
                classEdge: 'react-flow__edge-smoothstep',
            },
            {
                value: 'smartBezier',
                label: 'smart bezier',
                classEdge: 'react-flow__edge-smartBezier',
            },
            {
                value: 'smartStraight',
                label: 'smart straight',
                classEdge: 'react-flow__edge-smartStraight',
            },
            {
                value: 'smartStep',
                label: 'smart step',
                classEdge: 'react-flow__edge-smartStep',
            },

            {
                value: 'bezier',
                label: 'bezier',
                classEdge: 'react-flow__edge-bezier',
            },
        ];

        type TestCase = (typeof testCases)[number];
        const testEdgeType = ({ value, label, classEdge }: TestCase) => {
            cy.get('#MenuInfo').within(() => {
                cy.get('[data-testid="edge-type__select"]')
                    .select(value)
                    .should('have.value', value);

                cy.get(`option[value=${value}]`).should('contain', label);
            });

            cy.wait(100);

            cy.get('.react-flow__edges').find(`.${classEdge}`).should('have.length', 10);
        };

        testCases.forEach(testCase => {
            it(`"${testCase.value}" type`, () => {
                testEdgeType(testCase);
            });
        });

        it(`sequence: "${testCases[0].value}" -> "${testCases[2].value}" -> "${testCases[4].value}"`, () => {
            testEdgeType(testCases[0]);
            testEdgeType(testCases[2]);
            testEdgeType(testCases[4]);
        });
    });

    describe('Layout buttons', () => {
        const testCases = [
            {
                label: 'Dagre: vertical',
                id: 'Dagre-vertical',
            },
            {
                label: 'Dagre: horizontal',
                id: 'Dagre-horizontal',
            },
            {
                label: 'ELK-handles',
                id: 'ELK-handles',
            },
            {
                label: 'ELK: vertical',
                id: 'ELK-vertical',
            },
            {
                label: 'ELK: horizontal',
                id: 'ELK-horizontal',
            },
            {
                label: 'D3-hierarchy',
                id: 'D3-hierarchy',
            },
        ];

        type TestCase = (typeof testCases)[number];
        const testLayout = ({ label, id }: TestCase) => {
            cy.get('#MenuLayouts').within(() => {
                cy.get(`button[id="layout__${id}"]`).click();
                cy.get(`button[id="layout__${id}"]`).should('contain', label);
            });
        };

        beforeEach(() => {
            cy.get('#MenuLayouts button[title="Show more"]').click();
        });

        testCases.forEach(testCase => {
            it(`"${testCase.label}" layout`, () => {
                testLayout(testCase);
            });
        });

        it(`sequence: "${testCases[0].label}" -> "${testCases[1].label}" -> "${testCases[3].label}"`, () => {
            testLayout(testCases[0]);
            testLayout(testCases[1]);
            testLayout(testCases[3]);
        });
    });
});
