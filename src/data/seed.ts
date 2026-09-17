import type { State } from "../types";
export const config = {
  initialPoints: 300,
  learnReward: 50,
  collectReward: 100,
  visitReward: 50,
  maxImageBytes: 20 * 1024 * 1024,
};
export function jstDate(d = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
export function initialState(now = new Date()): State {
  const start = jstDate(now) + "T00:00:00+09:00";
  const after = (days: number) =>
    jstDate(new Date(now.getTime() + days * 86400000));
  const end = after(31) + "T00:00:00+09:00";
  return {
    version: 1,
    favorites: [],
    visits: {},
    learned: {},
    notes: {},
    addresses: { current: "", birth: "" },
    photos: [],
    mindEntries: [],
    manifesto: { values: "", contribution: "", declaration: "", updatedAt: "" },
    joined: {},
    missions: [
      {
        id: "learn-first",
        title: "ひと柱の神様を知る",
        description:
          "参加後に神様・ご本尊の紹介を読み、「学習を記録」を押しましょう。",
        kind: "learn",
        target: 1,
        points: config.learnReward,
        start,
        end,
        status: "公開",
      },
      {
        id: "collect-first",
        title: "はじめての一頁を綴る",
        description:
          "参加後に御朱印写真を1寺社に登録。サンプル画像でも体験できます。",
        kind: "collect",
        target: 1,
        points: config.collectReward,
        start,
        end,
        status: "公開",
      },
      {
        id: "visit-first",
        title: "心に残る参拝を記録",
        description:
          "参加後に寺社詳細からデモ参拝を記録。実際の来訪確認は行いません。",
        kind: "visit",
        target: 1,
        points: config.visitReward,
        start,
        end,
        status: "公開",
      },
    ],
    ledger: [
      {
        id: "initial",
        amount: config.initialPoints,
        label: "はじめのデモポイント",
        at: now.toISOString(),
      },
    ],
    rewards: [
      {
        id: "bookmark",
        title: "杜の葉しおり",
        description:
          "和紙の手触りをイメージした、オリジナルしおりの交換体験。発送はありません。",
        kind: "物品",
        points: 150,
        stock: 8,
        date: "日程指定なし・発送なし",
        cancelable: false,
        status: "公開",
      },
      {
        id: "walk",
        title: "朝の杜を歩く、文化案内",
        description:
          "少人数の案内に申し込む体験。実在寺社の催しではなく、集合場所や立入許可はありません。",
        kind: "特別体験",
        points: 250,
        stock: 2,
        date: after(7) + " 10:00（日本時間）",
        cancelable: true,
        status: "公開",
      },
      {
        id: "case",
        title: "御朱印帳の布包み",
        description: "残高不足の状態も体験できるサンプル特典。",
        kind: "物品",
        points: 800,
        stock: 1,
        date: "日程指定なし・発送なし",
        cancelable: false,
        status: "公開",
      },
    ],
    redemptions: [],
    events: [
      {
        id: "event-walk",
        title: "杜の文化を知る、小さな散歩",
        description:
          "架空のデモ会場で行う申込体験。所要時間60分、追加費用なし、持ち物不要。現地集合や実際の催行はありません。開始前までキャンセルできます。",
        date: after(7) + "T10:00:00+09:00",
        capacity: 2,
        remaining: 2,
        status: "公開",
      },
      {
        id: "event-full",
        title: "御朱印帳を囲むお話会",
        description:
          "満席時の表示を体験するサンプルです。実際の開催はありません。",
        date: after(10) + "T14:00:00+09:00",
        capacity: 5,
        remaining: 0,
        status: "公開",
      },
    ],
    tickets: [],
    posts: [
      {
        id: "welcome",
        text: "ご祭神を知ってから御朱印帳を見返すと、また違った発見がありそう。今日は一頁ずつ、ゆっくり整理しています。",
        sample: true,
        hidden: false,
        at: now.toISOString(),
        comments: [],
      },
    ],
  };
}
