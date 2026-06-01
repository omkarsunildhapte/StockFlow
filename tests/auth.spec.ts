import { test, expect } from "@playwright/test";
import { uniqueEmail, signupAndLogin, login } from "./helpers";

test.describe("Auth", () => {
  test("redirects unauthenticated users to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/products");
    await expect(page).toHaveURL(/\/login/);
  });

  test("signup creates account and lands on dashboard", async ({ page }) => {
    const email = uniqueEmail();
    await page.goto("/signup");

    await page.getByLabel("Organization name").fill("My Store");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm password").fill("password123");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("signup shows error for duplicate email", async ({ page }) => {
    const email = uniqueEmail();
    await signupAndLogin(page, email);

    // Clear auth cookie so middleware lets us back onto /signup
    await page.context().clearCookies();

    await page.goto("/signup");
    await page.getByLabel("Organization name").fill("Other Org");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm password").fill("password123");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Email already in use")).toBeVisible();
  });

  test("signup shows error when passwords do not match", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Organization name").fill("My Store");
    await page.getByLabel("Email").fill(uniqueEmail());
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm password").fill("differentpass");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });

  test("login with valid credentials navigates to dashboard", async ({ page }) => {
    const email = uniqueEmail();
    await signupAndLogin(page, email);

    await page.context().clearCookies();
    await login(page, email);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("login with wrong password shows error", async ({ page }) => {
    const email = uniqueEmail();
    await signupAndLogin(page, email);

    await page.context().clearCookies();
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Invalid credentials")).toBeVisible();
  });

  test("logout clears session and redirects to login", async ({ page }) => {
    const email = uniqueEmail();
    await signupAndLogin(page, email);

    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("signup page links to login", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page links to signup", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Sign up" }).click();
    await expect(page).toHaveURL(/\/signup/);
  });
});
