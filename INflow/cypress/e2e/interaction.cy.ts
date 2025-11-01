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
        it('should available "Add" button depending on props', () => {
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

    describe('Selection node', () => {
        it('should select node N9 and update MenuConfig', () => {
            cy.get('.react-flow__nodes [data-id="N9"]').should('exist').click();

            cy.wait(100);

            cy.get('.react-flow__nodes [data-id="N9"]').should('have.class', 'selected');
            cy.get('[data-testid="MenuConfig"]').within(() => {
                cy.get('input[data-testid="aux-p-id-0"]').should('have.value', 'P1');
                cy.get('input[data-testid="aux-p-label-0"]').should('have.value', '111');
                cy.get('input[data-testid="aux-p-id-1"]').should('have.value', 'P2');
                cy.get('input[data-testid="aux-p-label-1"]').should('have.value', '');
                cy.get('input[data-testid="node-id"]').should('have.value', 'N9');
                cy.get('input[data-testid="node-label"]').should('have.value', 'Append');
                cy.get('input[data-testid="pr-p-id"]').should('have.value', 'P0');
                cy.get('input[data-testid="pr-p-label"]').should('have.value', '000');

                cy.get('input[data-testid="show_links"]')
                    .check()
                    .should('be.checked')
                    .then(() => {
                        cy.get('input[data-testid="aux-link_node-id-0"]').should(
                            'have.value',
                            'N8',
                        );
                        cy.get('input[data-testid="aux-link_port-id-0"]').should(
                            'have.value',
                            'P0',
                        );
                        cy.get('input[data-testid="aux-link_node-id-1"]').should('have.value', '');
                        cy.get('input[data-testid="aux-link_port-id-1"]').should('have.value', '');
                        cy.get('input[data-testid="pr-link_node-id"]').should('have.value', 'N5');
                        cy.get('input[data-testid="pr-link_port-id"]').should('have.value', 'P0');
                    });
            });
        });

        it('should select node N9 and change props', () => {
            cy.get('.react-flow__nodes [data-id="N9"]').should('exist').click();

            cy.wait(100);

            cy.get('[data-testid="MenuConfig"]').within(() => {
                cy.get('input[data-testid="aux-p-label-1"]')
                    .clear()
                    .type('1234')
                    .should('have.value', '1234');

                cy.get('button[data-testid="add-edit"]').should('contain', 'Edit agent');
                cy.get('button[data-testid="add-edit"]').should('not.be.disabled').click();
            });

            cy.wait(100);

            cy.get('.react-flow__nodes [data-id="N9"]').should('exist').contains('1234');
        });
    });
});
