import "fake-indexeddb/auto";
import { it, expect } from "vitest";
import { createRepository } from "../src/services/storage";
import { initialState } from "../src/data/seed";
import {
  exchange,
  balance,
  cancelExchange,
  joinMission,
  claimMission,
  bookEvent,
  cancelEvent,
} from "../src/services/domain";
import { addressMatcher } from "../src/services/address";
const now = new Date("2026-09-15T12:00:00+09:00");
it("20個の並行した取引が最後の1在庫を超えず、残高と台帳が一致する", async () => {
  const name = crypto.randomUUID();
  const a = createRepository(name);
  const b = createRepository(name);
  await a.update((s) => {
    Object.assign(s, initialState(now));
    s.rewards[0].stock = 1;
  });
  const results = await Promise.allSettled(
    Array.from({ length: 20 }, (_, i) =>
      (i % 2 ? a : b).update((s) => exchange(s, "bookmark", `r-${i}`, now)),
    ),
  );
  expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  const state = await a.read();
  expect(state.rewards[0].stock).toBe(0);
  expect(state.redemptions).toHaveLength(1);
  expect(balance(state)).toBe(150);
});
it("並行した達成と返還が一重である", async () => {
  const db = createRepository(crypto.randomUUID());
  await db.update((s) => {
    Object.assign(s, initialState(now));
    joinMission(s, "learn-first", now);
    s.learned.g = now.toISOString();
  });
  await Promise.all(
    Array.from({ length: 10 }, () =>
      db.update((s) => claimMission(s, "learn-first", now)),
    ),
  );
  expect(balance(await db.read())).toBe(350);
  await db.update((s) => exchange(s, "walk", "a", now));
  await Promise.all(
    Array.from({ length: 10 }, () =>
      db.update((s) => cancelExchange(s, "a", now)),
    ),
  );
  expect(balance(await db.read())).toBe(350);
});
it("原画像・縮小画像・関連付けを保持し、修正・削除と重複確認が一貫する", async () => {
  const db = createRepository(crypto.randomUUID());
  const photo = {
    id: "p",
    shrineId: "ise",
    date: "",
    note: "思い出",
    hash: "abc",
    sample: false,
    createdAt: now.toISOString(),
  };
  const media = {
    original: new Blob(["original"], { type: "image/png" }),
    thumbnail: new Blob(["thumb"], { type: "image/png" }),
  };
  await db.savePhoto(photo, media);
  expect((await db.media("p"))?.original.size).toBe(8);
  expect((await db.read()).photos[0].date).toBe("");
  await expect(db.savePhoto({ ...photo, id: "p2" }, media)).rejects.toThrow(
    "DUPLICATE",
  );
  expect(await db.media("p2")).toBeUndefined();
  await db.savePhoto({ ...photo, shrineId: "ryozenji", date: "2020-02-10" });
  expect((await db.read()).photos[0].shrineId).toBe("ryozenji");
  expect((await db.media("p"))?.thumbnail.size).toBe(5);
  await db.deletePhoto("p");
  expect((await db.read()).photos).toHaveLength(0);
  expect(await db.media("p")).toBeUndefined();
});
it("住所とノート・お気に入り・運営状態を再接続後も保持し、削除後は結果が消える", async () => {
  const name = crypto.randomUUID();
  const a = createRepository(name);
  await a.update((s) => {
    s.addresses.current = "bancho1";
    s.addresses.birth = "multiple";
    s.notes.amaterasu = "学び";
    s.favorites = ["ise"];
    s.missions[0].status = "終了";
  });
  const b = createRepository(name);
  expect((await b.read()).notes.amaterasu).toBe("学び");
  expect((await b.read()).favorites).toEqual(["ise"]);
  expect((await b.read()).missions[0].status).toBe("終了");
  await a.update((s) => {
    s.addresses.current = "unknown";
  });
  expect(addressMatcher.match((await b.read()).addresses.current)?.ids).toEqual(
    [],
  );
  await a.update((s) => {
    s.addresses.current = "";
  });
  expect(addressMatcher.match((await b.read()).addresses.current)).toBeNull();
  expect((await b.read()).addresses.birth).toBe("multiple");
});
it("途中の例外は部分更新を残さない", async () => {
  const db = createRepository(crypto.randomUUID());
  await db.read();
  const before = await db.read();
  await expect(
    db.update((s) => {
      s.ledger = [];
      s.rewards[0].stock = 0;
      throw Error("failure");
    }),
  ).rejects.toThrow();
  expect(await db.read()).toEqual(before);
});
it("並行イベント申込は重複せずキャンセルで席を一度だけ戻す", async () => {
  const db = createRepository(crypto.randomUUID());
  await db.update((s) => Object.assign(s, initialState(now)));
  const results = await Promise.allSettled(
    Array.from({ length: 10 }, (_, i) =>
      db.update((s) => bookEvent(s, "event-walk", `t${i}`, now)),
    ),
  );
  expect(results.filter((x) => x.status === "fulfilled")).toHaveLength(1);
  const ticket = (await db.read()).tickets[0];
  await Promise.all(
    Array.from({ length: 10 }, () =>
      db.update((s) => cancelEvent(s, ticket.id, now)),
    ),
  );
  expect((await db.read()).events[0].remaining).toBe(2);
});
it("リセットは写真Blobも消して初期300徳に戻す", async () => {
  const db = createRepository(crypto.randomUUID());
  await db.savePhoto(
    {
      id: "p",
      shrineId: "ise",
      date: "",
      note: "",
      hash: "a",
      sample: true,
      createdAt: now.toISOString(),
    },
    { original: new Blob(["a"]), thumbnail: new Blob(["b"]) },
  );
  await db.update((s) => {
    s.addresses.current = "bancho1";
    s.favorites = ["ise"];
    s.notes.g = "note";
  });
  await db.reset();
  expect((await db.read()).photos).toHaveLength(0);
  expect(await db.media("p")).toBeUndefined();
  expect(balance(await db.read())).toBe(300);
  expect((await db.read()).addresses.current).toBe("");
});

it("確認済みの重複写真を訂正するとき、重複確認を再要求しない", async () => {
  const db = createRepository(crypto.randomUUID());
  const photo = {
    id: "a",
    shrineId: "ise",
    date: "",
    note: "",
    hash: "same",
    sample: true,
    createdAt: now.toISOString(),
  };
  const media = { original: new Blob(["a"]), thumbnail: new Blob(["a"]) };
  await db.savePhoto(photo, media);
  await db.savePhoto({ ...photo, id: "b" }, media, true);
  await db.savePhoto({
    ...photo,
    id: "b",
    shrineId: "ryozenji",
    date: "2021-05-20",
  });
  expect((await db.read()).photos.find((p) => p.id === "b")?.date).toBe(
    "2021-05-20",
  );
  expect(new Set((await db.read()).photos.map((p) => p.shrineId)).size).toBe(2);
});

it("写真Blobの容量不足時は写真メタデータと台帳も同時にロールバックする", async () => {
  const db = createRepository(crypto.randomUUID());
  const before = await db.read();
  const original = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (
    ...args: Parameters<IDBObjectStore["put"]>
  ) {
    if (this.name === "media")
      throw new DOMException("quota", "QuotaExceededError");
    return original.apply(this, args);
  };
  try {
    await expect(
      db.savePhoto(
        {
          id: "quota",
          shrineId: "ise",
          date: "",
          note: "残す",
          hash: "q",
          sample: false,
          createdAt: now.toISOString(),
        },
        { original: new Blob(["x"]), thumbnail: new Blob(["x"]) },
      ),
    ).rejects.toThrow("quota");
  } finally {
    IDBObjectStore.prototype.put = original;
  }
  expect(await db.read()).toEqual(before);
  expect(await db.media("quota")).toBeUndefined();
});
