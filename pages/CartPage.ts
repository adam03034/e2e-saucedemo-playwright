import { Page, Locator, expect } from "@playwright/test";
import { createLogger } from "../utils/logger";
import type { Product } from "./InventoryPage";

const log = createLogger("CartPage");

/**
 * Page Object Model for the Saucedemo cart page.
 * URL: https://www.saucedemo.com/cart.html
 */
export class CartPage {
  readonly page: Page;

  // Locators
  readonly pageTitle: Locator;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator(".title");
    this.cartItems = page.locator(".cart_item");
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  /** Assert cart page is displayed */
  async assertOnPage(): Promise<void> {
    log.info("Asserting cart page is loaded");
    await expect(this.page).toHaveURL(/.*cart\.html/);
    await expect(this.pageTitle).toHaveText("Your Cart");
    log.debug("Cart page confirmed");
  }

  /** Assert that the cart contains a specific product */
  async assertProductInCart(product: Product): Promise<void> {
    log.info(`Asserting product "${product.name}" is in cart`);

    const cartItem = this.cartItems.filter({ hasText: product.name });
    await expect(cartItem).toBeVisible({ timeout: 5000 });

    // Verify product name
    const nameLocator = cartItem.locator(".inventory_item_name");
    await expect(nameLocator).toHaveText(product.name);
    log.debug(`Product name verified: "${product.name}"`);

    // Verify product price
    const priceLocator = cartItem.locator(".inventory_item_price");
    await expect(priceLocator).toHaveText(product.price);
    log.debug(`Product price verified: "${product.price}"`);

    log.info(`✔ Product "${product.name}" correctly found in cart at ${product.price}`);
  }

  /** Assert the total number of items in the cart */
  async assertCartItemCount(expected: number): Promise<void> {
    log.info(`Asserting cart contains ${expected} item(s)`);
    await expect(this.cartItems).toHaveCount(expected);
    log.debug(`Cart item count assertion passed (expected: ${expected})`);
  }

  /** Assert that a specific product is NOT in the cart */
  async assertProductNotInCart(productName: string): Promise<void> {
    log.warn(`Asserting product "${productName}" is NOT in cart`);
    const cartItem = this.cartItems.filter({ hasText: productName });
    await expect(cartItem).not.toBeVisible();
    log.debug(`Confirmed "${productName}" not present in cart`);
  }

  /** Get all product names currently in the cart */
  async getCartProductNames(): Promise<string[]> {
    const nameLocators = this.cartItems.locator(".inventory_item_name");
    const count = await nameLocators.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const name = await nameLocators.nth(i).textContent();
      if (name) names.push(name.trim());
    }
    log.debug(`Products in cart: ${JSON.stringify(names)}`);
    return names;
  }
}
