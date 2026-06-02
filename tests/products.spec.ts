import { test, expect } from "@playwright/test";
import { uniqueEmail, signupAndLogin, createProduct } from "./helpers";

test.describe("Products", () => {
  test.beforeEach(async ({ page }) => {
    await signupAndLogin(page, uniqueEmail());
  });

  test("empty state shows add product prompt", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByText("No products found")).toBeVisible();
    await expect(page.getByRole("link", { name: /Add Product/ }).first()).toBeVisible();
  });

  test("create a product and see it in the list", async ({ page }) => {
    await createProduct(page, { name: "Widget A", sku: "WGT-001", quantity: 10 });

    await expect(page).toHaveURL(/\/products/);
    await expect(page.getByText("Widget A")).toBeVisible();
    await expect(page.getByText("WGT-001")).toBeVisible();
    await expect(page.getByText("10")).toBeVisible();
  });

  test("create product shows error for duplicate SKU", async ({ page }) => {
    await createProduct(page, { name: "Widget A", sku: "WGT-DUP" });

    await page.goto("/products/new");
    await page.getByLabel("Name").fill("Widget B");
    await page.getByLabel("SKU").fill("WGT-DUP");
    await page.getByRole("button", { name: "Create product" }).click();

    await expect(page.getByText("SKU already exists in your organization")).toBeVisible();
  });

  test("create product requires name and SKU", async ({ page }) => {
    await page.goto("/products/new");
    await page.getByRole("button", { name: "Create product" }).click();
    // Browser native validation fires — form stays on page
    await expect(page).toHaveURL(/\/products\/new/);
  });

  test("edit a product updates it in the list", async ({ page }) => {
    await createProduct(page, { name: "Old Name", sku: "EDIT-001", quantity: 5 });

    await page.goto("/products");
    await page.getByRole("link", { name: "Edit" }).first().click();
    await expect(page).toHaveURL(/\/products\/.+\/edit/);

    await page.getByLabel("Name").fill("New Name");
    await page.getByLabel("Qty on Hand").fill("99");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page).toHaveURL(/\/products/);
    await expect(page.getByText("New Name")).toBeVisible();
    await expect(page.getByText("99")).toBeVisible();
  });

  test("delete a product removes it from the list", async ({ page }) => {
    await createProduct(page, { name: "To Delete", sku: "DEL-001" });

    await page.goto("/products");
    await expect(page.getByText("To Delete")).toBeVisible();

    await page.getByRole("button", { name: "Delete" }).first().click();

    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByText("To Delete", { exact: true })).not.toBeVisible();
  });

  test("search filters products by name", async ({ page }) => {
    await createProduct(page, { name: "Apple Juice", sku: "APL-001" });
    await createProduct(page, { name: "Orange Juice", sku: "ORG-001" });

    await page.goto("/products");
    await page.getByPlaceholder("Search by name or SKU…").fill("Apple");

    await expect(page.getByText("Apple Juice")).toBeVisible();
    await expect(page.getByText("Orange Juice")).not.toBeVisible();
  });

  test("search filters products by SKU", async ({ page }) => {
    await createProduct(page, { name: "Product X", sku: "SKU-FIND" });
    await createProduct(page, { name: "Product Y", sku: "SKU-OTHER" });

    await page.goto("/products");
    await page.getByPlaceholder("Search by name or SKU…").fill("SKU-FIND");

    await expect(page.getByText("Product X")).toBeVisible();
    await expect(page.getByText("Product Y")).not.toBeVisible();
  });

  test("low stock badge shows when quantity <= threshold", async ({ page }) => {
    await createProduct(page, { name: "Low Item", sku: "LOW-001", quantity: 3, threshold: 5 });

    await page.goto("/products");
    await expect(page.getByText("Low Stock")).toBeVisible();
  });

  test("ok badge shows when quantity > threshold", async ({ page }) => {
    await createProduct(page, { name: "Full Item", sku: "FULL-001", quantity: 10, threshold: 5 });

    await page.goto("/products");
    await expect(page.getByText("In Stock")).toBeVisible();
  });

  test("cancel on edit form navigates back", async ({ page }) => {
    await createProduct(page, { name: "No Edit", sku: "NO-EDIT" });

    await page.goto("/products");
    await page.getByRole("link", { name: "Edit" }).first().click();
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page).toHaveURL(/\/products/);
  });
});
