import { expect, test } from "@playwright/test";

test("首頁可正常渲染主要內容，且沒有瀏覽器錯誤", async ({ page }) => {
  const browserErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      browserErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));

  await page.goto("/");

  await expect(page).toHaveTitle("Create Next App");
  await expect(
    page.getByRole("heading", {
      name: /To get started, edit the page\.tsx file\./,
    }),
  ).toBeVisible();
  await expect(page.getByAltText("Next.js logo")).toBeVisible();
  await expect(page.getByRole("link", { name: "Deploy Now" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Documentation" })).toBeVisible();

  expect(browserErrors).toEqual([]);
});
