# 🛒 Playwright Cart Tests

E2E test suite for the **add-to-cart** flow on [Saucedemo](https://www.saucedemo.com), built with **Playwright** and **TypeScript**.

---

## 📁 Project Structure

```
playwright-cart-tests/
├── .github/
│   └── workflows/
│       └── playwright.yml        # GitHub Actions CI/CD pipeline
├── pages/                        # Page Object Models (POM)
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   └── CartPage.ts
├── tests/                        # Test specifications
│   ├── addToCart.spec.ts         # Positive scenarios (TC-001 – TC-003)
│   └── negative.spec.ts          # Negative scenarios (TC-NEG-001 – TC-NEG-006)
├── test-data/
│   └── products.json             # Centralised test data (users, products)
├── utils/
│   └── logger.ts                 # Multi-level logger (DEBUG/INFO/WARN/ERROR)
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## ⚙️ Prerequisites

| Tool       | Version  |
|------------|----------|
| Node.js    | ≥ 18     |
| npm        | ≥ 9      |

---

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone <repository-url>
cd playwright-cart-tests

# 2. Install dependencies
npm ci

# 3. Install Playwright browsers
npx playwright install --with-deps

# 4. Run all tests (headless)
npm test

# 5. Run tests with browser UI visible
npm run test:headed

# 6. Open the HTML report
npm run test:report
```

---

## 🧪 Test Cases

### Positive Scenarios – `addToCart.spec.ts`

| ID       | Description                                               |
|----------|-----------------------------------------------------------|
| TC-001   | Add a single product to cart and verify it is present     |
| TC-002   | Add multiple products to cart and verify all are present  |
| TC-003   | Add product via detail page and verify it in cart         |

### Negative Scenarios – `negative.spec.ts`

| ID          | Description                                               |
|-------------|-----------------------------------------------------------|
| TC-NEG-001  | Login with invalid credentials shows error message        |
| TC-NEG-002  | Login with empty username shows validation error          |
| TC-NEG-003  | Login with empty password shows validation error          |
| TC-NEG-004  | Locked-out user cannot access inventory page              |
| TC-NEG-005  | Cart is empty when no products have been added            |
| TC-NEG-006  | Removing the only item from cart results in empty cart    |

---

## 📦 Test Data

All test inputs are stored in **`test-data/products.json`**:

- **`validUser`** – credentials for a working account
- **`lockedUser`** – locked account to test access restriction
- **`products`** – list of products to use in tests (name, price, id)
- **`negativeScenarios`** – input data + expected error messages for negative TCs

Adding or changing a product under test requires only a change in the JSON file – no test code modification needed.

---

## 📐 Architecture – Page Object Model (POM)

Each page of the application has its own class under `pages/`:

| Class            | URL                            | Responsibilities                        |
|------------------|--------------------------------|-----------------------------------------|
| `LoginPage`      | `/`                            | Navigate, fill credentials, assert errors |
| `InventoryPage`  | `/inventory.html`              | Add products, check cart badge, go to cart |
| `CartPage`       | `/cart.html`                   | Assert items, count, names, prices, removal |

**Benefits:** Selector changes require edits in exactly one place. Tests contain only business-logic steps, not low-level interactions.

---

## 📋 Logging

The `utils/logger.ts` module provides **4 log levels**:

| Level   | Use case                                      | Color  |
|---------|-----------------------------------------------|--------|
| `DEBUG` | Detailed step-by-step info (assertions, etc.) | Cyan   |
| `INFO`  | Main test steps and successful verifications  | Green  |
| `WARN`  | Expected negative/error states                | Yellow |
| `ERROR` | Unexpected failures                           | Red    |

Log level can be controlled via the `LOG_LEVEL` environment variable:

```bash
LOG_LEVEL=WARN npm test    # suppress DEBUG and INFO
LOG_LEVEL=DEBUG npm test   # show everything
```

---

## 🔄 CI/CD – GitHub Actions

The pipeline is defined in `.github/workflows/playwright.yml` and runs on:

- **push** to `main`, `master`, `develop`
- **pull requests** to `main` / `master`
- **manual trigger** from the Actions tab

### What it does

1. Checks out the code
2. Sets up Node.js 20
3. Installs npm dependencies (`npm ci`)
4. Installs Playwright browsers with system dependencies
5. Runs tests in **parallel across Chromium and Firefox**
6. Uploads the **HTML report** as a downloadable artifact (14-day retention)
7. Publishes a **test summary** directly on the PR / commit via `dorny/test-reporter`

> **Cost:** GitHub Actions is **free** for public repositories and includes 2 000 free minutes/month for private ones.

---

## 📊 Reports

After a test run you will find:

| Report             | Path                              | How to open                     |
|--------------------|-----------------------------------|---------------------------------|
| HTML (rich)        | `playwright-report/index.html`    | `npm run test:report`           |
| JUnit XML          | `test-results/junit-results.xml`  | Import into CI or test dashboards|
| CI Artifacts       | GitHub Actions → Artifacts tab    | Download from the workflow run  |

---

## 💡 Approach, Challenges & Decisions

### Chosen e-shop
[Saucedemo](https://www.saucedemo.com) was chosen because it is a purpose-built testing playground: it is always available, requires no real payment data, has stable selectors (`data-test` attributes), and offers special users (e.g. `locked_out_user`) that make negative scenarios straightforward to automate.

### Page Object Model
POM was chosen to keep selectors and navigation logic in one place. This makes the test code readable at the "what" level and resilient to UI selector changes (only the page class needs updating, not every test).

### Test data file
All variable inputs (usernames, passwords, product names, prices, expected error messages) live in `test-data/products.json`. This means tests can be parameterised without touching any TypeScript, and the same data file can be extended for data-driven testing in the future.

### Multi-level logging
A custom logger was written instead of plain `console.log` so that:
1. Log level can be adjusted via `LOG_LEVEL` env var – useful for suppressing noise in CI while keeping full detail locally.
2. Every log entry carries a timestamp and a context label (e.g. `[CartPage]`), making post-mortem debugging faster.
3. Different severity levels (DEBUG/INFO/WARN/ERROR) clearly signal the nature of the message.

### CI/CD choice
GitHub Actions was chosen because it is free, requires zero infrastructure setup, and integrates natively with GitHub PRs. The matrix strategy runs Chromium and Firefox in parallel, reducing total pipeline time. The `dorny/test-reporter` action surfaces pass/fail counts directly on the pull request without needing a separate dashboard.

### Challenges
- **Selector stability:** Saucedemo's `data-test` attributes make selectors very stable; on a real project, agreeing on a `data-testid` convention with the dev team early is critical.
- **Cart state isolation:** Each test uses `beforeEach` to start from a fresh login, ensuring no state leaks between tests.
- **Price assertion:** Asserting both the product name and price in the cart guards against a product being present but with the wrong details (e.g. after a pricing bug).
