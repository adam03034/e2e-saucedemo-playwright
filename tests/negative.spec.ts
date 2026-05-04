import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { InventoryPage } from "../pages/InventoryPage";
import { CartPage } from "../pages/CartPage";
import testData from "../test-data/products.json";
import { createLogger } from "../utils/logger";

const log = createLogger("NegativeSpec");

/**
 * Test Suite: Negative Scenarios
 *
 * Covers:
 *  - Login with invalid credentials
 *  - Login with empty fields
 *  - Locked-out user cannot access inventory
 *  - Cart is empty after navigating without adding anything
 *  - Removing an item from cart clears it
 */
test.describe("Negative Scenarios", () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    await loginPage.navigate();
  });

  // -----------------------------------------------------------------------
  // TC-NEG-001: Login with completely invalid credentials
  // -----------------------------------------------------------------------
  test("TC-NEG-001: Login with invalid credentials shows error message", async () => {
    const scenario = testData.negativeScenarios.wrongCredentials;
    log.warn(`TC-NEG-001: Attempting login with invalid credentials`);

    await loginPage.login(scenario.username, scenario.password);

    await loginPage.assertErrorMessage(scenario.expectedError);
    log.info("TC-NEG-001 ✔ – Correct error message shown for bad credentials");

    // User must still be on the login page
    await expect(loginPage.page).toHaveURL("/");
    log.debug("Confirmed user is still on login page");
  });

  // -----------------------------------------------------------------------
  // TC-NEG-002: Login with empty username
  // -----------------------------------------------------------------------
  test("TC-NEG-002: Login with empty username shows validation error", async () => {
    const scenario = testData.negativeScenarios.emptyUsername;
    log.warn("TC-NEG-002: Attempting login without username");

    await loginPage.login(scenario.username, scenario.password);

    await loginPage.assertErrorMessage(scenario.expectedError);
    log.info("TC-NEG-002 ✔ – Validation error shown for missing username");
  });

  // -----------------------------------------------------------------------
  // TC-NEG-003: Login with empty password
  // -----------------------------------------------------------------------
  test("TC-NEG-003: Login with empty password shows validation error", async () => {
    const scenario = testData.negativeScenarios.emptyPassword;
    log.warn("TC-NEG-003: Attempting login without password");

    await loginPage.login(scenario.username, scenario.password);

    await loginPage.assertErrorMessage(scenario.expectedError);
    log.info("TC-NEG-003 ✔ – Validation error shown for missing password");
  });

  // -----------------------------------------------------------------------
  // TC-NEG-004: Locked out user cannot access the inventory
  // -----------------------------------------------------------------------
  test("TC-NEG-004: Locked-out user cannot access inventory page", async () => {
    log.warn("TC-NEG-004: Attempting login with locked_out_user");

    await loginPage.login(
      testData.lockedUser.username,
      testData.lockedUser.password
    );

    await loginPage.assertErrorMessage("Sorry, this user has been locked out");
    log.info("TC-NEG-004 ✔ – Locked user correctly blocked with error message");

    // Assert user is NOT on inventory page
    await expect(loginPage.page).not.toHaveURL(/.*inventory\.html/);
    log.debug("Confirmed locked user cannot reach inventory page");
  });

  // -----------------------------------------------------------------------
  // TC-NEG-005: Cart is empty when navigating directly without adding items
  // -----------------------------------------------------------------------
  test("TC-NEG-005: Cart is empty when no products have been added", async ({ page }) => {
    log.info("TC-NEG-005: Verifying empty cart state");

    // Login first
    await loginPage.login(
      testData.validUser.username,
      testData.validUser.password
    );
    await inventoryPage.assertOnPage();

    // Navigate to cart without adding anything
    await inventoryPage.goToCart();
    await cartPage.assertOnPage();

    // Assert cart is empty
    await cartPage.assertCartItemCount(0);
    log.info("TC-NEG-005 ✔ – Cart is empty as expected");

    // Assert first product from test data is not in cart
    await cartPage.assertProductNotInCart(testData.products[0].name);
    log.info(`TC-NEG-005 ✔ – "${testData.products[0].name}" not in cart`);
  });

  // -----------------------------------------------------------------------
  // TC-NEG-006: Remove item from cart – cart becomes empty
  // -----------------------------------------------------------------------
  test("TC-NEG-006: Removing the only item from cart results in empty cart", async () => {
    const product = testData.products[0];
    log.info(`TC-NEG-006: Add then remove "${product.name}"`);

    // Login & add product
    await loginPage.login(
      testData.validUser.username,
      testData.validUser.password
    );
    await inventoryPage.assertOnPage();
    await inventoryPage.addProductToCart(product);
    await inventoryPage.assertCartCount(1);
    log.debug("Product added, now removing it");

    // Go to cart and remove
    await inventoryPage.goToCart();
    await cartPage.assertOnPage();

    const removeButton = cartPage.page.locator('[data-test^="remove"]');
    await expect(removeButton).toBeVisible();
    await removeButton.click();
    log.info("Clicked Remove button");

    // Cart should now be empty
    await cartPage.assertCartItemCount(0);
    log.info("TC-NEG-006 ✔ – Cart is empty after removing the item");
  });
});
