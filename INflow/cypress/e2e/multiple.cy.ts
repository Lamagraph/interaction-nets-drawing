describe('INflow E2E Tests: multiple options', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    describe('Node type selection', () => {
        const testCases = [
            {
                value: 'agentVert',
                label: 'vertical',
            },
            {
                value: 'agentGen',
                label: 'general',
            },
            {
                value: 'agentHor',
                label: 'horizontal',
            },
        ];

        type TestCase = (typeof testCases)[number];
        const testNodeType = ({ value, label }: TestCase) => {
            cy.get('[data-testid="MenuInfo"]').within(() => {
                cy.get('[data-testid="node-type__select"]')
                    .select(value)
                    .should('have.value', value);

                cy.get(`option[value=${value}]`).should('contain', label);
            });

            cy.wait(100);

            cy.get('.react-flow__nodes')
                .find(`.react-flow__node-${value}`)
                .should('have.length', 9);
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
            },
            {
                value: 'smartBezier',
                label: 'smart bezier',
            },
            {
                value: 'smartStraight',
                label: 'smart straight',
            },
            {
                value: 'smartStep',
                label: 'smart step',
            },
            {
                value: 'bezier',
                label: 'bezier',
            },
        ];

        type TestCase = (typeof testCases)[number];
        const testEdgeType = ({ value, label }: TestCase) => {
            cy.get('[data-testid="MenuInfo"]').within(() => {
                cy.get('[data-testid="edge-type__select"]')
                    .select(value)
                    .should('have.value', value);

                cy.get(`option[value=${value}]`).should('contain', label);
            });

            cy.wait(100);

            cy.get('.react-flow__edges')
                .find(`.react-flow__edge-${value}`)
                .should('have.length', 10);
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
            cy.get('[data-testid="MenuLayouts-0"]').within(() => {
                cy.get(`button[data-testid="layout__${id}"]`).click();
                cy.get(`button[data-testid="layout__${id}"]`).should('contain', label);
            });
        };

        beforeEach(() => {
            cy.get('[data-testid="MenuLayouts-0"] button[title="Show more"]').click();
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
