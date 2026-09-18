import { test, expect, type Page } from "@playwright/test";
import { shrines } from "../../src/data/master";

const open = async (page: Page, path: string) => {
  await page.goto(path);
  await expect(page.locator(".site-header")).toBeVisible();
};

test("寺社から誓い・感謝を記録し、再読み込み・振り返り・絞り込み・削除できる", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await open(page, "/shrines/ise-jingu");
  await page.getByRole("link", { name: "この場所の誓い・感謝を残す" }).click();
  await expect(page.getByLabel("記録する場所", { exact: true })).toHaveValue(
    "ise-jingu",
  );
  await page.getByLabel("記録日", { exact: true }).fill("2026-09-15");
  await page.getByRole("radio", { name: "4 深く感じる", exact: true }).check();
  await page
    .getByLabel("感謝したこと", { exact: true })
    .fill("穏やかに参拝できたこと");
  await page
    .getByLabel("わたしの誓い（宣言）", { exact: true })
    .fill("支えてくれる人に感謝を伝える");
  await page
    .getByLabel("日常で踏み出す、小さな一歩")
    .fill("今日、ありがとうと言う");
  await page
    .getByRole("button", { name: "心の記録を保存", exact: true })
    .click();
  await expect(page.locator(".mind-entry")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".mind-entry")).toContainText("感謝の実感 4 / 5");
  await expect(page.locator(".mind-entry")).toContainText("伊勢神宮 内宮");
  await page.getByRole("link", { name: "誓いを振り返る・記録を編集" }).click();
  await page.getByLabel("誓いの現在地").selectOption("実践できた");
  await page.getByLabel("実践して感じたこと").fill("言葉にできてうれしかった");
  await page
    .getByRole("button", { name: "心の記録を保存", exact: true })
    .click();
  await expect(page.locator(".mind-entry")).toContainText(
    "言葉にできてうれしかった",
  );
  await expect(page.locator(".mind-stats")).toContainText("1実践できた誓い");
  await page.getByRole("link", { name: "心の記録を書く", exact: true }).click();
  await page.getByLabel("記録日", { exact: true }).fill("2026-09-15");
  await page.getByRole("radio", { name: "2 少し感じる", exact: true }).check();
  await page
    .getByLabel("感謝したこと", { exact: true })
    .fill("日常の小さな親切");
  await page
    .getByRole("button", { name: "心の記録を保存", exact: true })
    .click();
  await expect(page.locator(".mind-entry")).toHaveCount(2);
  await page.getByText("日別の値を読む", { exact: true }).click();
  await expect(page.locator(".chart-data tbody tr")).toHaveCount(1);
  await expect(page.locator(".chart-data tbody tr")).toContainText("3 / 5");
  await expect(page.locator(".chart-data tbody tr")).toContainText("2件");
  await page.getByRole("button", { name: "日常の感謝", exact: true }).click();
  await expect(page.locator(".mind-entry")).toHaveCount(1);
  await expect(page.locator(".mind-entry")).toContainText("日常の小さな親切");
  await page
    .getByRole("button", { name: "誓いのある記録", exact: true })
    .click();
  await expect(page.locator(".mind-entry")).toHaveCount(1);
  await page.getByRole("link", { name: "誓いを振り返る・記録を編集" }).click();
  await page
    .getByRole("button", { name: "この心の記録を削除", exact: true })
    .click();
  await expect(
    page.getByRole("group", { name: "心の記録の削除確認" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "やめる", exact: true }).click();
  await expect(
    page.getByLabel("わたしの誓い（宣言）", { exact: true }),
  ).toHaveValue("支えてくれる人に感謝を伝える");
  await page
    .getByRole("button", { name: "この心の記録を削除", exact: true })
    .click();
  await page.getByRole("button", { name: "削除を確定", exact: true }).click();
  await expect(page.locator(".mind-entry")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".mind-entry")).toContainText("日常の小さな親切");
  await open(page, "/roadmap");
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "0",
  );
  expect(errors).toEqual([]);
});

test("空欄と容量不足の案内、入力保持と保存の再試行", async ({ page }) => {
  await open(page, "/mind/new");
  await page
    .getByRole("button", { name: "心の記録を保存", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("どれかを、一言");
  await page
    .getByLabel("感謝したこと", { exact: true })
    .fill("保存に失敗しても残る感謝");
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    let fail = true;
    IDBObjectStore.prototype.put = function (
      ...args: Parameters<IDBObjectStore["put"]>
    ) {
      if (this.name === "state" && fail) {
        fail = false;
        throw new DOMException("quota", "QuotaExceededError");
      }
      return original.apply(this, args);
    };
  });
  await page
    .getByRole("button", { name: "心の記録を保存", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("保存容量が不足");
  await expect(page.getByLabel("感謝したこと", { exact: true })).toHaveValue(
    "保存に失敗しても残る感謝",
  );
  await page
    .getByRole("button", { name: "心の記録を保存", exact: true })
    .click();
  await expect(page.locator(".mind-entry")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".mind-entry")).toHaveCount(1);
});

// Test-only fixture writes are isolated to Playwright's disposable browser profile.
async function setPhotos(page: Page, ids: string[]) {
  await page.evaluate(async (ids) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("kamigami-demo-v1", 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("state", "readwrite");
        const store = tx.objectStore("state");
        const read = store.get("main");
        read.onsuccess = () => {
          const state = read.result;
          state.photos = ids.map((shrineId, i) => ({
            id: `fixture-${i}`,
            shrineId,
            date: "",
            note: "",
            sample: true,
            hash: `fixture-${i}`,
            createdAt: new Date().toISOString(),
          }));
          store.put(state, "main");
        };
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onabort = () => reject(tx.error);
      };
    });
  }, ids);
  await page.reload();
}

test("同じ寺社を一度だけ数えて10か所で解放し、削除で再計算する。33・50はプレビュー", async ({
  page,
}) => {
  await open(page, "/roadmap");
  const nine = shrines.slice(0, 9).map((s) => s.id);
  await setPhotos(page, [...nine, nine[0], nine[0]]);
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "9",
  );
  await expect(page.locator(".milestone-content-heading .tag")).toHaveText(
    "解放前のプレビュー",
  );
  await setPhotos(page, [...nine, shrines[9].id, nine[0]]);
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "10",
  );
  await expect(page.locator(".milestone-content-heading .tag")).toHaveText(
    "解放済み",
  );
  await setPhotos(page, nine);
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "9",
  );
  await expect(page.locator(".milestone-content-heading .tag")).toHaveText(
    "解放前のプレビュー",
  );
  await page.locator(".milestone").filter({ hasText: "33か所" }).click();
  await expect(page.locator(".milestone-content-heading .tag")).toHaveText(
    "解放前のプレビュー",
  );
  await page.locator(".milestone").filter({ hasText: "50か所" }).click();
  await page.getByLabel("私が大切にしたい価値観").fill("誠実さと感謝");
  await page.getByLabel("周囲や社会に届けたいこと").fill("身近な人の力になる");
  await page
    .getByLabel("これからの宣言", { exact: true })
    .fill("今日できる小さな貢献を続けます");
  await page
    .getByRole("button", { name: "これからの宣言を保存", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "これからの宣言を保存しました",
  );
  await page.reload();
  await page.locator(".milestone").filter({ hasText: "50か所" }).click();
  await expect(page.getByLabel("これからの宣言", { exact: true })).toHaveValue(
    "今日できる小さな貢献を続けます",
  );
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "9",
  );
  await expect(page.locator(".point-link strong")).toHaveText("300");
});

test("320pxでも感謝の入力と全ステージを操作できる", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const path of ["/", "/mind", "/mind/new", "/roadmap"]) {
    await open(page, path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      path,
    ).toBe(false);
  }
  for (const threshold of [10, 22, 33, 50]) {
    await page
      .locator(".milestone")
      .filter({ hasText: `${threshold}か所` })
      .click();
    await expect(page.locator(".milestone-content")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      String(threshold),
    ).toBe(false);
  }
});
