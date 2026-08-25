import { expect, test, type Page } from "@playwright/test";

declare global {
  interface Window {
    MomoCard?: { mount: (target: string | Element, options: { cardId: string }) => { destroy: () => void } };
  }
}

function collectBrowserErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("AC-01: sample page mounts demo-food", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto("/sample.html");

  await expect(page.getByRole("heading", { name: "從既有頁面載入商品卡" })).toBeVisible();
  await expect(page.locator("pre")).toContainText('MomoCard.mount("#imperative-demo", { cardId: "demo-food" })');
  const iframe = page.locator("#imperative-demo iframe");
  await expect(iframe).toHaveAttribute("data-momo-card", "demo-food");
  await expect(iframe).toHaveAttribute("title", "Momo 商品卡：demo-food");
  await expect(iframe).toHaveAttribute("loading", "lazy");
  await expect(iframe.contentFrame().getByTestId("product-card")).toBeVisible();
  expect(errors).toEqual([]);
});

test("AC-02: showroom save survives sample reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "商品名稱" }).fill("Sample 儲存商品");
  await page.getByRole("button", { name: "儲存商品卡" }).click();
  await expect(page.getByRole("status")).toHaveText("已儲存商品卡設定");

  await page.goto("/sample.html");
  await expect(page.locator("#imperative-demo iframe").contentFrame().getByRole("heading", { name: "Sample 儲存商品" })).toBeVisible();
});

test("AC-03: loader derives script origin and destroy removes iframe", async ({ page }) => {
  await page.goto("/sample.html");
  const iframe = page.locator("#imperative-demo iframe");
  expect(new URL(await iframe.getAttribute("src") ?? "").pathname).toBe("/embed/demo-food");

  await page.evaluate(() => {
    const target = document.querySelector("#imperative-demo");
    if (!target || !window.MomoCard) throw new Error("MomoCard loader unavailable");
    const handle = window.MomoCard.mount(target, { cardId: "demo-food" });
    handle.destroy();
  });
  await expect(page.locator("#imperative-demo iframe")).toHaveCount(0);
});

test("AC-04: unknown card shows explicit error", async ({ page }) => {
  await page.goto("/embed/not-real");
  await expect(page.getByRole("alert")).toHaveText("找不到商品：not-real");
  await expect(page.getByTestId("product-card")).toHaveCount(0);
});

test("AC-05: sample is keyboard usable at 390px", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sample.html");
  await page.keyboard.press("Tab");
  await expect(page.locator("#imperative-demo iframe")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
