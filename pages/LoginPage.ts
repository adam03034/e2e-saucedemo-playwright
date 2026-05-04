import { Page, Locator, expect } from "@playwright/test";
import { createLogger } from "../utils/logger";

const log = createLogger("LoginPage");

/**
 * Page Object Model for the Saucedemo login page.
 * URL: https://www.saucedemo.com
 */
export class LoginPage {
  readonly page: Page;

  // Locators
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  /** Navigate to the login page */
  async navigate(): Promise<void> {
    log.info("Navigating to login page");
    await this.page.goto("/");
    await expect(this.loginButton).toBeVisible();
    log.debug("Login page loaded successfully");
  }

  /** Perform login with given credentials */
  async login(username: string, password: string): Promise<void> {
    log.info(`Attempting login with username: "${username}"`);
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    log.debug("Login form submitted");
  }

  /** Assert that an error message is shown and matches the expected text */
  async assertErrorMessage(expectedText: string): Promise<void> {
    log.warn(`Asserting login error contains: "${expectedText}"`);
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedText);
    log.debug("Error message assertion passed");
  }

  /** Assert there is NO error message visible */
  async assertNoError(): Promise<void> {
    log.debug("Asserting no error message is visible");
    await expect(this.errorMessage).not.toBeVisible();
  }
}
