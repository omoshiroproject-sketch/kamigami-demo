import type { MindEntry, PhotoRecord, State } from "../types";
import { shrines, shrineById } from "../data/master";
import { jstDate } from "../data/seed";

export const pledgeStatuses = [
  "育てている",
  "一歩進んだ",
  "実践できた",
] as const;
export const gratitudeLabels = [
  "まだ見つからない",
  "少し感じる",
  "感じている",
  "深く感じる",
  "満ちている",
];
export const milestones = [
  {
    count: 10,
    title: "知る",
    theme: "神話の扉を開き、ご祭神を知る",
    detail: "名前や由緒に触れ、その場所とのご縁を深める。",
    question: "今日、初めて知ったことは何ですか？",
  },
  {
    count: 22,
    title: "深める",
    theme: "神様の物語と、自分の内面を結ぶ",
    detail: "学んだことから、自分が大切にしたい生き方を見つける。",
    question: "いまの自分は、どんな行動を選びたいですか？",
  },
  {
    count: 33,
    title: "定着化",
    theme: "日常に、感謝の循環を育てる",
    detail: "小さな感謝と誓いの実践を、日々の記録で振り返る。",
    question: "今日の暮らしの中で、誰に何を感謝しますか？",
  },
  {
    count: 50,
    title: "覚醒",
    theme: "自分の軸を、社会と未来への宣言に",
    detail: "大切にしたい価値観を言葉にし、周囲への貢献へつなげる。",
    question: "これから、誰にどんな良い変化を届けたいですか？",
  },
] as const;

export function collectedPlaces(photos: PhotoRecord[]) {
  const known = new Set(shrines.map((s) => s.id));
  return new Set(
    photos.filter((p) => known.has(p.shrineId)).map((p) => p.shrineId),
  ).size;
}
export function journeyProgress(photos: PhotoRecord[]) {
  return milestoneProgress(collectedPlaces(photos));
}
export function milestoneProgress(count: number) {
  return {
    count,
    reached: milestones.filter((m) => count >= m.count),
    next: milestones.find((m) => count < m.count),
    percent: Math.min(100, (count / 50) * 100),
  };
}
export function orderedEntries(entries: MindEntry[]) {
  return [...entries].sort(
    (a, b) =>
      b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  );
}
export function gratitudeSeries(entries: MindEntry[]) {
  const dates = new Map<string, { total: number; count: number }>();
  for (const entry of entries) {
    const day = dates.get(entry.date) ?? { total: 0, count: 0 };
    day.total += entry.gratitude;
    day.count++;
    dates.set(entry.date, day);
  }
  return [...dates.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, day]) => ({
      date,
      value: Math.round((day.total / day.count) * 10) / 10,
      count: day.count,
    }));
}
export function validateMindEntry(entry: MindEntry, today = jstDate()) {
  const date = new Date(entry.date + "T00:00:00Z");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(entry.date) ||
    !Number.isFinite(+date) ||
    date.toISOString().slice(0, 10) !== entry.date ||
    entry.date > today
  )
    throw Error("記録日は今日までの正しい日付を選んでください。");
  if (entry.shrineId && !shrineById(entry.shrineId))
    throw Error("記録する寺社を選び直してください。");
  if (
    !Number.isInteger(entry.gratitude) ||
    entry.gratitude < 1 ||
    entry.gratitude > 5
  )
    throw Error("感謝の実感を1〜5から選んでください。");
  if (![entry.gratitudeText, entry.pledge, entry.insight].some((v) => v.trim()))
    throw Error("感謝・誓い・気づきのどれかを、一言残してください。");
  if (
    [
      entry.gratitudeText,
      entry.pledge,
      entry.nextStep,
      entry.insight,
      entry.reflection,
    ].some((v) => v.length > 1000)
  )
    throw Error("各項目は1,000文字以内で入力してください。");
  if (!pledgeStatuses.includes(entry.pledgeStatus))
    throw Error("誓いの現在地を選び直してください。");
}
export function saveMindEntry(state: State, entry: MindEntry, editing = false) {
  validateMindEntry(entry);
  const index = state.mindEntries.findIndex((e) => e.id === entry.id);
  if (editing && index < 0)
    throw Error("この記録は別の画面で削除されました。新しく記録してください。");
  const normalized = { ...entry };
  for (const key of [
    "gratitudeText",
    "pledge",
    "nextStep",
    "insight",
    "reflection",
  ] as const)
    normalized[key] = normalized[key].trim();
  if (!normalized.pledge) {
    normalized.pledgeStatus = "育てている";
    normalized.reflection = "";
  }
  if (index < 0) state.mindEntries.unshift(normalized);
  else state.mindEntries[index] = normalized;
}
