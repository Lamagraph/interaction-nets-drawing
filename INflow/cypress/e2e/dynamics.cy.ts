describe('INflow E2E Tests: dynamics', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    describe('Download button', () => {
        it('should click button and download net in JSON', () => {
            cy.get('body > a[download]').should('not.exist');
            let nameFile = '';
            const tailFile = '_edited.json';

            cy.document().then(doc => {
                const originalRemoveChild = doc.body.removeChild.bind(doc.body);

                cy.stub(doc.body, 'removeChild')
                    .callsFake(child => {
                        if (child.tagName === 'A' && child.hasAttribute('download')) {
                            expect(child.getAttribute('href')).to.include('data:application/json');
                            nameFile = child.getAttribute('download');
                            expect(nameFile).to.include(tailFile);
                            return originalRemoveChild(child);
                        }
                        return originalRemoveChild(child);
                    })
                    .as('removeChildStub');
            });

            cy.wait(500);

            cy.get('[data-testid="MenuControl"] button[data-testid="download"]').click();
            cy.get('@removeChildStub').should('be.called');
            cy.get('body > a[download]').should('not.exist');

            cy.then(() => {
                cy.wrap({ value: nameFile }).its('value').should('not.be.empty');
                cy.readFile(`cypress/downloads/${nameFile}`).then(download => {
                    cy.fixture(`${nameFile.replace(tailFile, '')}`).then(fixture => {
                        expect(download.agents).to.deep.equal(fixture.agents);
                        expect(download.edges).to.deep.equal(fixture.edges);
                        expect(download.name).to.equal(fixture.name);
                    });
                });
            });
        });
    });

    describe('Upload button', () => {
        it('should click button and upload net in edit mode', () => {
            const nameFile = 'list_add_3.json';

            cy.document().then(doc => {
                const originalRemoveChild = doc.body.removeChild.bind(doc.body);

                cy.stub(doc.body, 'removeChild')
                    .callsFake(child => {
                        if (child.tagName === 'INPUT' && child.type === 'file') {
                            return child;
                        }
                        return originalRemoveChild(child);
                    })
                    .as('removeChildStub');
            });

            cy.get('[data-testid="MenuControl"] button[data-testid="upload"]').click();
            cy.get('@removeChildStub')
                .should('be.called')
                .then(() => {
                    cy.get('body > input[type="file"]').selectFile('cypress/fixtures/' + nameFile);
                });

            cy.get('[data-testid="MenuInfo"]').should('contain', nameFile);
            cy.get('[data-testid="MenuControl"]').within(() => {
                cy.get('.react-flow__controls-zoomin').should('exist').should('not.be.disabled');
                cy.get('.react-flow__controls-zoomout').should('exist').should('not.be.disabled');
                cy.get('.react-flow__controls-fitview').should('exist').should('not.be.disabled');
                cy.get('.react-flow__controls-interactive')
                    .should('exist')
                    .should('not.be.disabled');
            });
            cy.get('.react-flow').should('have.attr', 'data-testmode').and('equal', '0');
            cy.get('.react-flow__nodes').children().should('have.length', 7);
            cy.get('.react-flow__edges').children().should('have.length', 7);
        });
    });

    describe('Modes', () => {
        const namesFile = ['list_add_1.json', 'list_add_2.json', 'list_add_3.json'];

        beforeEach(() => {
            const pathsFullFile = namesFile.map(name => 'cypress/fixtures/' + name);

            cy.document().then(doc => {
                const originalRemoveChild = doc.body.removeChild.bind(doc.body);

                cy.stub(doc.body, 'removeChild')
                    .callsFake(child => {
                        if (child.tagName === 'INPUT' && child.type === 'file') {
                            return child;
                        }
                        return originalRemoveChild(child);
                    })
                    .as('removeChildStub');
            });

            cy.get('[data-testid="MenuControl"] button[data-testid="upload"]').click();

            cy.get('@removeChildStub')
                .should('be.called')
                .then(() => {
                    cy.get('body > input[type="file"]').selectFile(pathsFullFile);
                });

            cy.wait(100); // only for ResizeObserver
        });

        describe('Comparison', () => {
            it('should upload nets and set comparison mode', () => {
                cy.get('.react-flow[id="0"]')
                    .should('have.attr', 'data-testmode')
                    .and('equal', '2');
                cy.get('[data-testid="MenuInfo"]').should('contain', namesFile[0]);
                cy.get('[data-testid="MenuControl"]').within(() => {
                    cy.get('[data-testid="edit-net"]').should('exist').should('not.be.disabled');
                    cy.get('[data-testid="next-step"]').should('exist').should('not.be.disabled');
                    cy.get('[data-testid="prev-step"]').should('exist').should('be.disabled');
                    cy.get('[data-testid="save-net"]').should('not.exist');
                    cy.get('[data-testid="go-back"]').should('not.exist');
                });

                cy.get('.react-flow[id="1"]').should('exist');
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

                cy.wait(500);

                cy.get('[data-testid="MenuInfo"]').should('contain', namesFile[1]);
                cy.get('[data-testid="SubFlowInfo"]').should('contain', namesFile[2]);

                cy.get('[data-testid="MenuInfo"]').within(() => {
                    cy.get('[data-testid="mode__select"]').select('1').should('have.value', '1');

                    cy.get('option[value=1]').should('contain', 'sequence');
                });

                cy.wait(500);

                cy.get('.react-flow[id="1"]').should('not.exist');
                cy.get('[data-testid="MenuInfo"]').should('contain', namesFile[1]);
            });
        });
    });
});
