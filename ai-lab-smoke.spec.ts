import { expect, type Page, test } from "@playwright/test";

async function canvasStats(page: Page) {
  return page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return { hasCanvas: false, width: 0, height: 0, lit: 0, total: 0 };
    const copy = document.createElement("canvas");
    copy.width = canvas.width;
    copy.height = canvas.height;
    const context = copy.getContext("2d");
    if (!context) return { hasCanvas: true, width: canvas.width, height: canvas.height, lit: 0, total: 0 };
    context.drawImage(canvas, 0, 0);
    const image = context.getImageData(0, 0, copy.width, copy.height).data;
    let lit = 0;
    let total = 0;
    const step = Math.max(4, Math.floor(copy.width / 120));
    for (let y = 0; y < copy.height; y += step) {
      for (let x = 0; x < copy.width; x += step) {
        const index = (y * copy.width + x) * 4;
        total += 1;
        if (image[index] + image[index + 1] + image[index + 2] > 35) lit += 1;
      }
    }
    return { hasCanvas: true, width: canvas.width, height: canvas.height, lit, total };
  });
}

test("desktop game renders canvas and role modal", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await expect(page.getByText("가짜 연구원").first()).toBeVisible();
  const stats = await canvasStats(page);
  expect(stats.hasCanvas).toBe(true);
  expect(stats.width).toBeGreaterThan(800);
  expect(stats.lit).toBeGreaterThan(stats.total * 0.08);
  await page.getByRole("button", { name: "로컬 시작" }).click();
  await expect(page.getByText("YOUR ROLE")).toBeVisible();
});

test("mobile game keeps canvas and chat visible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const stats = await canvasStats(page);
  expect(stats.hasCanvas).toBe(true);
  expect(stats.width).toBeGreaterThan(300);
  expect(stats.lit).toBeGreaterThan(stats.total * 0.08);
  await expect(page.getByPlaceholder("가짜를 맞추기 위한 채팅...")).toBeVisible();
});
