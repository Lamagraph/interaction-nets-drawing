describe('INflow E2E Tests: dynamics modes', () => {
    const namesFile = ['list_add_1.json', 'list_add_2.json', 'list_add_3.json'];

    beforeEach(() => {
        cy.visit('/interaction-nets-drawing/');

        const pathsFullFile = namesFile.map(name => 'cypress/fixtures/' + name);

        cy.document()
            .then(doc => {
                const originalRemoveChild = doc.body.removeChild.bind(doc.body);

                cy.stub(doc.body, 'removeChild')
                    .callsFake(child => {
                        if (child.tagName === 'INPUT' && child.type === 'file') {
                            return child;
                        }
                        return originalRemoveChild(child);
                    })
                    .as('removeChildStub');
            })
            .then(() => {
                cy.get('[data-testid="MenuControl"] button[data-testid="upload"]').click();
            });

        cy.get('@removeChildStub')
            .should('be.called')
            .then(() => {
                cy.get('body > input[type="file"]').selectFile(pathsFullFile);
            });

        cy.get('.react-flow[id="0"]').should('have.attr', 'data-testmode').and('equal', '2');

        cy.then(() => {
            cy.get('.react-flow[id=1] .react-flow__nodes')
                .children()
                .should('be.visible')
                .and('have.length', 9);
            cy.get('.react-flow[id=0] .react-flow__nodes')
                .children()
                .should('be.visible')
                .and('have.length', 9);
        });
    });

    describe('Comparison', () => {
        it('should upload nets and set comparison mode', () => {
            cy.get('[data-testid="MenuInfo"]').should('contain', namesFile[0]);
            cy.get('[data-testid="MenuControl"]').within(() => {
                cy.get('[data-testid="edit-net"]').should('exist').should('not.be.disabled');
                cy.get('[data-testid="next-step"]').should('exist').should('not.be.disabled');
                cy.get('[data-testid="prev-step"]').should('exist').should('be.disabled');
                cy.get('[data-testid="save-net"]').should('not.exist');
                cy.get('[data-testid="go-back"]').should('not.exist');
            });

            cy.get('[data-testid="SubFlowInfo"]').should('contain', namesFile[1]);
            cy.get('[data-testid="SimplifyMenuControl"]').within(() => {
                cy.get('[data-testid="edit-net"]').should('exist').should('not.be.disabled');
                cy.get('[data-testid="download"]').should('exist').should('not.be.disabled');
            });
        });
    });

    describe('Sequence', () => {
        it('should go to next step and set sequence mode', () => {
            cy.get('[data-testid="next-step"]').click();

            cy.get('[data-testid="MenuInfo"]').should('contain', namesFile[1]);
            cy.get('[data-testid="SubFlowInfo"]').should('contain', namesFile[2]);

            cy.get('[data-testid="MenuInfo"]').within(() => {
                cy.get('[data-testid="mode__select"]').select('1').should('have.value', '1');

                cy.get('option[value=1]').should('contain', 'sequence');
            });

            cy.get('.react-flow[id="1"]').should('not.exist');
            cy.get('[data-testid="MenuInfo"]').should('contain', namesFile[1]);
        });
    });
});
