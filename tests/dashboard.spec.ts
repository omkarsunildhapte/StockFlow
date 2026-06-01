import { test, expect } from "@playwright/test";
import { uniqueEmail, signupAndLogin, createProduct } from "./helpers";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await signupAndLogin(page, uniqueEmail());
  });

  test("shows zero counts for a new org", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Total Products")).toBeVisible();
    await expect(page.getByText("Total Units in Stock")).toBeVisible();

    const cards = page.locator(".text-3xl");
    await expect(cards.first()).toHaveText("0");
    await expect(cards.nth(1)).toHaveText("0");
  });

  test("shows correct product and stock counts", async ({ page }) => {
    await createProduct(page, { name: "Item A", sku: "ITM-A", quantity: 10 });
    await createProduct(page, { name: "Item B", sku: "ITM-B", quantity: 5 });

    await page.goto("/dashboard");
    const cards = page.locator(".text-3xl");
    await expect(cards.first()).toHaveText("2");
    await expect(cards.nth(1)).toHaveText("15");
  });

  test("low stock section is empty for well-stocked org", async ({ page }) => {
    await createProduct(page, { name: "Stocked", sku: "STK-001", quantity: 100, threshold: 5 });

    await page.goto("/dashboard");
    await expect(page.getByText("No low stock items")).toBeVisible();
  });

  test("low stock table shows products below threshold", async ({ page }) => {
    await createProduct(page, { name: "Critical Item", sku: "CRIT-001", quantity: 2, threshold: 5 });

    await page.goto("/dashboard");
    await expect(page.getByText("Critical Item")).toBeVisible();
    await expect(page.getByText("CRIT-001")).toBeVisible();
  });

  test("low stock table links to product edit page", async ({ page }) => {
    await createProduct(page, { name: "Linkable", sku: "LINK-001", quantity: 1, threshold: 10 });

    await page.goto("/dashboard");
    // Wait for the low-stock row to appear before clicking
    await expect(page.getByRole("link", { name: "Linkable" })).toBeVisible();
    await page.getByRole("link", { name: "Linkable" }).click();
    await page.waitForURL(/\/products\/.+\/edit/);
  });

  test("low stock badge count reflects number of low items", async ({ page }) => {
    await createProduct(page, { name: "Low A", sku: "LA-001", quantity: 1, threshold: 5 });
    await createProduct(page, { name: "Low B", sku: "LB-001", quantity: 2, threshold: 5 });

    await page.goto("/dashboard");
    await expect(page.getByText("2 items")).toBeVisible();
  });

  test("navbar links are visible and working", async ({ page }) => {
    await page.goto("/dashboard");

    await page.getByRole("link", { name: "Products" }).click();
    await expect(page).toHaveURL(/\/products/);

    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL(/\/settings/);

    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
