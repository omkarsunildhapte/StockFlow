# StockFlow — Playwright Test Report

**Date:** 2026-06-02  
**Mode:** Headed (browser visible)  
**Runner:** Playwright + Chromium  
**Total:** 30 tests | **Passed:** 30 | **Failed:** 0  
**Duration:** ~2.9 minutes (single worker, sequential)

---

## Results

| # | Suite | Test | Status | Time |
|---|-------|------|--------|------|
| 1 | Auth | redirects unauthenticated users to /login | ✅ Pass | 3.9s |
| 2 | Auth | signup creates account and lands on dashboard | ✅ Pass | 8.4s |
| 3 | Auth | signup shows error for duplicate email | ✅ Pass | 3.5s |
| 4 | Auth | signup shows error when passwords do not match | ✅ Pass | 1.1s |
| 5 | Auth | login with valid credentials navigates to dashboard | ✅ Pass | 3.9s |
| 6 | Auth | login with wrong password shows error | ✅ Pass | 4.8s |
| 7 | Auth | logout clears session and redirects to login | ✅ Pass | 8.5s |
| 8 | Auth | signup page links to login | ✅ Pass | 1.6s |
| 9 | Auth | login page links to signup | ✅ Pass | 1.6s |
| 10 | Dashboard | shows zero counts for a new org | ✅ Pass | 5.0s |
| 11 | Dashboard | shows correct product and stock counts | ✅ Pass | 9.3s |
| 12 | Dashboard | low stock section is empty for well-stocked org | ✅ Pass | 7.2s |
| 13 | Dashboard | low stock table shows products below threshold | ✅ Pass | 6.3s |
| 14 | Dashboard | low stock table links to product edit page | ✅ Pass | 6.3s |
| 15 | Dashboard | low stock badge count reflects number of low items | ✅ Pass | 7.2s |
| 16 | Dashboard | navbar links are visible and working | ✅ Pass | 4.5s |
| 17 | Products | empty state shows add product prompt | ✅ Pass | 5.4s |
| 18 | Products | create a product and see it in the list | ✅ Pass | 6.3s |
| 19 | Products | create product shows error for duplicate SKU | ✅ Pass | 6.2s |
| 20 | Products | create product requires name and SKU | ✅ Pass | 3.7s |
| 21 | Products | edit a product updates it in the list | ✅ Pass | 8.1s |
| 22 | Products | delete a product removes it from the list | ✅ Pass | 6.7s |
| 23 | Products | search filters products by name | ✅ Pass | 7.8s |
| 24 | Products | search filters products by SKU | ✅ Pass | 7.3s |
| 25 | Products | low stock badge shows when quantity <= threshold | ✅ Pass | 4.8s |
| 26 | Products | ok badge shows when quantity > threshold | ✅ Pass | 5.6s |
| 27 | Products | cancel on edit form navigates back | ✅ Pass | 6.3s |
| 28 | Settings | settings page loads with default threshold of 5 | ✅ Pass | 4.9s |
| 29 | Settings | saving a new threshold persists after reload | ✅ Pass | 6.5s |
| 30 | Settings | global threshold is used for products without a threshold | ✅ Pass | 8.8s |

---

## Failures Fixed (Previous Run → Fixed)

The run before the final one had **5 failures**. All were caused by UI changes during the redesign. Details and fixes below.

---

### ❌ Fix 1 — Empty state "Add Product" strict mode violation
**Test:** `Products › empty state shows add product prompt`  
**File:** `tests/products.spec.ts:12`

**Error:**
```
strict mode violation: getByRole('link', { name: /Add Product/ }) resolved to 2 elements
  1) header "Add Product" link
  2) empty state "Add Product" link
```

**Root cause:** After redesign, there are two `<Link href="/products/new">Add Product</Link>` elements on the page — one in the page header and one in the empty state card. The old selector found "Add your first product" which was unique; the new one matched both.

**Fix:** Added `.first()` to avoid strict mode violation, and updated text to remove the trailing period:
```diff
- await expect(page.getByText("No products found.")).toBeVisible();
- await expect(page.getByRole("link", { name: "Add your first product" })).toBeVisible();
+ await expect(page.getByText("No products found")).toBeVisible();
+ await expect(page.getByRole("link", { name: /Add Product/ }).first()).toBeVisible();
```

---

### ❌ Fix 2 — Delete flow: native `window.confirm` replaced by shadcn AlertDialog
**Test:** `Products › delete a product removes it from the list`  
**File:** `tests/products.spec.ts:58`

**Error:**
```
expect(locator).not.toBeVisible() failed
Locator:  getByText('To Delete')
Received: visible  ← matched the toast: "To Delete" deleted
```

**Root cause (1):** The delete button now opens a shadcn `AlertDialog` (DOM element) instead of the browser's native `window.confirm` dialog. The old `page.on("dialog", d => d.accept())` handler never fires.

**Root cause (2):** After successful deletion, `toast.success('"To Delete" deleted')` renders in the DOM. `getByText("To Delete")` uses substring matching by default, so it matched the toast text and the assertion `not.toBeVisible()` failed.

**Fix:**
```diff
- page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Delete" }).first().click();

+ const dialog = page.getByRole("alertdialog");
+ await expect(dialog).toBeVisible();
+ await dialog.getByRole("button", { name: "Delete" }).click();

- await expect(page.getByText("To Delete")).not.toBeVisible();
+ await expect(page.getByText("To Delete", { exact: true })).not.toBeVisible();
```

---

### ❌ Fix 3 — "OK" badge renamed to "In Stock"
**Test:** `Products › ok badge shows when quantity > threshold`  
**File:** `tests/products.spec.ts:103`

**Error:**
```
expect(locator).toBeVisible() failed
Locator: getByText("OK")
```

**Root cause:** The badge text was changed from `"OK"` to `"In Stock"` during the UI redesign.

**Fix:**
```diff
- await expect(page.getByText("OK")).toBeVisible();
+ await expect(page.getByText("In Stock")).toBeVisible();
```

---

### ❌ Fix 4 — Duplicate SKU error now shown as a toast
**Test:** `Products › create product shows error for duplicate SKU`  
**File:** `tests/products.spec.ts:32`

**Error:**
```
expect(locator).toBeVisible() failed
Locator: getByText("SKU already exists")
```

**Root cause:** The redesigned `ProductForm` shows errors via `toast.error(data.error)` instead of inline text. The API returns `"SKU already exists in your organization"` — the old assertion only searched for the shorter substring with exact matching.

**Fix:**
```diff
- await expect(page.getByText("SKU already exists")).toBeVisible();
+ await expect(page.getByText("SKU already exists in your organization")).toBeVisible();
```

---

### ❌ Fix 5 — "Show password" button interferes with `getByLabel("Password")`
**Tests:**
- `Auth › login with valid credentials navigates to dashboard`
- `Auth › login with wrong password shows error`
- `tests/helpers.ts › login()`

**Error:**
```
strict mode violation: getByLabel('Password') resolved to 2 elements
  1) <input id="password" type="password"> (the actual input)
  2) <button aria-label="Show password">  (the toggle button)
```

**Root cause:** `getByLabel` uses substring matching by default. "Show **password**" contains "password", so Playwright matched both the input (labeled "Password") and the show/hide toggle button (aria-label="Show password").

**Fix:** Use `{ exact: true }` so only the element labeled exactly "Password" matches:
```diff
// tests/helpers.ts
- await page.getByLabel("Password").fill(password);
+ await page.getByLabel("Password", { exact: true }).fill(password);

// tests/auth.spec.ts
- await page.getByLabel("Password").fill("wrongpassword");
+ await page.getByLabel("Password", { exact: true }).fill("wrongpassword");
```

---

### ❌ Fix 6 — Signup test timeout (Neon cold-start latency)
**Test:** `Auth › signup creates account and lands on dashboard`  
**File:** `tests/auth.spec.ts:23`

**Error:**
```
expect(page).toHaveURL(/\/dashboard/) failed
Received: "http://localhost:3000/signup"
Timeout: 5000ms
```

**Root cause:** `toHaveURL` uses Playwright's assertion timeout (5 s). Signup involves `bcrypt.hash` (~200 ms) + Neon PostgreSQL cold-start (~2–4 s) + JWT sign + navigation. On a cold connection the round-trip exceeded 5 s while the button was still showing "Creating account…".

**Fix:** Use `page.waitForURL` which uses the full test timeout (30 s) instead of the assertion timeout:
```diff
- await expect(page).toHaveURL(/\/dashboard/);
+ await page.waitForURL(/\/dashboard/);
```

---

### ❌ Fix 7 — Settings toast text had trailing period
**Tests:**
- `Settings › saving a new threshold persists after reload`
- `Settings › global threshold is used for products without a threshold`

**Error:**
```
expect(locator).toBeVisible() failed
Locator: getByText("Settings saved.")
```

**Root cause:** The settings page calls `toast.success("Settings saved")` (no period). The old test expected `"Settings saved."` with a period.

**Fix:**
```diff
- await expect(page.getByText("Settings saved.")).toBeVisible();
+ await expect(page.getByText("Settings saved")).toBeVisible();
```

---

## Test Coverage Summary

| Area | Tests | What's Covered |
|------|-------|----------------|
| Auth | 9 | Signup, login, logout, error states, page links, middleware redirect |
| Dashboard | 7 | Stat cards, low-stock table, badge counts, navbar links |
| Products | 11 | CRUD, search, badges, delete confirm dialog, empty state |
| Settings | 3 | Load, save, global threshold propagation |
