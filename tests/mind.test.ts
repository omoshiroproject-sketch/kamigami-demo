import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { openDB } from "idb";
import { initialState } from "../src/data/seed";
import { shrines } from "../src/data/master";
import { createRepository } from "../src/services/storage";
import {
  collectedPlaces,
  journeyProgress,
  milestoneProgress,
  gratitudeSeries,
  orderedEntries,
  saveMindEntry,
  validateMindEntry,
} from "../src/services/mind";
import type { MindEntry, PhotoRecord } from "../src/types";

const entry = (extra: Partial<MindEntry> = {}): MindEntry => ({
  id: "mind-1",
  shrineId: "ise-jingu",
  date: "2026-09-15",
  gratitude: 4,
  gratitudeText: " 支えてくれる人に感謝 ",
  pledge: " 感謝を伝えます ",
  nextStep: " 一言を届ける ",
  insight: "",
  pledgeStatus: "育てている",
  reflection: "",
  createdAt: "2026-09-15T01:00:00Z",
  updatedAt: "2026-09-15T01:00:00Z",
  ...extra,
});
const photo = (shrineId: string, id = shrineId): PhotoRecord => ({
  id,
  shrineId,
  date: "",
  note: "",
  hash: id,
  sample: true,
  createdAt: "2026-09-15T00:00:00Z",
});

describe("異なる寺社で数えるロードマップ", () => {
  it("同じ寺社の写真、参拝、心の記録で水増しせず、写真の訂正・削除で再計算する", () => {
    const state = initialState();
    state.photos = shrines.slice(0, 10).map((s) => photo(s.id));
    state.photos.push(photo(shrines[0].id, "duplicate"), photo("unknown"));
    state.visits[shrines[11].id] = new Date().toISOString();
    state.mindEntries = [entry({ shrineId: shrines[12].id })];
    expect(collectedPlaces(state.photos)).toBe(10);
    expect(journeyProgress(state.photos).reached.map((m) => m.title)).toEqual([
      "知る",
    ]);
    state.photos[9].shrineId = shrines[0].id;
    expect(journeyProgress(state.photos).count).toBe(9);
    expect(journeyProgress(state.photos).reached).toEqual([]);
    state.photos = state.photos.filter((p) => p.shrineId !== shrines[1].id);
    expect(journeyProgress(state.photos).count).toBe(8);
  });
  it.each([
    [0, 0, 10],
    [9, 0, 10],
    [10, 1, 22],
    [21, 1, 22],
    [22, 2, 33],
    [32, 2, 33],
    [33, 3, 50],
    [49, 3, 50],
    [50, 4, undefined],
    [51, 4, undefined],
  ])("%iか所は%iステージ解放、次は%s", (count, reached, next) => {
    const progress = milestoneProgress(count);
    expect(progress.reached).toHaveLength(reached);
    expect(progress.next?.count).toBe(next);
    expect(progress.percent).toBeLessThanOrEqual(100);
  });
});

describe("心の記録と振り返り", () => {
  it("日別平均を日付順に表示し、空白日を0で埋めない", () => {
    const entries = [
      entry({ date: "2026-09-15", gratitude: 5 }),
      entry({ date: "2026-09-10", gratitude: 2 }),
      entry({ date: "2026-09-15", gratitude: 2 }),
    ];
    expect(gratitudeSeries(entries)).toEqual([
      { date: "2026-09-10", value: 2, count: 1 },
      { date: "2026-09-15", value: 3.5, count: 2 },
    ]);
    expect(gratitudeSeries([])).toEqual([]);
  });
  it("最新14記録日だけを表示し、タイムラインは元データを変更せず降順にする", () => {
    const entries = Array.from({ length: 16 }, (_, i) =>
      entry({
        id: String(i),
        date: `2026-08-${String(i + 1).padStart(2, "0")}`,
      }),
    );
    expect(gratitudeSeries(entries)).toHaveLength(14);
    expect(gratitudeSeries(entries)[0].date).toBe("2026-08-03");
    expect(orderedEntries(entries)[0].date).toBe("2026-08-16");
    expect(entries[0].date).toBe("2026-08-01");
  });
  it("未来・存在しない日付、未記入、範囲外の感謝、存在しない寺社を保存しない", () => {
    for (const date of ["2026-09-18", "2026-02-30", "2025-02-29", "", "bad"])
      expect(() => validateMindEntry(entry({ date }), "2026-09-17")).toThrow(
        "日付",
      );
    expect(() =>
      validateMindEntry(entry({ date: "2024-02-29" }), "2026-09-17"),
    ).not.toThrow();
    for (const gratitude of [0, 6, 2.5, NaN])
      expect(() => validateMindEntry(entry({ gratitude }))).toThrow("1〜5");
    expect(() =>
      validateMindEntry(
        entry({ gratitudeText: " ", pledge: "", insight: "\n" }),
      ),
    ).toThrow("一言");
    expect(() => validateMindEntry(entry({ shrineId: "unknown" }))).toThrow(
      "寺社",
    );
    expect(() =>
      validateMindEntry(entry({ gratitudeText: "あ".repeat(1001) })),
    ).toThrow("1,000文字");
  });
  it("保存の再試行を重複させず、編集と誓いの取り消しを反映する", () => {
    const state = initialState();
    saveMindEntry(state, entry());
    saveMindEntry(state, entry());
    expect(state.mindEntries).toHaveLength(1);
    expect(state.mindEntries[0].pledge).toBe("感謝を伝えます");
    saveMindEntry(
      state,
      entry({ pledgeStatus: "実践できた", reflection: "伝えられた" }),
      true,
    );
    expect(state.mindEntries[0].reflection).toBe("伝えられた");
    saveMindEntry(
      state,
      entry({
        pledge: " ",
        pledgeStatus: "実践できた",
        reflection: "古い振り返り",
      }),
      true,
    );
    expect(state.mindEntries[0].pledgeStatus).toBe("育てている");
    expect(state.mindEntries[0].reflection).toBe("");
    state.mindEntries = [];
    expect(() => saveMindEntry(state, entry(), true)).toThrow("別の画面で削除");
  });
});

describe("既存データとの共存と永続化", () => {
  it("旧データを移行しても写真Blob・メモ・ポイントを保持する", async () => {
    const name = crypto.randomUUID();
    const legacy = initialState();
    const { mindEntries: _, manifesto: __, ...old } = legacy;
    old.photos = [photo("ise")];
    old.notes.amaterasu = "以前のノート";
    const conn = await openDB(name, 1, {
      upgrade(db) {
        db.createObjectStore("state");
        db.createObjectStore("media");
      },
    });
    await conn.put("state", old, "main");
    await conn.put(
      "media",
      { original: new Blob(["original"]), thumbnail: new Blob(["thumb"]) },
      "ise",
    );
    const repo = createRepository(name);
    const migrated = await repo.read();
    expect(migrated.mindEntries).toEqual([]);
    expect(migrated.manifesto.declaration).toBe("");
    expect(migrated.photos).toEqual(old.photos);
    expect(migrated.notes).toEqual(old.notes);
    expect(migrated.ledger).toEqual(old.ledger);
    expect((await repo.media("ise"))?.original.size).toBe(8);
    expect((await conn.get("state", "main")).mindEntries).toEqual([]);
    conn.close();
  });
  it("再接続後も誓いと宣言を保持し、削除と全リセットを反映する", async () => {
    const name = crypto.randomUUID();
    const repo = createRepository(name);
    await repo.update((s) => {
      saveMindEntry(s, entry());
      s.manifesto = {
        values: "誠実",
        contribution: "地域への感謝",
        declaration: "身近な人を支える",
        updatedAt: new Date().toISOString(),
      };
    });
    const other = createRepository(name);
    expect((await other.read()).mindEntries[0].pledge).toBe("感謝を伝えます");
    expect((await other.read()).manifesto.declaration).toBe("身近な人を支える");
    await repo.update((s) => {
      s.mindEntries = [];
    });
    expect((await other.read()).mindEntries).toEqual([]);
    await repo.reset();
    expect((await other.read()).manifesto.declaration).toBe("");
  });
  it("心の記録の保存エラーでは既存状態を部分更新しない", async () => {
    const repo = createRepository(crypto.randomUUID());
    const before = await repo.read();
    await expect(
      repo.update((s) => {
        saveMindEntry(s, entry());
        throw Error("write failure");
      }),
    ).rejects.toThrow("write failure");
    expect(await repo.read()).toEqual(before);
  });
});
