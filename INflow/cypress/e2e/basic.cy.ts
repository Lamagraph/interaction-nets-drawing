describe('INflow E2E Tests: hosting', () => {
    it('hosting', () => {
        cy.visit('/');
    });
});

describe('INflow E2E Tests: setup', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    describe('Menus', () => {
        it('should available all menus', () => {
            cy.get('[data-testid="MenuConfig"]');
            cy.get('[data-testid="MenuControl"]');
            cy.get('[data-testid="MenuLayouts-0"]');
            cy.get('[data-testid="MenuInfo"]');
            cy.get('div .react-flow__minimap');
        });
    });

    describe('Nets elements', () => {
        it('should available all nodes and edges', () => {
            cy.get('.react-flow__nodes').children().should('have.length', 9);
            cy.get('.react-flow__edges').children().should('have.length', 10);
        });
    });

    describe('Default values', () => {
        it('should set default values', () => {
            cy.get('[data-testid="MenuConfig"] button:contains("Add agent")')
                .should('exist')
                .should('be.disabled');

            cy.get('[data-testid="MenuInfo"]').should(
                'not.contain',
                '[data-testid="mode__select"]',
            );
            cy.get('[data-testid="MenuInfo"]').within(() => {
                cy.get('[data-testid="node-type__select"]').should('have.value', 'agentHor');
                cy.get('[data-testid="edge-type__select"]').should('have.value', 'bezier');
            });
        });
    });
});

describe('INflow E2E Tests: one-two click interaction', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    describe('Run force layout', () => {
        it('should hide MenuConfig and disable buttons', () => {
            cy.get('[data-testid="MenuConfig"] .react-flow__panel').should('be.visible');
            cy.get('[data-testid="MenuInfo"]').within(() => {
                cy.get('[data-testid="node-type__select"]').should('not.be.disabled');
                cy.get('[data-testid="node-type__select"]').should('not.be.disabled');
            });

            cy.get('[data-testid="MenuLayouts-0"]').within(() => {
                cy.get('button:contains("Start D3-force")').click();

                cy.get('button').should('contain', 'Stop D3-force');
            });

            cy.get('[data-testid="MenuConfig"]').should('exist').should('not.be.visible');
            cy.get('[data-testid="MenuConfig"] .react-flow__panel').should('not.exist');
            cy.get('[data-testid="MenuInfo"]').within(() => {
                cy.get('[data-testid="node-type__select"]').should('be.disabled');
                cy.get('[data-testid="node-type__select"]').should('be.disabled');
            });
        });
    });

    describe('Node type selection', () => {
        it('should change value in selection and type for all nodes', () => {
            cy.get('[data-testid="MenuInfo"] [data-testid="node-type__select"]').select(
                'agentVert',
            );

            cy.wait(100);

            cy.get('.react-flow__nodes .react-flow__node-agentVert').should('have.length', 9);
        });
    });

    describe('Edge type selection', () => {
        it('should change value in selection and type for all edges', () => {
            cy.get('[data-testid="MenuInfo"] [data-testid="edge-type__select"]').select(
                'smartBezier',
            );

            cy.wait(100);

            cy.get('.react-flow__edges')
                .find('.react-flow__edge-smartBezier')
                .should('have.length', 10);
        });
    });

    describe('Show more layouts button', () => {
        it('should show all layouts and run some of them', () => {
            cy.get('[data-testid="MenuLayouts-0"]').within(() => {
                cy.get('button[title="Show more"]').click();

                cy.get('button').first().should('have.attr', 'title', 'Show less');
                cy.get('button').should('have.length', 8); // '"Show less" + 6 basic layouts + force layout'

                cy.get('button[data-testid="layout__Dagre-horizontal"]').click();
                cy.get('button[data-testid="layout__D3-force"]').click();
                cy.get('button[disabled]').should('have.length', 6);

                cy.get('button[data-testid="layout__D3-force"]').click();
                cy.get('button[disabled]').should('have.length', 0);
            });
        });
    });
});
