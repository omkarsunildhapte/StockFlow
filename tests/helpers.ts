import { Page } from "@playwright/test";

export function uniqueEmail() {
  return `test_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;
}

export async function signupAndLogin(page: Page, email: string, password = "password123") {
  await page.goto("/signup");
  await page.getByLabel("Organization name").fill("Test Org");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("**/dashboard");
}

export async function login(page: Page, email: string, password = "password123") {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard");
}

export async function createProduct(
  page: Page,
  opts: { name: string; sku: string; quantity?: number; threshold?: number }
) {
  await page.goto("/products/new");
  await page.getByLabel("Name").fill(opts.name);
  await page.getByLabel("SKU").fill(opts.sku);
  if (opts.quantity !== undefined) {
    await page.getByLabel("Qty on Hand").fill(String(opts.quantity));
  }
  if (opts.threshold !== undefined) {
    await page.getByLabel(/Low Stock Threshold/).fill(String(opts.threshold));
  }
  await page.getByRole("button", { name: "Create product" }).click();
  await page.waitForURL("**/products");
}
