import { test, expect, type Page } from "@playwright/test";
const open = async (page: Page, path: string) => {
  await page.goto(path);
  await expect(page.locator(".site-header")).toBeVisible();
};
const sample = async (page: Page, n = 1) => {
  await page
    .locator(".sample-options button")
    .nth(n - 1)
    .click();
  await expect(page.locator(".photo-preview img")).toBeVisible();
};
const point = async (page: Page, n: number) =>
  expect(page.locator(".point-link strong")).toHaveText(String(n));
test("検索→祭神→写真→図鑑→ミッション→交換と再読込", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await open(page, "/missions");
  await page
    .getByRole("button", { name: "ミッションに参加", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "ミッションに参加", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "ミッションに参加", exact: true })
    .first()
    .click();
  await page.getByRole("link", { name: "探す", exact: true }).click();
  await page.getByLabel("寺社名・読み方・地域で検索").fill("イセ");
  await expect(page.locator(".shrine-card")).toHaveCount(1);
  await page.locator(".shrine-card").click();
  await expect(
    page.getByRole("heading", { name: "伊勢神社", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "お気に入りに追加", exact: true })
    .click();
  await page
    .getByRole("button", { name: "デモ参拝を記録", exact: true })
    .click();
  await page.getByRole("link", { name: /天照皇大神 あまてらす/ }).click();
  await page.getByRole("button", { name: "学習を記録", exact: true }).click();
  await page
    .getByLabel("気づいたこと、覚えておきたいこと")
    .fill("食の神様とのつながりを知った。");
  await page.getByRole("button", { name: "ノートを保存", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("ノートを保存しました");
  await page.reload();
  await expect(page.getByLabel("気づいたこと、覚えておきたいこと")).toHaveValue(
    "食の神様とのつながりを知った。",
  );
  await page.getByRole("link", { name: "豊受大神", exact: true }).click();
  await expect(page.getByLabel("気づいたこと、覚えておきたいこと")).toHaveValue(
    "",
  );
  await open(page, "/photos/new");
  await sample(page);
  await expect(page.getByLabel("保存先の寺社", { exact: true })).toHaveValue(
    "ise",
  );
  await page.getByRole("button", { name: "御朱印を保存", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "伊勢神社", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("授与日不明", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator(".original-photo img")).toBeVisible();
  await page.getByRole("link", { name: "図鑑への反映を見る" }).click();
  await expect(page.locator(".collection-item.collected")).toHaveCount(1);
  await open(page, "/missions");
  await page
    .getByRole("button", { name: "達成してポイントを受け取る" })
    .first()
    .click();
  await page
    .getByRole("button", { name: "達成してポイントを受け取る" })
    .first()
    .click();
  await page
    .getByRole("button", { name: "達成してポイントを受け取る" })
    .first()
    .click();
  await point(page, 500);
  await open(page, "/rewards");
  await page
    .locator(".reward-card")
    .filter({ hasText: "朝の杜を歩く" })
    .getByRole("button", { name: "交換内容を確認" })
    .click();
  await page.getByRole("button", { name: "デモ交換を確定" }).click();
  await point(page, 250);
  await expect(page.locator(".exchange-history")).toHaveCount(1);
  await page.getByRole("button", { name: "キャンセルして返還" }).click();
  await point(page, 500);
  await page.reload();
  await point(page, 500);
  await expect(page.getByText("キャンセル済み・返還済み")).toBeVisible();
  await open(page, "/profile");
  await expect(page.locator(".shrine-card")).toHaveCount(1);
  expect(errors).toEqual([]);
});
test("写真の重複確認・訂正・削除と年月別集計", async ({ page }) => {
  await open(page, "/photos/new");
  await sample(page);
  await page.getByRole("button", { name: "御朱印を保存", exact: true }).click();
  await expect(page.locator(".original-photo img")).toBeVisible();
  await open(page, "/photos/new");
  await sample(page);
  await expect(page.getByLabel(/同じ写真が登録済み/)).toBeVisible();
  await page.getByRole("button", { name: "御朱印を保存", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("同じ写真");
  await page.getByLabel(/同じ写真が登録済み/).check();
  await page.getByRole("button", { name: "御朱印を保存", exact: true }).click();
  await expect(page.locator(".original-photo img")).toBeVisible();
  await page.getByRole("link", { name: "寺社・日付・写真を修正" }).click();
  await page
    .getByLabel("保存先の寺社", { exact: true })
    .selectOption("ryozenji");
  await page.getByLabel("授与日", { exact: false }).fill("2021-05-20");
  await page.getByRole("button", { name: "変更を保存", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "霊山寺", exact: true }),
  ).toBeVisible();
  await open(page, "/book?mode=collection");
  await expect(page.locator(".collection-item.collected")).toHaveCount(2);
  await open(page, "/book?mode=month");
  await expect(
    page.getByRole("heading", { name: "2021-05", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "授与日不明", exact: true }),
  ).toBeVisible();
  await page.locator(".photo-card").filter({ hasText: "霊山寺" }).click();
  await page.getByRole("button", { name: "この記録を削除" }).click();
  await page.getByRole("button", { name: "削除する", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "わたしの御朱印帳" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "図鑑", exact: true }).click();
  await expect(page.locator(".collection-item.collected")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".collection-item.collected")).toHaveCount(1);
});
test("四種類の住所照合・変更・削除は再読込後も整合する", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await open(page, "/addresses");
  await page
    .getByLabel("現住所のテスト例", { exact: true })
    .selectOption("bancho1");
  await expect(
    page.getByText("公式資料との一致", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("出生地のテスト例", { exact: true })
    .selectOption("multiple");
  await expect(page.getByText("複数候補", { exact: true })).toBeVisible();
  await page
    .getByLabel("現住所のテスト例", { exact: true })
    .selectOption("partial");
  await expect(page.getByText("詳細確認が必要", { exact: true })).toBeVisible();
  await page
    .getByLabel("現住所のテスト例", { exact: true })
    .selectOption("unknown");
  await expect(page.getByText("未整備", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "現住所のテスト例を削除" }).click();
  await expect(
    page.getByLabel("現住所のテスト例", { exact: true }),
  ).toHaveValue("");
  await page.reload();
  await expect(
    page.getByLabel("現住所のテスト例", { exact: true }),
  ).toHaveValue("");
  await expect(
    page.getByLabel("出生地のテスト例", { exact: true }),
  ).toHaveValue("multiple");
  expect(requests.some((r) => /bancho|multiple|番町/.test(r))).toBe(false);
});
test("運営で作成・下書き・公開・終了、イベント申込と参加券・満席", async ({
  page,
}) => {
  await open(page, "/admin");
  await page.getByRole("button", { name: "デモ運営を開始" }).click();
  await page.getByRole("button", { name: "イベント", exact: true }).click();
  await page.getByLabel("名称", { exact: true }).fill("試験用の散歩会");
  await page
    .getByLabel("説明・参加条件")
    .fill("この端末だけの催し。デモ会場、参加費無料。");
  await page.getByRole("button", { name: "このブラウザに保存" }).click();
  await expect(
    page.locator(".admin-item").filter({ hasText: "試験用の散歩会" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "利用者画面で確認" }).click();
  await expect(
    page.getByRole("heading", { name: "試験用の散歩会" }),
  ).toHaveCount(0);
  await open(page, "/admin");
  await page.getByRole("button", { name: "デモ運営を開始" }).click();
  await page.getByRole("button", { name: "イベント", exact: true }).click();
  await page.getByLabel("試験用の散歩会の状態").selectOption("公開");
  await expect(page.getByRole("status")).toContainText(
    "公開状態を更新しました",
  );
  await page.reload();
  await page.getByRole("button", { name: "デモ運営を開始" }).click();
  await page.getByRole("button", { name: "イベント", exact: true }).click();
  await expect(page.getByLabel("試験用の散歩会の状態")).toHaveValue("公開");
  await page.getByRole("link", { name: "利用者画面で確認" }).click();
  await page
    .locator(".event-card")
    .filter({ hasText: "試験用の散歩会" })
    .click();
  await page.getByRole("button", { name: "1名でデモ申込" }).click();
  await page.getByRole("link", { name: "申込済み・参加券を見る" }).click();
  await expect(page.locator(".ticket")).toHaveCount(1);
  await page.getByRole("button", { name: "申込をキャンセル" }).click();
  await expect(page.getByText("キャンセル済み", { exact: true })).toBeVisible();
  await open(page, "/events/event-full");
  await expect(page.getByRole("button", { name: "満席です" })).toBeDisabled();
  await open(page, "/admin");
  await page.getByRole("button", { name: "デモ運営を開始" }).click();
  await page.getByRole("button", { name: "イベント", exact: true }).click();
  await page.getByLabel("試験用の散歩会の状態").selectOption("終了");
  await expect(page.getByRole("status")).toContainText(
    "公開状態を更新しました",
  );
  await open(page, "/events");
  await expect(
    page.locator(".event-card").filter({ hasText: "試験用の散歩会" }),
  ).toContainText("終了");
});
test("投稿とコメントの保存・削除・非表示", async ({ page }) => {
  await open(page, "/community");
  await page
    .getByLabel("今日のひとこと")
    .fill("デモで最初の一頁を保存しました。");
  await page.getByRole("button", { name: "端末内に投稿を保存" }).click();
  const post = page
    .locator(".posts>article")
    .filter({ hasText: "デモで最初の一頁を保存しました。" });
  await post.getByPlaceholder("コメントを残す").fill("あとで見返そう。");
  await post.getByRole("button", { name: "保存", exact: true }).click();
  await expect(post).toContainText("あとで見返そう。");
  await page.reload();
  await expect(post).toContainText("あとで見返そう。");
  await post.getByRole("button", { name: "コメントを削除" }).click();
  await expect(post.locator(".comments>div")).toHaveCount(0);
  await post.getByRole("button", { name: "非表示にする" }).click();
  await expect(post).toHaveCount(0);
  await page.getByLabel("非表示にした投稿も表示").check();
  await expect(post).toBeVisible();
  await post.getByRole("button", { name: "投稿を削除" }).click();
  await expect(post).toHaveCount(0);
});
test("手動PNG登録・非対応形式と破損画像・入力維持", async ({ page }) => {
  await open(page, "/photos/new");
  await page.getByLabel("ひとことメモ").fill("失敗しても残る入力");
  await page.getByLabel("写真を選ぶ", { exact: true }).setInputFiles({
    name: "sample.heic",
    mimeType: "image/heic",
    buffer: Buffer.from("invalid"),
  });
  await expect(page.getByRole("alert")).toContainText("JPEG");
  await expect(page.getByLabel("ひとことメモ")).toHaveValue(
    "失敗しても残る入力",
  );
  await page.getByLabel("写真を選ぶ", { exact: true }).setInputFiles({
    name: "broken.png",
    mimeType: "image/png",
    buffer: Buffer.from("invalid"),
  });
  await expect(page.getByRole("alert")).toContainText("読み込めません");
  await page
    .getByLabel("写真を選ぶ", { exact: true })
    .setInputFiles("public/icon-192.png");
  await expect(page.locator(".photo-preview img")).toBeVisible();
  await expect(page.getByLabel("保存先の寺社", { exact: true })).toHaveValue(
    "",
  );
  await page.getByLabel("保存先の寺社", { exact: true }).selectOption("ise");
  await page.getByRole("button", { name: "御朱印を保存", exact: true }).click();
  await expect(page.locator(".original-photo img")).toBeVisible();
  await expect(
    page.getByText("失敗しても残る入力", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator(".original-photo img")).toBeVisible();
});
test("位置拒否・地図通信失敗・ピンから詳細・検索条件とスクロール復元", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (_: unknown, f: (e: unknown) => void) =>
          f({ code: 1, message: "denied" }),
      },
    });
  });
  await page.route("https://tile.openstreetmap.org/**", (r) => r.abort());
  await open(page, "/search");
  await page.getByRole("button", { name: "現在地", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "現在地を取得できません",
  );
  await page.getByRole("button", { name: "地図", exact: true }).click();
  await expect(page.getByText(/地図画像を読み込めません/)).toBeVisible();
  await expect(page.locator(".shrine-card")).toHaveCount(24);
  await page.locator('.leaflet-marker-icon[title="伊勢神社"]').press("Enter");
  await page.getByRole("button", { name: "詳細を見る", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "伊勢神社", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Googleマップで経路案内/ }),
  ).toHaveAttribute("href", /destination=.*%/);
  await page.getByRole("button", { name: "戻る", exact: true }).click();
  await expect(page).toHaveURL(/mode=map/);
  await page.getByRole("button", { name: "一覧", exact: true }).click();
  await page.getByLabel("地域", { exact: true }).selectOption("岡山県");
  await page.locator(".shrine-card").last().scrollIntoViewIfNeeded();
  const scroll = await page.evaluate(() => scrollY);
  await page.locator(".shrine-card").last().click();
  await page.getByRole("button", { name: "戻る", exact: true }).click();
  await expect(page.getByLabel("地域", { exact: true })).toHaveValue("岡山県");
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeGreaterThan(scroll - 100);
});
test("容量不足でも未保存写真・寺社・メモを保持し、再試行できる", async ({
  page,
}) => {
  await open(page, "/photos/new");
  await sample(page);
  await page.getByLabel("ひとことメモ").fill("容量不足でも消えない");
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    let fail = true;
    IDBObjectStore.prototype.put = function (
      ...args: Parameters<IDBObjectStore["put"]>
    ) {
      if (this.name === "media" && fail) {
        fail = false;
        throw new DOMException("quota", "QuotaExceededError");
      }
      return original.apply(this, args);
    };
  });
  await page.getByRole("button", { name: "御朱印を保存", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("保存容量が不足");
  await expect(page.getByLabel("ひとことメモ")).toHaveValue(
    "容量不足でも消えない",
  );
  await expect(page.locator(".photo-preview img")).toBeVisible();
  await page.getByRole("button", { name: "御朱印を保存", exact: true }).click();
  await expect(page.locator(".original-photo img")).toBeVisible();
  await open(page, "/book");
  await expect(page.locator(".photo-card")).toHaveCount(1);
});
test("全データリセットは確認を要求し写真も初期化する", async ({ page }) => {
  await open(page, "/photos/new");
  await sample(page);
  await page.getByRole("button", { name: "御朱印を保存", exact: true }).click();
  await expect(page.locator(".original-photo img")).toBeVisible();
  await open(page, "/profile");
  await page.getByRole("button", { name: "全デモデータをリセット" }).click();
  await expect(
    page.getByRole("button", { name: "すべて削除して初期化" }),
  ).toBeDisabled();
  await page.getByLabel("写真も削除されることを確認しました").check();
  await page.getByRole("button", { name: "すべて削除して初期化" }).click();
  await point(page, 300);
  await open(page, "/book");
  await expect(page.locator(".photo-card")).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("まだ白紙の、あなたの一冊。")).toBeVisible();
});
for (const width of [375, 390, 768, 1440])
  test(`${width}pxで全画面に横はみ出しがなく詳細URLを再読込できる`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/search",
      "/book?mode=collection",
      "/photos/new",
      "/missions",
      "/rewards",
      "/events",
      "/events/event-walk",
      "/tickets",
      "/points",
      "/profile",
      "/addresses",
      "/gods",
      "/gods/amaterasu",
      "/shrines/ise",
      "/shrines/ryozenji",
      "/community",
      "/admin",
    ]) {
      await open(page, path);
      await expect(page.locator("h1")).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      expect(overflow, path).toBe(false);
      if (path === "/")
        await page.screenshot({
          path: `docs/screenshots/home-${width}.png`,
          fullPage: true,
        });
      if (path === "/photos/new" && width === 390)
        await page.screenshot({
          path: "docs/screenshots/photo-add-390.png",
          fullPage: true,
        });
    }
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "運営体験モード" }),
    ).toBeVisible();
  });
