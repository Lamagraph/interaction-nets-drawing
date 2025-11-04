describe('INflow E2E Tests: specific of Interaction Nets', () => {
    beforeEach(() => {
        cy.visit('/interaction-nets-drawing/');
    });

    describe('Active pair', () => {
        it('should highlight active pair after adding it', () => {
            cy.get('.react-flow__nodes').children().should('have.length', 9);
            cy.get('.react-flow__edges').children().should('have.length', 10);

            cy.get('[data-testid="MenuConfig"]').within(() => {
                // Node 1
                cy.get('tr[data-testid="node-props"]').within(() => {
                    cy.get('input[data-testid="node-id"]').type('test_N10');
                    cy.get('input[data-testid="node-label"]').type('4');
                });

                cy.get('tr[data-testid="principle-line"]').within(() => {
                    cy.get('input[data-testid="pr-p-id"]').type('P0');
                });

                cy.get('button[data-testid="add-edit"]').should('not.be.disabled').click();

                // Node 2
                cy.get('tr[data-testid="node-props"]').within(() => {
                    cy.get('input[data-testid="node-id"]')
                        .should('have.value', '')
                        .type('test_N11');
                    cy.get('input[data-testid="node-label"]').should('have.value', '').type('Diff');
                });

                cy.get('tr[data-testid="help-line"]').within(() => {
                    cy.get('input[data-testid=show_links]').click();
                });

                cy.get('tr[data-testid="principle-line"]').within(() => {
                    cy.get('input[data-testid="pr-p-id"]').should('have.value', '').type('P0');
                    cy.get('input[data-testid="pr-link_node-id"]')
                        .should('have.value', '')
                        .type('test_N10');
                    cy.get('input[data-testid="pr-link_port-id"]')
                        .should('have.value', '')
                        .type('P0');
                });

                cy.get('button[data-testid="add-edit"]').should('not.be.disabled').click();

                cy.get('tr[data-testid="help-line"]').within(() => {
                    cy.get('input[data-testid=show_links]').click();
                });
            });

            cy.get('.react-flow__nodes').children().should('have.length', 11);
            cy.get('.react-flow__nodes .react-flow__node-agentHor[data-id="test_N10"]').should(
                'exist',
            );
            cy.get('.react-flow__nodes .react-flow__node-agentHor[data-id="test_N11"]').should(
                'exist',
            );
            cy.get('.react-flow__edges').children().should('have.length', 11);
            cy.get(
                '.react-flow__edges .react-flow__edge-bezier[data-id="E_test_N11:P0-test_N10:P0"]',
            ).should('exist');
        });
    });

    describe('Only one connection for port', () => {
        it('should delete connection during creation', () => {
            cy.get('.react-flow__nodes').children().should('have.length', 9);
            cy.get('.react-flow__edges').children().should('have.length', 10);

            cy.get('[data-testid="MenuConfig"]').within(() => {
                cy.get('tr[data-testid="node-props"]').within(() => {
                    cy.get('input[data-testid="node-id"]').type('test_N10');
                    cy.get('input[data-testid="node-label"]').type('Diff');
                });

                cy.get('tr[data-testid="help-line"]').within(() => {
                    cy.get('button[data-testid=add_aux-p]').click();
                    cy.get('button[data-testid=add_aux-p]').click();
                    cy.get('input[data-testid=show_links]').click();
                });

                cy.get('input[data-testid="aux-p-id-0"]').type('P1');
                cy.get('input[data-testid="aux-link_node-id-0"]').type('N1');
                cy.get('input[data-testid="aux-link_port-id-0"]').type('P0');
                cy.get('input[data-testid="aux-p-id-1"]').type('P2');
                cy.get('input[data-testid="aux-link_node-id-1"]').type('N9');
                cy.get('input[data-testid="aux-link_port-id-1"]').type('P2');

                cy.get('tr[data-testid="principle-line"]').within(() => {
                    cy.get('input[data-testid="pr-p-id"]').type('P0');
                });

                cy.get('button[data-testid="add-edit"]').should('not.be.disabled').click();
            });

            cy.get('.react-flow__nodes .react-flow__node-agentHor').should('have.length', 10);
            cy.get('.react-flow__nodes .react-flow__node-agentHor[data-id="test_N10"]').should(
                'exist',
            );
            cy.get('.react-flow__edges').children().should('have.length', 11);
        });
    });
});
