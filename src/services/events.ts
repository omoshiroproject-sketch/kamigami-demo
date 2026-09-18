import type { EventItem, State } from "../types";
import { jstDate } from "../data/seed";
import { validateItem } from "./domain";

export function safeEventUrl(value?: string) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}
export function eventImageUrl(value?: string) {
  return value && /^\/events\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(value)
    ? value
    : safeEventUrl(value);
}
export function homeEvents(events: EventItem[], now = new Date()) {
  return events
    .filter(
      (event) =>
        event.status === "公開" &&
        event.homeFeatured &&
        Number.isFinite(Date.parse(event.date)) &&
        jstDate(new Date(event.date)) >= jstDate(now),
    )
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
}
export function eventDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
export function validateEvent(event: EventItem) {
  validateItem(event);
  if (event.homeFeatured && !event.venue?.trim())
    throw Error("ホームに掲載するイベントは会場・場所を入力してください。");
  if (event.officialUrl && !safeEventUrl(event.officialUrl))
    throw Error("公式案内はhttpsで始まるURLを入力してください。");
  if (event.image?.src) {
    if (!eventImageUrl(event.image.src))
      throw Error("写真はhttpsの画像URLを入力してください。");
    if (
      !event.image.alt.trim() ||
      !event.image.author.trim() ||
      !event.image.license.trim() ||
      !safeEventUrl(event.image.source) ||
      !safeEventUrl(event.image.licenseUrl)
    )
      throw Error(
        "写真の説明・撮影者・出典URL・利用条件とそのURLを入力してください。",
      );
  }
}

export function saveEvent(state: State, draft: EventItem, editing: boolean) {
  validateEvent(draft);
  const index = state.events.findIndex((event) => event.id === draft.id);
  if (editing && index < 0) throw Error("編集対象のイベントが見つかりません。");
  if (!editing && index >= 0) throw Error("このイベントは保存済みです。");
  const current = state.events[index];
  const used = current ? current.capacity - current.remaining : 0;
  if (used > 0 && (draft.infoOnly || draft.capacity < used))
    throw Error(
      "申込済みの人数より定員を減らしたり、案内のみに変更したりできません。",
    );
  const saved = {
    ...draft,
    capacity: draft.infoOnly ? 0 : draft.capacity,
    remaining: draft.infoOnly ? 0 : draft.capacity - used,
  };
  if (editing) state.events[index] = saved;
  else state.events.unshift(saved);
}
