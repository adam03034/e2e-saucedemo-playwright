import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { InventoryPage } from "../pages/InventoryPage";
import { CartPage } from "../pages/CartPage";
import testData from "../test-data/products.json";
import { createLogger } from "../utils/logger";

const log = createLogger("AddToCartSpec");

/**
 * Test Suite: Add to Cart – Positive Scenarios
 *
 * E-shop:  https://www.saucedemo.com  (Sauce Labs demo store)
 * Flow:    Login → Select product from test data → Add to cart →
 *          Navigate to cart → Assert correct product & price
 */
test.describe("Add to Cart – Positive Scenarios", () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    log.info("=== Test setup: navigating to login page ===");
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);

    await loginPage.navigate();
    await loginPage.login(
      testData.validUser.username,
      testData.validUser.password
    );
    await inventoryPage.assertOnPage();
    log.info("Setup complete – user is logged in on inventory page");
  });

  test("TC-001: Add a single product to cart and verify it is present", async () => {
    const product = testData.products[0]; // Sauce Labs Backpack
    log.info(`TC-001 started – product under test: "${product.name}"`);

    // Step 1: Verify initial cart is empty
    const initialCount = await inventoryPage.getCartCount();
    expect(initialCount).toBe(0);
    log.info("Step 1 ✔ – Cart is initially empty");

    // Step 2: Add product to cart
    await inventoryPage.addProductToCart(product);
    log.info("Step 2 ✔ – Product added to cart");

    // Step 3: Assert cart badge shows 1
    await inventoryPage.assertCartCount(1);
    log.info("Step 3 ✔ – Cart badge shows 1");

    // Step 4: Navigate to cart
    await inventoryPage.goToCart();
    await cartPage.assertOnPage();
    log.info("Step 4 ✔ – Cart page opened");

    // Step 5: Assert correct product in cart
    await cartPage.assertProductInCart(product);
    log.info("Step 5 ✔ – Correct product and price confirmed in cart");

    // Step 6: Assert exactly 1 item in cart
    await cartPage.assertCartItemCount(1);
    log.info("Step 6 ✔ – Cart contains exactly 1 item");
  });

  test("TC-002: Add multiple products to cart and verify all are present", async () => {
    log.info("TC-002 started – adding multiple products");

    const products = testData.products; // both products

    // Step 1: Add all products
    for (const product of products) {
      await inventoryPage.addProductToCart(product);
      log.debug(`Added: "${product.name}"`);
    }
    log.info("Step 1 ✔ – All products added");

    // Step 2: Assert cart badge count
    await inventoryPage.assertCartCount(products.length);
    log.info(`Step 2 ✔ – Cart badge shows ${products.length}`);

    // Step 3: Navigate to cart
    await inventoryPage.goToCart();
    await cartPage.assertOnPage();

    // Step 4: Assert correct item count
    await cartPage.assertCartItemCount(products.length);
    log.info(`Step 3 ✔ – Cart page shows ${products.length} items`);

    // Step 5: Assert each product individually
    for (const product of products) {
      await cartPage.assertProductInCart(product);
      log.info(`Step 4 ✔ – "${product.name}" verified in cart`);
    }

    // Step 6: Confirm names match
    const cartNames = await cartPage.getCartProductNames();
    for (const product of products) {
      expect(cartNames).toContain(product.name);
    }
    log.info("Step 5 ✔ – All product names confirmed in cart");
  });

  test("TC-003: Add product from detail page and verify in cart", async ({ page }) => {
    const product = testData.products[0];
    log.info(`TC-003 started – verifying add-to-cart via product detail page`);

    // Step 1: Click on product name to open detail
    await page.locator(".inventory_item_name").filter({ hasText: product.name }).click();
    await expect(page).toHaveURL(/.*inventory-item\.html/);
    log.info("Step 1 ✔ – Product detail page opened");

    // Step 2: Add to cart from detail page
    const addButton = page.locator('[data-test="add-to-cart"]');
    await expect(addButton).toBeVisible();
    await addButton.click();
    log.info("Step 2 ✔ – Added to cart from detail page");

    // Step 3: Assert badge
    await expect(page.locator(".shopping_cart_badge")).toHaveText("1");
    log.info("Step 3 ✔ – Cart badge shows 1");

    // Step 4: Go to cart and verify
    await page.locator(".shopping_cart_link").click();
    await cartPage.assertOnPage();
    await cartPage.assertProductInCart(product);
    log.info("Step 4 ✔ – Product verified in cart from detail page flow");
  });
});
