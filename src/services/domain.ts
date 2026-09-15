import type { State, Mission, Reward, EventItem } from "../types";
export const balance = (s: State) => s.ledger.reduce((n, e) => n + e.amount, 0);
export const active = (m: Mission, now = new Date()) =>
  m.status === "公開" &&
  +now >= Date.parse(m.start) &&
  +now < Date.parse(m.end);
export function progress(s: State, m: Mission) {
  const since = Date.parse(s.joined[m.id] || "");
  if (!Number.isFinite(since)) return 0;
  const eligible = (time: string) =>
    Date.parse(time) >= since &&
    Date.parse(time) >= Date.parse(m.start) &&
    Date.parse(time) < Date.parse(m.end);
  if (m.kind === "learn")
    return Object.values(s.learned).filter(eligible).length;
  if (m.kind === "visit")
    return Object.values(s.visits).filter(eligible).length;
  return new Set(
    s.photos.filter((p) => eligible(p.createdAt)).map((p) => p.shrineId),
  ).size;
}
export function joinMission(s: State, id: string, now = new Date()) {
  const m = s.missions.find((m) => m.id === id);
  if (!m || !active(m, now)) throw Error("このミッションは開催期間外です。");
  s.joined[id] ??= now.toISOString();
}
export function claimMission(s: State, id: string, now = new Date()) {
  const key = `mission:${id}`;
  if (s.ledger.some((l) => l.id === key)) return;
  const m = s.missions.find((m) => m.id === id);
  if (!m || !active(m, now))
    throw Error("開始前・終了後のミッションは達成できません。");
  if (progress(s, m) < m.target)
    throw Error("まだ達成条件を満たしていません。");
  s.ledger.push({
    id: key,
    amount: m.points,
    label: m.title,
    at: now.toISOString(),
  });
}
export function exchange(
  s: State,
  id: string,
  requestId: string,
  now = new Date(),
) {
  if (s.redemptions.some((r) => r.id === requestId)) return;
  const r = s.rewards.find((r) => r.id === id);
  if (!r || r.status !== "公開") throw Error("この特典は受付を終了しました。");
  if (r.stock < 1) throw Error("残数がありません。");
  if (balance(s) < r.points) throw Error("ポイントが不足しています。");
  r.stock--;
  s.ledger.push({
    id: `exchange:${requestId}`,
    amount: -r.points,
    label: `交換：${r.title}`,
    at: now.toISOString(),
  });
  s.redemptions.push({
    id: requestId,
    rewardId: id,
    title: r.title,
    points: r.points,
    date: r.date,
    cancelable: r.cancelable,
    cancelled: false,
    at: now.toISOString(),
  });
}
export function cancelExchange(s: State, id: string, now = new Date()) {
  const r = s.redemptions.find((r) => r.id === id);
  if (!r || r.cancelled) return;
  if (!r.cancelable) throw Error("この交換はキャンセル対象外です。");
  r.cancelled = true;
  const reward = s.rewards.find((x) => x.id === r.rewardId);
  if (reward) reward.stock++;
  s.ledger.push({
    id: `refund:${id}`,
    amount: r.points,
    label: `返還：${r.title}`,
    at: now.toISOString(),
  });
}
export function bookEvent(
  s: State,
  id: string,
  requestId: string,
  now = new Date(),
) {
  if (s.tickets.some((t) => t.id === requestId)) return;
  const e = s.events.find((e) => e.id === id);
  if (!e || e.status !== "公開" || Date.parse(e.date) <= +now)
    throw Error("申込受付は終了しました。");
  if (s.tickets.some((t) => t.eventId === id && !t.cancelled))
    throw Error("すでに申込済みです。参加券をご確認ください。");
  if (e.remaining < 1) throw Error("このイベントは満席です。");
  e.remaining--;
  s.tickets.push({
    id: requestId,
    eventId: id,
    title: e.title,
    date: e.date,
    cancelled: false,
  });
}
export function cancelEvent(s: State, id: string, now = new Date()) {
  const t = s.tickets.find((t) => t.id === id);
  if (!t || t.cancelled) return;
  if (Date.parse(t.date) <= +now)
    throw Error("開催後のキャンセルはできません。");
  t.cancelled = true;
  const e = s.events.find((e) => e.id === t.eventId);
  if (e) e.remaining++;
}
export function validateItem(item: Mission | Reward | EventItem) {
  if (!item.title.trim() || !item.description.trim())
    throw Error("名称と説明を入力してください。");
  const integer = (v: number, min: number) =>
    Number.isSafeInteger(v) && v >= min && v <= 100000;
  if ("points" in item && !integer(item.points, 1))
    throw Error("ポイントは1〜100000の整数にしてください。");
  if (
    "target" in item &&
    (!integer(item.target, 1) ||
      !Number.isFinite(Date.parse(item.start)) ||
      !Number.isFinite(Date.parse(item.end)) ||
      Date.parse(item.start) >= Date.parse(item.end))
  )
    throw Error("目標数と開始・終了日時を確認してください。");
  if ("stock" in item && !integer(item.stock, 0))
    throw Error("残数は0以上の整数にしてください。");
  if (
    "capacity" in item &&
    (!integer(item.capacity, 1) || !Number.isFinite(Date.parse(item.date)))
  )
    throw Error("日程と定員を確認してください。");
}
