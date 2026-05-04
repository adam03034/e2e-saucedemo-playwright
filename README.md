
## 🚀 Ako začať

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

# e2e-saucedemo-playwright

Automatizované testy pre pridanie produktu do košíka na [saucedemo.com](https://www.saucedemo.com). Napísané v Playwright a TypeScript.

## Čo som použil

- Playwright – framework pre e2e testovanie
- TypeScript
- GitHub Actions – CI/CD pipeline

## Štruktúra projektu

```
pages/          - page object modely
tests/          - testovacie scenáre
test-data/      - vstupné dáta (JSON)
utils/          - logger
```

## Spustenie

```bash
npm install
npx playwright install --with-deps
npm test
```

## Testovacie prípady

**Pozitívne scenáre (addToCart.spec.ts)**
- TC-001: pridanie jedného produktu do košíka a overenie
- TC-002: pridanie viacerých produktov a overenie všetkých
- TC-003: pridanie produktu cez detail stránku a overenie

**Negatívne scenáre (negative.spec.ts)**
- TC-NEG-001: neplatné prihlasovacie údaje zobrazia chybovú hlášku
- TC-NEG-002: prázdne meno zobrazia validačnú chybu
- TC-NEG-003: prázdne heslo zobrazí validačnú chybu
- TC-NEG-004: zablokovaný používateľ sa nedostane na stránku s produktmi
- TC-NEG-005: košík je prázdny keď nebol pridaný žiadny produkt
- TC-NEG-006: odobratie položky z košíka výsledkom je prázdny košík

## Testovacie dáta

Produkty a prihlasovacie údaje sú v súbore `test-data/products.json`. Ak treba otestovať iný produkt, stačí upraviť tento súbor bez zásahu do testov.

## Logovanie

Logger podporuje štyri úrovne: DEBUG, INFO, WARN, ERROR. Predvolená úroveň je DEBUG. Dá sa zmeniť cez premennú prostredia:

```bash
LOG_LEVEL=WARN npm test
```

## CI/CD

GitHub Actions spúšťa testy pri každom pushnutí na main vetvu. Testy bežia paralelne na Chromium a Firefox. HTML report sa uloží ako artefakt po každom behu.

## Prístup a rozhodnutia

Ako testovací e-shop som zvolil saucedemo.com, pretože je určený priamo na testovanie – má stabilné selektory, špeciálne používateľské účty pre negatívne scenáre a nevyžaduje reálne platobné údaje.

Použil som Page Object Model (POM) aby boli selektory na jednom mieste. Keď sa zmení UI, upravím len triedu danej stránky, nie každý test zvlášť.

Testovacie dáta sú oddelené v JSON súbore, takže pridanie nového produktu nevyžaduje zásah do kódu testov.
