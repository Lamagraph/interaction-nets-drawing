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
                    .callsFake(el => {
                        if (el.tagName === 'A' && el.hasAttribute('download')) {
                            expect(el.getAttribute('href')).to.include('data:application/json');
                            expect(el.getAttribute('download')).to.include(tailFile);
                            nameFile = el.getAttribute('download');
                            return originalRemoveChild(el);
                        }
                        return originalRemoveChild(el);
                    })
                    .as('removeChildStub');
            });

            cy.wait(100);

            cy.get('[data-testid="MenuControl"] button[data-testid="download"]').click();
            cy.get('@removeChildStub').should('be.called');
            cy.get('body > a[download]').should('not.exist');

            cy.then(() => {
                expect(nameFile).to.include(tailFile);
                cy.log(nameFile);
                cy.readFile(`cypress/downloads/${nameFile}`).then(download => {
                    cy.fixture(`${nameFile.replace(tailFile, '')}`).then(fixture => {
                        expect(download).to.deep.equal(fixture);
                    });
                });
            });
        });
    });

    describe('Upload button', () => {
        it('should click button and upload net in edit mode', () => {
            const nameFile = 'list_add_1.json';
            cy.document().then(doc => {
                const originalRemoveChild = doc.body.removeChild.bind(doc.body);

                cy.stub(doc.body, 'removeChild')
                    .callsFake(el => {
                        if (el.tagName === 'INPUT' && el.type === 'file') {
                            return el;
                        }
                        return originalRemoveChild(el);
                    })
                    .as('removeChildStub');
            });

            cy.get('[data-testid="MenuControl"] button[data-testid="upload"]').click();
            cy.get('@removeChildStub').should('be.called');
            cy.get('body > input[type=file]').attachFile(nameFile);

            cy.get('[data-testid="MenuInfo"]').should('contain', nameFile);
            cy.get('.react-flow[data-testmode="0"]').should('contain', '0');
            cy.get('.react-flow__nodes').children().should('have.length', 9);
            cy.get('.react-flow__edges').children().should('have.length', 10);
        });
    });
});
