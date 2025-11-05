// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import '@cypress/code-coverage/support';

// This error often occurs in CI (not always), so I will have to disable this error until the bug is resolved.
// https://github.com/cypress-io/cypress/issues/29277
// https://github.com/cypress-io/cypress/issues/31479
Cypress.on('uncaught:exception', (err, runnable) => {
    if (err.message.includes('ResizeObserver loop')) {
        const testName = runnable?.title || 'Unknown test';
        console.warn(`Warning: catch ResizeObserver in test: ${testName}`, err);
        return false;
    }
    return true;
});
