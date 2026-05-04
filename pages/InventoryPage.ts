import { Page, Locator, expect } from "@playwright/test";
import { createLogger } from "../utils/logger";

const log = createLogger("InventoryPage");

export interface Product {
  id: string;
  name: string;
  price: string;
  description?: string;
}

/**
 * Page Object Model for the Saucedemo inventory (products) page.
 * URL: https://www.saucedemo.com/inventory.html
 */
export class InventoryPage {
  readonly page: Page;

  // Locators
  readonly pageTitle: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator(".title");
    this.cartBadge = page.locator(".shopping_cart_badge");
    this.cartLink = page.locator(".shopping_cart_link");
  }

  /** Assert that the inventory page is displayed */
  async assertOnPage(): Promise<void> {
    log.info("Asserting inventory page is loaded");
    await expect(this.page).toHaveURL(/.*inventory\.html/);
    await expect(this.pageTitle).toHaveText("Products");
    log.debug("Inventory page confirmed");
  }

  /**
   * Add a product to the cart by its exact name.
   * Throws if the product is not found on the page.
   */
  async addProductToCart(product: Product): Promise<void> {
    log.info(`Adding product to cart: "${product.name}"`);

    // Find the product card that contains the product name
    const productCard = this.page
      .locator(".inventory_item")
      .filter({ hasText: product.name });

    await expect(productCard).toBeVisible({ timeout: 5000 });
    log.debug(`Product card found for "${product.name}"`);

    const addButton = productCard.locator("button");
    await expect(addButton).toBeVisible();
    await addButton.click();

    log.info(`Product "${product.name}" added to cart`);
  }

  /**
   * Returns the current cart item count shown on the cart badge.
   * Returns 0 if the badge is not visible (empty cart).
   */
  async getCartCount(): Promise<number> {
    const isVisible = await this.cartBadge.isVisible();
    if (!isVisible) {
      log.debug("Cart badge not visible – cart is empty");
      return 0;
    }
    const text = await this.cartBadge.textContent();
    const count = parseInt(text ?? "0", 10);
    log.debug(`Cart badge shows count: ${count}`);
    return count;
  }

  /** Assert the cart badge shows the expected item count */
  async assertCartCount(expected: number): Promise<void> {
    log.info(`Asserting cart count equals ${expected}`);
    if (expected === 0) {
      await expect(this.cartBadge).not.toBeVisible();
    } else {
      await expect(this.cartBadge).toHaveText(String(expected));
    }
    log.debug(`Cart count assertion passed (expected: ${expected})`);
  }

  /** Navigate to the cart page */
  async goToCart(): Promise<void> {
    log.info("Navigating to cart");
    await this.cartLink.click();
    await expect(this.page).toHaveURL(/.*cart\.html/);
    log.debug("Successfully navigated to cart page");
  }
}
