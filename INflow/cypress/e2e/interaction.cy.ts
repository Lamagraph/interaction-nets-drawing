describe('INflow E2E Tests: interaction with MenuConfig', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    describe('Initial state', () => {
        it('should available and empty fields', () => {
            cy.get('[data-testid="MenuConfig"]').within(() => {
                cy.get('tr[data-testid="help-line"]').within(() => {
                    cy.get('button[data-testid="add_aux-p"]').should('not.be.disabled');
                    cy.get('input[data-testid="show_links"]').should('not.be.checked');
                });

                cy.get('tr[data-testid="auxiliary-line"]').should('not.exist');
                cy.get('button[data-testid="remove_aux-p"]').should('not.exist');

                cy.get('tr[data-testid="node-props"]').within(() => {
                    cy.get('input[data-testid="node-id"]').should('have.value', '');
                    cy.get('input[data-testid="node-label"]').should('have.value', '');
                });

                cy.get('tr[data-testid="principle-line"]').within(() => {
                    cy.get('input[data-testid="pr-p-id"]').should('have.value', '');
                    cy.get('input[data-testid="pr-p-label"]').should('have.value', '');
                    cy.get('input[data-testid="pr-link_node-id"]').should('not.exist');
                    cy.get('input[data-testid="pr-link-port-id"]').should('not.exist');
                });

                cy.get('button[data-testid="add-edit"]').should('be.disabled');
                cy.get('tr[data-testid="node-preview"]').within(() => {
                    cy.get('.react-flow__node').should('exist');
                });
            });
        });
    });

    describe('Minimal intro props', () => {
        it("should available 'Add' button depending on props", () => {
            cy.get('.react-flow__nodes .react-flow__node-agentHor').should('have.length', 9);

            cy.get('[data-testid="MenuConfig"]').within(() => {
                cy.get('button[data-testid="add-edit"]').should('be.disabled');

                cy.get('tr[data-testid="node-props"]').within(() => {
                    cy.get('input[data-testid="node-id"]')
                        .clear()
                        .type('test_N10')
                        .should('have.value', 'test_N10');

                    cy.get('input[data-testid="node-label"]')
                        .clear()
                        .type('Diff')
                        .should('have.value', 'Diff');
                });

                cy.get('button[data-testid="add-edit"]').should('be.disabled');

                cy.get('tr[data-testid="principle-line"]').within(() => {
                    cy.get('input[data-testid="pr-p-id"]')
                        .clear()
                        .type('P1')
                        .should('have.value', 'P1');
                });

                cy.get('button[data-testid="add-edit"]').should('not.be.disabled');

                cy.get('tr[data-testid="node-props"]').within(() => {
                    cy.get('input[data-testid="node-label"]')
                        .clear()
                        .type(' ')
                        .should('have.value', ' ');
                });

                cy.get('button[data-testid="add-edit"]').should('be.disabled');

                cy.get('tr[data-testid="node-props"]').within(() => {
                    cy.get('input[data-testid="node-label"]')
                        .clear()
                        .type('Open')
                        .should('have.value', 'Open');
                });

                cy.get('button[data-testid="add-edit"]').should('not.be.disabled').click();
            });

            cy.get('.react-flow__nodes .react-flow__node-agentHor').should('have.length', 10);
            cy.get('.react-flow__nodes .react-flow__node-agentHor[data-id="test_N10"]').should(
                'exist',
            );
        });
    });
});
