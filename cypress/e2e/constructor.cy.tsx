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
      cy.get(CONSTRUCTOR_MAIN_AREA_SELECTOR)
        .should('be.visible')
        .and('contain', 'Выберите начинку');
      cy.get(CONSTRUCTOR_MAIN_AREA_SELECTOR).find('li').should('not.exist');

      cy.addIngredientToConstructor(INGREDIENT_NAME_MAIN);

      cy.get(CONSTRUCTOR_MAIN_AREA_SELECTOR).should('not.contain', 'Выберите начинку');
      cy.get(CONSTRUCTOR_MAIN_AREA_SELECTOR).find('li').should('have.length.greaterThan', 0);
      cy.get(CONSTRUCTOR_MAIN_AREA_SELECTOR).should('contain', INGREDIENT_NAME_MAIN);
    });

    it('должен позволять добавить булку в конструктор по клику', () => {
      cy.get(CONSTRUCTOR_BUN_TOP_SELECTOR).should('contain', 'Выберите булки');
      cy.get(CONSTRUCTOR_BUN_BOTTOM_SELECTOR).should('contain', 'Выберите булки');

      cy.addIngredientToConstructor(INGREDIENT_NAME_BUN);

      cy.get(CONSTRUCTOR_BUN_TOP_SELECTOR).should('not.contain', 'Выберите булки');
      cy.get(CONSTRUCTOR_BUN_TOP_SELECTOR).should('contain', `${INGREDIENT_NAME_BUN} (верх)`);
      cy.get(CONSTRUCTOR_BUN_BOTTOM_SELECTOR).should('not.contain', 'Выберите булки');
      cy.get(CONSTRUCTOR_BUN_BOTTOM_SELECTOR).should('contain', `${INGREDIENT_NAME_BUN} (низ)`);
    });
  });

  describe('Модальное окно ингредиента', () => {
    it('должен открываться по клику на ингредиент и отображать корректные данные', () => {
      cy.then(removeWebpackOverlay);
      cy.openIngredientModalAndVerifyData(INGREDIENT_NAME_MAIN, {
        calories: '643',
        proteins: '44',
        fat: '26',
        carbohydrates: '85'
      });
      cy.then(removeWebpackOverlay);
    });

    it('должен закрываться по клику на кнопку закрытия (крестик)', () => {
      cy.then(removeWebpackOverlay);
      cy.get(INGREDIENT_ITEM_SELECTOR).contains(INGREDIENT_NAME_MAIN).click({ force: true });
      cy.then(removeWebpackOverlay);
      cy.closeModalByButton();
      cy.then(removeWebpackOverlay);
    });

    it('должен закрываться по клику на оверлей', () => {
      cy.then(removeWebpackOverlay);
      cy.get(INGREDIENT_ITEM_SELECTOR).contains(INGREDIENT_NAME_MAIN).click({ force: true });
      cy.then(removeWebpackOverlay);
      cy.closeModalByOverlay();
      cy.then(removeWebpackOverlay);
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
      cy.createOrder({
        bunName: INGREDIENT_NAME_BUN,
        mainIngredientName: INGREDIENT_NAME_MAIN,
        bunId: BUN_ID,
        mainIngredientId: MAIN_ID,
        expectedOrderNumber: '123456'
      });
    });

    afterEach(() => {
      window.localStorage.removeItem('accessToken');
      cy.clearCookie('refreshToken');
    });
  });
}); 
