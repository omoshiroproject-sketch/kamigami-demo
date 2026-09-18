import { openDB, type DBSchema, type IDBPTransaction } from "idb";
import { initialState } from "../data/seed";
import { funaokaEvent } from "../data/events";
import type { State, Media, PhotoRecord } from "../types";
interface DemoDB extends DBSchema {
  state: { key: string; value: State };
  media: { key: string; value: Media };
}
// Additive migration: preserve existing photos, notes, and media without changing the DB name.
function withMindDefaults(state: State): State {
  state.mindEntries ??= [];
  state.manifesto ??= {
    values: "",
    contribution: "",
    declaration: "",
    updatedAt: "",
  };
  if ((state.eventCatalogVersion ?? 0) < 1) {
    if (!state.events.some((event) => event.id === funaokaEvent.id)) {
      state.events.push(structuredClone(funaokaEvent));
    }
    state.eventCatalogVersion = 1;
  }
  return state;
}
export interface Repository {
  read(): Promise<State>;
  update(change: (s: State) => void): Promise<State>;
  media(id: string): Promise<Media | undefined>;
  savePhoto(
    record: PhotoRecord,
    media?: Media,
    allowDuplicate?: boolean,
  ): Promise<State>;
  deletePhoto(id: string): Promise<State>;
  reset(): Promise<State>;
}
export function createRepository(
  name = "kamigami-demo-v1",
  notify = () => {},
): Repository {
  const db = openDB<DemoDB>(name, 1, {
    upgrade(db) {
      db.createObjectStore("state");
      db.createObjectStore("media");
    },
  });
  async function transaction(
    change: (s: State) => void,
    mediaChange?: (
      store: IDBPTransaction<DemoDB, ["state", "media"], "readwrite">,
    ) => Promise<unknown> | void,
  ): Promise<State> {
    const conn = await db;
    const tx = conn.transaction(["state", "media"], "readwrite");
    try {
      const state = withMindDefaults(
        (await tx.objectStore("state").get("main")) ?? initialState(),
      );
      change(state);
      await tx.objectStore("state").put(state, "main");
      if (mediaChange) await mediaChange(tx);
      await tx.done;
      notify();
      return state;
    } catch (e) {
      try {
        tx.abort();
      } catch {
        /* already aborted */
      }
      await tx.done.catch(() => {});
      throw e;
    }
  }
  return {
    read: async () => {
      const found = await (await db).get("state", "main");
      return found?.mindEntries &&
        found?.manifesto &&
        found.eventCatalogVersion === 1
        ? found
        : transaction(() => {});
    },
    update: (change) => transaction(change),
    media: async (id) => (await db).get("media", id),
    savePhoto: (record, media, allowDuplicate = false) =>
      transaction(
        (s) => {
          const old = s.photos.find((p) => p.id === record.id);
          if (
            (!old || old.hash !== record.hash) &&
            !allowDuplicate &&
            s.photos.some((p) => p.id !== record.id && p.hash === record.hash)
          )
            throw Error("DUPLICATE");
          if (old) Object.assign(old, record);
          else s.photos.unshift(record);
        },
        (tx) => {
          if (media) return tx.objectStore("media").put(media, record.id);
        },
      ),
    deletePhoto: (id) =>
      transaction(
        (s) => {
          s.photos = s.photos.filter((p) => p.id !== id);
        },
        (tx) => {
          return tx.objectStore("media").delete(id);
        },
      ),
    reset: () =>
      transaction(
        (s) => {
          Object.assign(s, initialState());
        },
        (tx) => {
          return tx.objectStore("media").clear();
        },
      ),
  };
}
const channel =
  typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("kamigami-changes")
    : null;
export const repository = createRepository("kamigami-demo-v1", () => {
  channel?.postMessage("changed");
  window.dispatchEvent(new Event("kamigami-changed"));
});
channel?.addEventListener("message", () =>
  window.dispatchEvent(new Event("kamigami-changed")),
);
