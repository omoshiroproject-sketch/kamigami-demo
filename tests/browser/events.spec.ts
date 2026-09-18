import { test, expect, type Page } from "@playwright/test";
const admin = async (page: Page) => {
  await page.goto("/admin");
  await page.getByRole("button", { name: "デモ運営を開始" }).click();
  await page.getByRole("button", { name: "イベント", exact: true }).click();
};

test("コンパクトなホームから写真付き祭典の詳細へ移動できる", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-09-18T12:00:00+09:00"));
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await expect(page.locator(".home-events .event-card")).toHaveCount(1);
    await expect(
      page.getByRole("heading", { name: "わたしの記録", exact: true }),
    ).toHaveCount(0);
    const cards = await page
      .locator(".mind-home-grid > a")
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const r = node.getBoundingClientRect();
          return { y: r.y, x: r.x, height: r.height };
        }),
      );
    expect(cards[0].y).toBe(cards[1].y);
    expect(cards[1].x).toBeGreaterThan(cards[0].x);
    expect(Math.max(...cards.map((c) => c.height))).toBeLessThan(150);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  const card = page.locator(".home-events .event-card");
  await expect
    .poll(() =>
      card.locator("img").evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBeGreaterThan(0);
  await card.click();
  await expect(
    page.getByRole("heading", { name: "建勲神社 船岡大祭", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".event-practical")).toContainText(
    "2026年10月19日(月) 11:00",
  );
  await expect(page.locator(".event-practical")).toContainText(
    "紫野北舟岡町49",
  );
  await expect(page.locator(".event-guide-story")).toContainText("神号");
  await expect(page.locator(".event-demo-note")).toContainText("掲載デモ");
  await expect(page.getByRole("button", { name: "1名でデモ申込" })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("link", { name: "公式案内を確認する" }),
  ).toHaveAttribute("href", "https://kenkun-jinja.org/ritual/");
  await page.reload();
  await expect(page.locator(".event-image-credit")).toContainText(
    "CC BY-SA 3.0",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("イベントの追加・写真・編集・再読込とホーム掲載の切替", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-09-18T12:00:00+09:00"));
  await admin(page);
  await page.getByLabel("名称", { exact: true }).fill("秋の参拝案内");
  await page
    .getByLabel("説明・参加条件", { exact: true })
    .fill("写真と開催場所を見ながら計画するイベントです。");
  await page.getByLabel("会場・場所", { exact: true }).fill("京都の見本会場");
  await page.getByText("トップ写真を設定", { exact: true }).click();
  await page.getByRole("button", { name: "見本写真を使う" }).click();
  await page.getByRole("button", { name: "このブラウザに保存" }).click();
  await expect(page.getByRole("status")).toContainText("下書きとして保存");
  await page.goto("/");
  await expect(page.locator(".home-events")).not.toContainText("秋の参拝案内");
  await admin(page);
  await page.getByLabel("秋の参拝案内の状態").selectOption("公開");
  await expect(page.getByRole("status")).toContainText(
    "公開状態を更新しました",
  );
  await page.goto("/");
  const card = page
    .locator(".home-events .event-card")
    .filter({ hasText: "秋の参拝案内" });
  await expect(card).toContainText("京都の見本会場");
  await expect(card.locator("img")).toHaveAttribute(
    "src",
    "/events/kenkun.jpg",
  );
  await card.click();
  await expect(page.locator(".event-guide-story")).toContainText(
    "計画するイベント",
  );
  await admin(page);
  await page.getByRole("button", { name: "秋の参拝案内を編集" }).click();
  await page.getByLabel("名称", { exact: true }).fill("秋の参拝案内・更新");
  await page.getByLabel("一覧用の短い紹介").fill("更新した紹介文");
  await page.getByRole("button", { name: "変更を保存" }).click();
  await expect(page.getByRole("status")).toContainText(
    "イベント情報を更新しました",
  );
  await page.reload();
  await page.getByRole("button", { name: "デモ運営を開始" }).click();
  await page.getByRole("button", { name: "イベント", exact: true }).click();
  await expect(
    page.locator(".admin-item").filter({ hasText: "秋の参拝案内・更新" }),
  ).toContainText("更新した紹介文");
  await page.getByRole("button", { name: "秋の参拝案内・更新を編集" }).click();
  await page.getByLabel("ホームに掲載", { exact: true }).uncheck();
  await page.getByRole("button", { name: "変更を保存" }).click();
  await expect(page.getByRole("status")).toContainText(
    "イベント情報を更新しました",
  );
  await page.goto("/");
  await expect(page.locator(".home-events")).not.toContainText(
    "秋の参拝案内・更新",
  );
  await page.goto("/events");
  await expect(
    page.locator(".event-card").filter({ hasText: "秋の参拝案内・更新" }),
  ).toBeVisible();
});

test("イベント写真の取得失敗でも案内を読める", async ({ page }) => {
  await page.route("**/events/kenkun.jpg", (route) => route.abort());
  await page.goto("/events/funaoka-2026");
  await expect(page.locator(".event-photo-placeholder")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "開催概要", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "公式案内を確認する" }),
  ).toBeVisible();
});
