describe('INflow E2E Tests: hosting', () => {
    it('hosting', () => {
        cy.visit('/');
    });
});

describe('INflow E2E Tests: startup', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    describe('Menus', () => {
        it('availability all menus', () => {
            cy.get('#MenuConfig');
            cy.get('#MenuControl');
            cy.get('#MenuLayouts');
            cy.get('#MenuInfo');
        });
    });

    describe('Nets elements', () => {
        it('availability all nodes and edges', () => {
            cy.get('.react-flow__nodes').children().should('have.length', 9);
            cy.get('.react-flow__edges').children().should('have.length', 10);
        });
    });
});

describe('INflow E2E Tests: interaction', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    describe('Run force layout', () => {
        it('hiding MenuConfig', () => {
            cy.get('#MenuConfig .react-flow__panel').should('be.visible');
            cy.get('#MenuLayouts button:contains("Start D3-force")').click();

            cy.get('#MenuLayouts button').should('contain', 'Stop D3-force');
            cy.get('#MenuConfig').should('exist').should('not.be.visible');
            cy.get('#MenuConfig .react-flow__panel').should('not.exist');
        });
    });
});
