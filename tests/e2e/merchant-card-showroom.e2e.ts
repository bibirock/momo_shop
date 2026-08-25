import { expect, test, type Page } from "@playwright/test";

function collectBrowserErrors(page: Page) {
  const errors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));

  return errors;
}

test("AC-01: 顯示 demo-food 預設商品卡", async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);

  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "商品卡 Showroom" }),
  ).toBeVisible();

  const card = page.getByTestId("product-card");
  await expect(card).toBeVisible();
  await expect(
    card.getByRole("img", { name: "日式咖哩調理包商品示意圖" }),
  ).toBeVisible();
  await expect(card.getByText("限時優惠")).toBeVisible();
  await expect(
    card.getByRole("heading", {
      name: "【MOMO精選】日式咖哩調理包 18 入",
    }),
  ).toBeVisible();
  await expect(card.getByText("$999", { exact: true })).toBeVisible();
  await expect(card.getByText("$1,290", { exact: true })).toBeVisible();
  await expect(card.getByText("總銷量>1,000")).toBeVisible();
  await expect(card.getByText("5,208", { exact: true })).toBeVisible();
  await expect(card.getByText("速", { exact: true })).toBeVisible();
  await expect(card.getByText("登記", { exact: true })).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test("AC-02: Editor 欄位完整", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("combobox", { name: "商品圖片" })).toBeVisible();
  for (const label of [
    "圖片替代文字",
    "促銷文案",
    "商品名稱",
    "售價",
    "原價",
    "總銷量",
    "評論數",
    "Accent color",
    "圓角",
  ]) {
    await expect(
      page.getByRole(label === "售價" || label === "原價" || label === "評論數" || label === "圓角" ? "spinbutton" : "textbox", { name: label }),
    ).toBeVisible();
  }

  const badges = page.getByRole("group", { name: "Badges" });
  for (const badge of ["速", "折價券", "登記", "贈品"]) {
    await expect(badges.getByRole("checkbox", { name: badge })).toBeVisible();
  }
});

test("AC-03: 合法設定即時更新預覽", async ({ page }) => {
  await page.goto("/");
  const initialUrl = page.url();
  const card = page.getByTestId("product-card");

  await page.getByRole("combobox", { name: "商品圖片" }).selectOption("health");
  await page.getByRole("textbox", { name: "圖片替代文字" }).fill("保健食品商品圖");
  await page.getByRole("textbox", { name: "促銷文案" }).fill("會員限定");
  await page.getByRole("textbox", { name: "商品名稱" }).fill("高濃度葉黃素膠囊");
  await page.getByRole("spinbutton", { name: "售價" }).fill("888");
  await page.getByRole("spinbutton", { name: "原價" }).fill("1080");
  await page.getByRole("textbox", { name: "總銷量" }).fill("總銷量>2,000");
  await page.getByRole("spinbutton", { name: "評論數" }).fill("6789");
  await page.getByRole("checkbox", { name: "折價券" }).check();
  await page.getByRole("textbox", { name: "Accent color" }).fill("#7A1CAC");
  await page.getByRole("spinbutton", { name: "圓角" }).fill("20");

  await expect(card.getByRole("img", { name: "保健食品商品圖" })).toBeVisible();
  await expect(card.getByText("會員限定")).toBeVisible();
  await expect(card.getByRole("heading", { name: "高濃度葉黃素膠囊" })).toBeVisible();
  await expect(card.getByText("$888", { exact: true })).toBeVisible();
  await expect(card.getByText("$1,080", { exact: true })).toBeVisible();
  await expect(card.getByText("總銷量>2,000")).toBeVisible();
  await expect(card.getByText("6,789", { exact: true })).toBeVisible();
  await expect(card.getByText("折價券", { exact: true })).toBeVisible();
  await expect(card).toHaveCSS("border-radius", "20px");
  await expect(card.getByText("$888", { exact: true })).toHaveCSS("color", "rgb(122, 28, 172)");
  expect(page.url()).toBe(initialUrl);
});

test("AC-03: 非法設定不污染預覽", async ({ page }) => {
  await page.goto("/");
  const card = page.getByTestId("product-card");
  const price = card.getByText("$999", { exact: true });

  await page.getByRole("spinbutton", { name: "售價" }).fill("-1");
  await page.getByRole("spinbutton", { name: "評論數" }).fill("not-a-number");
  await page.getByRole("textbox", { name: "Accent color" }).fill("pink");
  await page.getByRole("spinbutton", { name: "圓角" }).fill("25");

  await expect(price).toBeVisible();
  await expect(card.getByText("5,208", { exact: true })).toBeVisible();
  await expect(card).toHaveCSS("border-radius", "12px");
  await expect(price).toHaveCSS("color", "rgb(215, 31, 105)");
});

test("AC-04: 空值與長文不破版", async ({ page }) => {
  await page.goto("/");
  const card = page.getByTestId("product-card");
  const longTitle = "這是一段非常非常長的商品名稱用來確認兩行截斷且內容永遠不會超出商品卡片寬度";

  await page.getByRole("textbox", { name: "促銷文案" }).fill("");
  await page.getByRole("spinbutton", { name: "原價" }).fill("");
  await page.getByRole("checkbox", { name: "速" }).uncheck();
  await page.getByRole("checkbox", { name: "登記" }).uncheck();
  await page.getByRole("textbox", { name: "商品名稱" }).fill(longTitle);

  await expect(card.getByText("限時優惠")).toHaveCount(0);
  await expect(card.getByText("$1,290", { exact: true })).toHaveCount(0);
  await expect(card.locator(".product-card__badges")).toHaveCount(0);
  await expect(card.getByRole("heading", { name: longTitle })).toHaveCSS("-webkit-line-clamp", "2");
  expect(await card.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
});

test("AC-04: 圖片失敗顯示 fallback", async ({ page }) => {
  await page.route("**/_next/image**", (route) => route.abort());
  await page.goto("/");

  await expect(page.getByText("IMAGE UNAVAILABLE")).toBeVisible();
  await expect(page.getByRole("img", { name: "日式咖哩調理包商品示意圖" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "商品名稱" })).toBeEnabled();
});

test("AC-05: 390px 可操作且無水平溢出", async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const previewBox = await page.getByTestId("preview-panel").boundingBox();
  const editorBox = await page.getByTestId("editor-panel").boundingBox();
  expect(previewBox).not.toBeNull();
  expect(editorBox).not.toBeNull();
  expect(editorBox!.y).toBeGreaterThan(previewBox!.y);

  await page.getByRole("textbox", { name: "商品名稱" }).fill("窄螢幕測試商品");
  await expect(page.getByRole("heading", { name: "窄螢幕測試商品" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(browserErrors).toEqual([]);
});
