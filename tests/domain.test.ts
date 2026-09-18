import { describe, it, expect } from "vitest";
import { initialState } from "../src/data/seed";
import {
  joinMission,
  claimMission,
  balance,
  exchange,
  cancelExchange,
  bookEvent,
  cancelEvent,
  validateItem,
} from "../src/services/domain";
import { addressMatcher } from "../src/services/address";
const now = new Date("2026-09-15T12:00:00+09:00");
describe("ポイントの台帳と重複防止", () => {
  it("初期300徳も履歴に残り、同じ達成への20回の請求で一回だけ付与する", () => {
    const s = initialState(now);
    joinMission(s, "learn-first", now);
    s.learned.amaterasu = now.toISOString();
    for (let i = 0; i < 20; i++) claimMission(s, "learn-first", now);
    expect(balance(s)).toBe(350);
    expect(s.ledger).toHaveLength(2);
  });
  it("参加前の学習では達成せず、参加後の学習なら達成する", () => {
    const s = initialState(now);
    s.learned.amaterasu = new Date(+now - 1000).toISOString();
    joinMission(s, "learn-first", now);
    expect(() => claimMission(s, "learn-first", now)).toThrow();
    s.learned.amaterasu = now.toISOString();
    claimMission(s, "learn-first", now);
    expect(balance(s)).toBe(350);
  });
  it("写真を削除して再登録しても発行済みポイントを再取得できない", () => {
    const s = initialState(now);
    joinMission(s, "collect-first", now);
    s.photos = [
      {
        id: "p",
        shrineId: "ise",
        date: "",
        note: "",
        hash: "a",
        sample: true,
        createdAt: now.toISOString(),
      },
    ];
    claimMission(s, "collect-first", now);
    s.photos = [];
    s.photos = [
      {
        id: "p2",
        shrineId: "ise",
        date: "",
        note: "",
        hash: "a",
        sample: true,
        createdAt: now.toISOString(),
      },
    ];
    claimMission(s, "collect-first", now);
    expect(balance(s)).toBe(400);
  });
  it("開始直前と終了時刻は拒否し、日本時間の開始時刻は許可する", () => {
    const s = initialState(now);
    const m = s.missions[0];
    const start = new Date(m.start);
    expect(() => joinMission(s, m.id, new Date(+start - 1))).toThrow();
    joinMission(s, m.id, start);
    s.learned.g = start.toISOString();
    expect(() => claimMission(s, m.id, new Date(m.end))).toThrow();
    claimMission(s, m.id, start);
    expect(balance(s)).toBe(350);
  });
  it("終了と下書きは達成できない", () => {
    for (const status of ["下書き", "終了"] as const) {
      const s = initialState(now);
      s.missions[0].status = status;
      expect(() => joinMission(s, s.missions[0].id, now)).toThrow();
    }
  });
  it("同じ交換要求を20回再送しても在庫と残高を一回だけ更新する", () => {
    const s = initialState(now);
    for (let i = 0; i < 20; i++) exchange(s, "walk", "request-1", now);
    expect(balance(s)).toBe(50);
    expect(s.rewards.find((r) => r.id === "walk")?.stock).toBe(1);
    expect(s.redemptions).toHaveLength(1);
  });
  it("20回のキャンセルで一度だけ返還・在庫復帰する。交換時の条件を保存する", () => {
    const s = initialState(now);
    exchange(s, "walk", "r", now);
    s.rewards.find((r) => r.id === "walk")!.points = 999;
    for (let i = 0; i < 20; i++) cancelExchange(s, "r", now);
    expect(balance(s)).toBe(300);
    expect(s.rewards.find((r) => r.id === "walk")?.stock).toBe(2);
    expect(s.ledger.filter((x) => x.id === "refund:r")).toHaveLength(1);
  });
  it("残高不足と在庫ゼロの失敗は、残高・在庫・履歴を変更しない", () => {
    const s = initialState(now);
    let before = structuredClone(s);
    expect(() => exchange(s, "case", "a", now)).toThrow("不足");
    expect(s).toEqual(before);
    s.rewards[0].stock = 0;
    before = structuredClone(s);
    expect(() => exchange(s, "bookmark", "b", now)).toThrow("残数");
    expect(s).toEqual(before);
  });
  it("異なる交換要求を連打しても負残高・負在庫にならない", () => {
    const s = initialState(now);
    for (let i = 0; i < 30; i++)
      try {
        exchange(s, "bookmark", String(i), now);
      } catch {}
    expect(balance(s)).toBe(0);
    expect(s.rewards[0].stock).toBe(6);
    expect(s.redemptions).toHaveLength(2);
  });
  it("キャンセル不可の特典は返還できない", () => {
    const s = initialState(now);
    exchange(s, "bookmark", "r", now);
    expect(() => cancelExchange(s, "r", now)).toThrow();
    expect(balance(s)).toBe(150);
  });
});
describe("イベント", () => {
  it("満席と二重申込を扱い、キャンセルを繰り返しても席数は元通り", () => {
    const s = initialState(now);
    expect(() => bookEvent(s, "event-full", "full", now)).toThrow("満席");
    bookEvent(s, "event-walk", "a", now);
    expect(() => bookEvent(s, "event-walk", "b", now)).toThrow("すでに");
    bookEvent(s, "event-walk", "a", now);
    expect(s.events[0].remaining).toBe(1);
    for (let i = 0; i < 10; i++) cancelEvent(s, "a", now);
    expect(s.events[0].remaining).toBe(2);
    bookEvent(s, "event-walk", "c", now);
    expect(s.events[0].remaining).toBe(1);
  });
  it("開催時刻以降は申込とキャンセルを拒否する", () => {
    const s = initialState(now);
    bookEvent(s, "event-walk", "a", now);
    expect(() => cancelEvent(s, "a", new Date(s.events[0].date))).toThrow();
    expect(() =>
      bookEvent(s, "event-walk", "b", new Date(s.events[0].date)),
    ).toThrow();
  });
});
describe("住所の変更・削除・区別", () => {
  it("四つの状態を区別し、一致を公式確認済みの例に限定する", () => {
    expect(addressMatcher.match("bancho1")).toMatchObject({
      official: true,
      status: "公式資料との一致",
      ids: ["ise"],
    });
    expect(addressMatcher.match("bancho2")?.ids).toEqual(["ise"]);
    expect(addressMatcher.match("multiple")).toMatchObject({
      official: false,
      status: "複数候補",
    });
    expect(addressMatcher.match("partial")?.status).toBe("詳細確認が必要");
    expect(addressMatcher.match("unknown")?.ids).toEqual([]);
  });
  it("変更・削除後は前の結果が復活せず、現住所と出生地が独立している", () => {
    const s = initialState(now);
    s.addresses.current = "bancho1";
    s.addresses.birth = "multiple";
    expect(addressMatcher.match(s.addresses.current)?.ids).toEqual(["ise"]);
    s.addresses.current = "unknown";
    expect(addressMatcher.match(s.addresses.current)?.ids).toEqual([]);
    s.addresses.current = "";
    const restored = structuredClone(s);
    expect(addressMatcher.match(restored.addresses.current)).toBeNull();
    expect(addressMatcher.match(restored.addresses.birth)?.status).toBe(
      "複数候補",
    );
  });
  it("不正な日時・数量・ポイントを受け付けない", () => {
    const m = initialState(now).missions[0];
    expect(() => validateItem({ ...m, points: -5 })).toThrow();
    expect(() => validateItem({ ...m, end: m.start })).toThrow();
    expect(() => validateItem({ ...m, target: 0.5 })).toThrow();
  });
});
