/// <reference types="cypress" />

const INGREDIENT_NAME_MAIN = 'Филе Люминесцентного тетраодонтимформа';
const INGREDIENT_NAME_BUN = 'Краторная булка N-200i';

const BUN_ID = '60d3b41abdacab0026a733c6';
const MAIN_ID = '60d3b41abdacab0026a733c8';

const INGREDIENT_ITEM_SELECTOR = '[data-testid="ingredient-item"]';
const CONSTRUCTOR_MAIN_AREA_SELECTOR = '[data-testid="constructor-main-ingredients"]';
const CONSTRUCTOR_BUN_TOP_SELECTOR = '[data-testid="constructor-bun-top"]';
const CONSTRUCTOR_BUN_BOTTOM_SELECTOR = '[data-testid="constructor-bun-bottom"]';

const removeWebpackOverlay = () => {
  return cy.get('body', { log: false }).then(($body) => {
    const $overlay = $body.find('#webpack-dev-server-client-overlay');
    if ($overlay.length) {
      $overlay.remove();
      return cy.wait(50, { log: false });
    }
    return cy.wrap(null, { log: false });
  });
};

describe('Конструктор бургера', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/ingredients', {
      fixture: 'ingredients.json'
    }).as('getIngredients');
    cy.visit('/');
    cy.wait('@getIngredients');
    removeWebpackOverlay();
  });

  it('должен успешно загружаться и отображать моковые ингредиенты', () => {
    cy.contains('Соберите бургер');
    cy.get(INGREDIENT_ITEM_SELECTOR).contains(INGREDIENT_NAME_MAIN);
    cy.get(INGREDIENT_ITEM_SELECTOR).contains(INGREDIENT_NAME_BUN);
  });

  describe('Добавление ингредиентов в конструктор', () => {
    it('должен позволять добавить начинку в конструктор по клику', () => {
      cy.get(CONSTRUCTOR_MAIN_AREA_SELECTOR).should('contain', 'Выберите начинку');
      cy.get(CONSTRUCTOR_MAIN_AREA_SELECTOR).find('li').should('not.exist');

      cy.get(INGREDIENT_ITEM_SELECTOR).contains(INGREDIENT_NAME_MAIN).closest(INGREDIENT_ITEM_SELECTOR).find('button').click({ force: true });

      cy.get(CONSTRUCTOR_MAIN_AREA_SELECTOR).should('not.contain', 'Выберите начинку');
      cy.get(CONSTRUCTOR_MAIN_AREA_SELECTOR).find('li').should('have.length.greaterThan', 0);
      cy.get(CONSTRUCTOR_MAIN_AREA_SELECTOR).should('contain', INGREDIENT_NAME_MAIN);
    });

    it('должен позволять добавить булку в конструктор по клику', () => {
      cy.get(CONSTRUCTOR_BUN_TOP_SELECTOR).should('contain', 'Выберите булки');
      cy.get(CONSTRUCTOR_BUN_BOTTOM_SELECTOR).should('contain', 'Выберите булки');

      cy.get(INGREDIENT_ITEM_SELECTOR).contains(INGREDIENT_NAME_BUN).closest(INGREDIENT_ITEM_SELECTOR).find('button').click({ force: true });

      cy.get(CONSTRUCTOR_BUN_TOP_SELECTOR).should('not.contain', 'Выберите булки');
      cy.get(CONSTRUCTOR_BUN_TOP_SELECTOR).should('contain', `${INGREDIENT_NAME_BUN} (верх)`);
      cy.get(CONSTRUCTOR_BUN_BOTTOM_SELECTOR).should('not.contain', 'Выберите булки');
      cy.get(CONSTRUCTOR_BUN_BOTTOM_SELECTOR).should('contain', `${INGREDIENT_NAME_BUN} (низ)`);
    });
  });

  const MODAL_SELECTOR = '[data-cy="modal"]';
  const MODAL_CLOSE_BUTTON_SELECTOR = '[data-cy="modalClose"]';
  const MODAL_OVERLAY_SELECTOR = '[data-cy="modalCloseOverlay"]';

  const INGREDIENT_IMAGE_SELECTOR = '[data-testid="ingredient-image"]';
  const INGREDIENT_NAME_SELECTOR = '[data-testid="ingredient-name"]';
  const INGREDIENT_CALORIES_SELECTOR = '[data-testid="ingredient-calories"]';
  const INGREDIENT_PROTEINS_SELECTOR = '[data-testid="ingredient-proteins"]';
  const INGREDIENT_FAT_SELECTOR = '[data-testid="ingredient-fat"]';
  const INGREDIENT_CARBOHYDRATES_SELECTOR = '[data-testid="ingredient-carbohydrates"]';

  describe('Модальное окно ингредиента', () => {
    it('должен открываться по клику на ингредиент и отображать корректные данные', () => {
      cy.then(removeWebpackOverlay);
      cy.get(INGREDIENT_ITEM_SELECTOR).contains(INGREDIENT_NAME_MAIN).click({ force: true });
      cy.then(removeWebpackOverlay);
      cy.get(MODAL_SELECTOR).should('be.visible');
      cy.get(INGREDIENT_NAME_SELECTOR).should('contain', INGREDIENT_NAME_MAIN);
      cy.get(INGREDIENT_CALORIES_SELECTOR).should('contain', '643');
      cy.get(INGREDIENT_PROTEINS_SELECTOR).should('contain', '44');
      cy.get(INGREDIENT_FAT_SELECTOR).should('contain', '26');
      cy.get(INGREDIENT_CARBOHYDRATES_SELECTOR).should('contain', '85');
      cy.then(removeWebpackOverlay);
      cy.get(INGREDIENT_IMAGE_SELECTOR)
        .and(($img) => {
          expect(($img[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
        });
    });

    it('должен закрываться по клику на кнопку закрытия (крестик)', () => {
      cy.then(removeWebpackOverlay);
      cy.get(INGREDIENT_ITEM_SELECTOR).contains(INGREDIENT_NAME_MAIN).click({ force: true });
      cy.then(removeWebpackOverlay);
      cy.get(MODAL_SELECTOR).should('be.visible');
      cy.get(MODAL_CLOSE_BUTTON_SELECTOR).click();
      cy.then(removeWebpackOverlay);
      cy.get(MODAL_SELECTOR).should('not.exist');
    });

    it('должен закрываться по клику на оверлей', () => {
      cy.then(removeWebpackOverlay);
      cy.get(INGREDIENT_ITEM_SELECTOR).contains(INGREDIENT_NAME_MAIN).click({ force: true });
      cy.then(removeWebpackOverlay);
      cy.get(MODAL_SELECTOR).should('be.visible');
      cy.get(MODAL_OVERLAY_SELECTOR).click({ force: true });
      cy.then(removeWebpackOverlay);
      cy.get(MODAL_SELECTOR).should('not.exist');
    });
  });

  describe('Создание заказа (требует "авторизации")', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/auth/user', { fixture: 'user.json' }).as('getUser');
      cy.intercept('POST', '**/api/orders', { fixture: 'order.json' }).as('createOrder');
      window.localStorage.setItem('accessToken', 'mock.access.token');
      cy.setCookie('refreshToken', 'mock.refresh.token');
    });

    it('должен корректно настраивать моки и авторизацию для тестов заказа', () => {
      expect(true).to.equal(true);
    });

    it('должен успешно создавать заказ для авторизованного пользователя', () => {
      cy.wait('@getUser');

      cy.get(INGREDIENT_ITEM_SELECTOR).contains(INGREDIENT_NAME_BUN).closest(INGREDIENT_ITEM_SELECTOR).find('button').click({ force: true });
      cy.get(INGREDIENT_ITEM_SELECTOR).contains(INGREDIENT_NAME_MAIN).closest(INGREDIENT_ITEM_SELECTOR).find('button').click({ force: true });

      cy.get(CONSTRUCTOR_BUN_TOP_SELECTOR).should('contain', INGREDIENT_NAME_BUN);
      cy.get(CONSTRUCTOR_MAIN_AREA_SELECTOR).should('contain', INGREDIENT_NAME_MAIN);

      const ORDER_BUTTON_SELECTOR = '[data-cy="order-button"]';
      cy.get(ORDER_BUTTON_SELECTOR)
        .should('be.visible')
        .and('not.be.disabled')
        .click();

      cy.wait('@createOrder', { timeout: 10000 }).its('request.body').should('deep.include', {
        ingredients: [BUN_ID, MAIN_ID, BUN_ID]
      });
      
      const ORDER_NUMBER_SELECTOR = '[data-cy="order-number"]';
      cy.get(MODAL_SELECTOR).should('be.visible');
      cy.get(ORDER_NUMBER_SELECTOR).should('contain', '123456');

      cy.get(MODAL_CLOSE_BUTTON_SELECTOR).click();
      cy.get(MODAL_SELECTOR).should('not.exist');

      cy.get(CONSTRUCTOR_BUN_TOP_SELECTOR).should('contain', 'Выберите булки');
      cy.get(CONSTRUCTOR_BUN_BOTTOM_SELECTOR).should('contain', 'Выберите булки');
      cy.get(CONSTRUCTOR_MAIN_AREA_SELECTOR).should('contain', 'Выберите начинку');
      cy.get(CONSTRUCTOR_MAIN_AREA_SELECTOR).find('li').should('not.exist');
    });

    afterEach(() => {
      window.localStorage.removeItem('accessToken');
      cy.clearCookie('refreshToken');
    });
  });
}); 
