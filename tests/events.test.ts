import "fake-indexeddb/auto";
import { expect, it } from "vitest";
import { openDB } from "idb";
import { initialState } from "../src/data/seed";
import { funaokaEvent } from "../src/data/events";
import { bookEvent } from "../src/services/domain";
import {
  homeEvents,
  safeEventUrl,
  eventImageUrl,
  validateEvent,
  saveEvent,
} from "../src/services/events";
import { createRepository } from "../src/services/storage";

it("ホームは公開・掲載指定・開催日が今日以降のイベントを日付順に表示する", () => {
  const seed = structuredClone(funaokaEvent);
  const events = [
    { ...seed, id: "later", date: "2026-10-20T11:00:00+09:00" },
    { ...seed, id: "draft", status: "下書き" as const },
    { ...seed, id: "off", homeFeatured: false },
    { ...seed, id: "ended", status: "終了" as const },
    { ...seed, id: "yesterday", date: "2026-10-18T11:00:00+09:00" },
    { ...seed, id: "invalid", date: "invalid" },
    seed,
  ];
  const before = structuredClone(events);
  expect(
    homeEvents(events, new Date("2026-10-19T23:59:59+09:00")).map((e) => e.id),
  ).toEqual([seed.id, "later"]);
  expect(events).toEqual(before);
  expect(homeEvents([seed], new Date("2026-10-19T15:00:00Z"))).toEqual([]);
});

it("写真と公式リンクは安全なURLと帰属情報を必要とする", () => {
  expect(() => validateEvent(funaokaEvent)).not.toThrow();
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,test",
    "//example.org",
    "http://example.org",
  ])
    expect(safeEventUrl(url)).toBe("");
  expect(eventImageUrl("/events/kenkun.jpg")).toBe("/events/kenkun.jpg");
  expect(eventImageUrl("/events/../../private.png")).toBe("");
  expect(() => validateEvent({ ...funaokaEvent, venue: "" })).toThrow("会場");
  expect(() =>
    validateEvent({
      ...funaokaEvent,
      image: { ...funaokaEvent.image!, author: "" },
    }),
  ).toThrow("撮影者");
  expect(() =>
    validateEvent({ ...funaokaEvent, officialUrl: "javascript:alert(1)" }),
  ).toThrow("https");
});

it("紹介だけの実在祭典にはデモ参加券を発行しない", () => {
  const state = initialState(new Date("2026-09-18T10:00:00+09:00"));
  const before = structuredClone(state);
  expect(() =>
    bookEvent(
      state,
      funaokaEvent.id,
      "ticket",
      new Date("2026-09-18T10:00:00+09:00"),
    ),
  ).toThrow("情報の紹介");
  expect(state).toEqual(before);
});

it("イベントを編集しても申込済み人数を保持し、定員減少・案内のみへの変更を拒否する", () => {
  const now = new Date("2026-09-18T10:00:00+09:00");
  const state = initialState(now);
  bookEvent(state, "event-walk", "ticket", now);
  const draft = {
    ...state.events[0],
    title: "更新した散歩会",
    capacity: 4,
    remaining: 999,
  };
  saveEvent(state, draft, true);
  expect(state.events[0].remaining).toBe(3);
  expect(state.tickets).toHaveLength(1);
  expect(() => saveEvent(state, { ...draft, infoOnly: true }, true)).toThrow(
    "申込済み",
  );
  expect(() => saveEvent(state, { ...draft, id: "missing" }, true)).toThrow(
    "見つかりません",
  );
  expect(() => saveEvent(state, draft, false)).toThrow("保存済み");
});

it("旧データへ祭典を一度だけ追加し、写真・メモ・運営の編集内容を上書きしない", async () => {
  const name = crypto.randomUUID();
  const old = initialState();
  delete old.eventCatalogVersion;
  old.events = old.events.filter((e) => e.id !== funaokaEvent.id);
  old.notes.amaterasu = "以前の学び";
  old.photos = [
    {
      id: "photo",
      shrineId: "ise",
      date: "",
      note: "思い出",
      hash: "hash",
      sample: false,
      createdAt: new Date().toISOString(),
    },
  ];
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
    "photo",
  );
  const repo = createRepository(name);
  const migrated = await repo.read();
  expect(migrated.events.filter((e) => e.id === funaokaEvent.id)).toHaveLength(
    1,
  );
  expect(migrated.photos).toEqual(old.photos);
  expect(migrated.notes).toEqual(old.notes);
  expect(migrated.ledger).toEqual(old.ledger);
  expect((await repo.media("photo"))?.original.size).toBe(8);
  await repo.update((state) => {
    const event = state.events.find((e) => e.id === funaokaEvent.id)!;
    event.title = "編集済み";
    event.status = "下書き";
    event.homeFeatured = false;
  });
  const reopened = await createRepository(name).read();
  expect(reopened.events.filter((e) => e.id === funaokaEvent.id)).toHaveLength(
    1,
  );
  expect(reopened.events.find((e) => e.id === funaokaEvent.id)).toMatchObject({
    title: "編集済み",
    status: "下書き",
    homeFeatured: false,
  });
  conn.close();
});
