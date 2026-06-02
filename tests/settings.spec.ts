import { test, expect } from "@playwright/test";
import { uniqueEmail, signupAndLogin, createProduct } from "./helpers";

test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    await signupAndLogin(page, uniqueEmail());
  });

  test("settings page loads with default threshold of 5", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(page.getByLabel("Default Low Stock Threshold")).toHaveValue("5");
  });

  test("saving a new threshold persists after reload", async ({ page }) => {
    await page.goto("/settings");
    await page.getByLabel("Default Low Stock Threshold").fill("10");
    await page.getByRole("button", { name: "Save settings" }).click();

    await expect(page.getByText("Settings saved")).toBeVisible();

    await page.reload();
    await expect(page.getByLabel("Default Low Stock Threshold")).toHaveValue("10");
  });

  test("global threshold is used for products without a threshold", async ({ page }) => {
    await page.goto("/settings");
    await page.getByLabel("Default Low Stock Threshold").fill("20");
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.getByText("Settings saved")).toBeVisible();

    // qty 15 with no per-product threshold — low against global of 20
    await createProduct(page, { name: "Global Threshold Item", sku: "GLB-001", quantity: 15 });

    await page.goto("/dashboard");
    await expect(page.getByText("Global Threshold Item")).toBeVisible();
  });
});
