/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

const INGREDIENT_ITEM_SELECTOR = '[data-testid="ingredient-item"]';

Cypress.Commands.add('addIngredientToConstructor', (ingredientName: string) => {
  cy.get(INGREDIENT_ITEM_SELECTOR)
    .contains(ingredientName)
    .closest(INGREDIENT_ITEM_SELECTOR)
    .find('button')
    .click({ force: true });
});

const MODAL_SELECTOR = '[data-cy="modal"]';
const INGREDIENT_NAME_SELECTOR = '[data-testid="ingredient-name"]';
const INGREDIENT_CALORIES_SELECTOR = '[data-testid="ingredient-calories"]';
const INGREDIENT_PROTEINS_SELECTOR = '[data-testid="ingredient-proteins"]';
const INGREDIENT_FAT_SELECTOR = '[data-testid="ingredient-fat"]';
const INGREDIENT_CARBOHYDRATES_SELECTOR = '[data-testid="ingredient-carbohydrates"]';
const INGREDIENT_IMAGE_SELECTOR = '[data-testid="ingredient-image"]';

interface IngredientData {
  calories: string;
  proteins: string;
  fat: string;
  carbohydrates: string;
}

Cypress.Commands.add(
  'openIngredientModalAndVerifyData',
  (ingredientName: string, expectedData: IngredientData) => {
    cy.get(INGREDIENT_ITEM_SELECTOR).contains(ingredientName).click({ force: true });
    cy.get(MODAL_SELECTOR).should('be.visible');
    cy.get(INGREDIENT_NAME_SELECTOR).should('contain', ingredientName);
    cy.get(INGREDIENT_CALORIES_SELECTOR).should('contain', expectedData.calories);
    cy.get(INGREDIENT_PROTEINS_SELECTOR).should('contain', expectedData.proteins);
    cy.get(INGREDIENT_FAT_SELECTOR).should('contain', expectedData.fat);
    cy.get(INGREDIENT_CARBOHYDRATES_SELECTOR).should(
      'contain',
      expectedData.carbohydrates
    );
    cy.get(INGREDIENT_IMAGE_SELECTOR).and(($img) => {
      expect(($img[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
    });
  }
);

const MODAL_CLOSE_BUTTON_SELECTOR = '[data-cy="modalClose"]';
const MODAL_OVERLAY_SELECTOR = '[data-cy="modalCloseOverlay"]';

Cypress.Commands.add('closeModalByButton', () => {
  cy.get(MODAL_SELECTOR).should('be.visible');
  cy.get(MODAL_CLOSE_BUTTON_SELECTOR).click();
  cy.get(MODAL_SELECTOR).should('not.exist');
});

Cypress.Commands.add('closeModalByOverlay', () => {
  cy.get(MODAL_SELECTOR).should('be.visible');
  cy.get(MODAL_OVERLAY_SELECTOR).click({ force: true }); 
  cy.get(MODAL_SELECTOR).should('not.exist');
});

const CONSTRUCTOR_BUN_TOP_SELECTOR = '[data-testid="constructor-bun-top"]';
const CONSTRUCTOR_MAIN_AREA_SELECTOR = '[data-testid="constructor-main-ingredients"]';
const CONSTRUCTOR_BUN_BOTTOM_SELECTOR = '[data-testid="constructor-bun-bottom"]';
const ORDER_BUTTON_SELECTOR = '[data-cy="order-button"]';
const ORDER_NUMBER_SELECTOR = '[data-cy="order-number"]';

interface CreateOrderOptions {
  bunName: string;
  mainIngredientName: string;
  bunId: string;
  mainIngredientId: string;
  expectedOrderNumber: string;
}

Cypress.Commands.add('createOrder', (options: CreateOrderOptions) => {
  const { bunName, mainIngredientName, bunId, mainIngredientId, expectedOrderNumber } = options;

  cy.wait('@getUser');

  cy.addIngredientToConstructor(bunName);
  cy.addIngredientToConstructor(mainIngredientName);

  cy.get(CONSTRUCTOR_BUN_TOP_SELECTOR).should('contain', bunName);
  cy.get(CONSTRUCTOR_MAIN_AREA_SELECTOR).should('contain', mainIngredientName);

  cy.get(ORDER_BUTTON_SELECTOR)
    .should('be.visible')
    .and('not.be.disabled')
    .click();

  cy.wait('@createOrder', { timeout: 10000 })
    .its('request.body')
    .should('deep.include', {
      ingredients: [bunId, mainIngredientId, bunId]
    });

  cy.get(MODAL_SELECTOR).should('be.visible');
  cy.get(ORDER_NUMBER_SELECTOR).should('contain', expectedOrderNumber);

  cy.closeModalByButton();

  cy.get(CONSTRUCTOR_BUN_TOP_SELECTOR).should('contain', 'Выберите булки');
  cy.get(CONSTRUCTOR_BUN_BOTTOM_SELECTOR).should('contain', 'Выберите булки');
  cy.get(CONSTRUCTOR_MAIN_AREA_SELECTOR).should('contain', 'Выберите начинку');
  cy.get(CONSTRUCTOR_MAIN_AREA_SELECTOR).find('li').should('not.exist');
});

declare global {
  namespace Cypress {
    interface Chainable {
      addIngredientToConstructor(ingredientName: string): Chainable<void>;
      openIngredientModalAndVerifyData(
        ingredientName: string,
        expectedData: IngredientData
      ): Chainable<void>;
      closeModalByButton(): Chainable<void>;
      closeModalByOverlay(): Chainable<void>;
      createOrder(options: CreateOrderOptions): Chainable<void>;
    }
  }
}

export {};
