import type { God, Shrine } from "../types";
export const CHECKED = "2026-09-15";
export const ISE_SOURCE = "https://www.okayama-jinjacho.or.jp/search/16412/";
export const GOD_SOURCE = "https://www.isejingu.or.jp/about/";
export const gods: God[] = [
  {
    id: "amaterasu",
    name: "天照皇大神",
    reading: "あまてらすおおみかみ（天照大御神）",
    kind: "神様",
    description:
      "天照大御神とも呼ばれ、伊勢の皇大神宮（内宮）にお祀りされています。岡山の伊勢神社にも御祭神として記載されています。",
    source: GOD_SOURCE,
  },
  {
    id: "toyouke",
    name: "豊受大神",
    reading: "とようけのおおかみ",
    kind: "神様",
    description:
      "天照大御神のお食事をつかさどる御饌都神（みけつかみ）として、伊勢の豊受大神宮（外宮）にお祀りされています。",
    source: GOD_SOURCE,
  },
  {
    id: "shaka",
    name: "釈迦如来",
    reading: "しゃかにょらい",
    kind: "ご本尊",
    description:
      "霊山寺のご本尊です。霊山寺は四国八十八ヶ所の第一番札所として紹介されています。",
    source: "https://88shikokuhenro.jp/01ryozenji/",
  },
  {
    id: "amida",
    name: "阿弥陀如来",
    reading: "あみだにょらい",
    kind: "ご本尊",
    description:
      "極楽寺のご本尊です。極楽寺は四国八十八ヶ所の第二番札所として紹介されています。",
    source: "https://88shikokuhenro.jp/02gokurakuji/",
  },
  ...[
    "倭迹迹日百襲姫命",
    "日本武尊",
    "大山咋命",
    "大吉備津彦命",
    "倉稻魂命",
    "武安霊命",
    "妹姫命",
  ].map((name, i) => ({
    id: `okayama-${i}`,
    name,
    reading: [
      "やまとととひももそひめのみこと",
      "やまとたけるのみこと",
      "おおやまくいのみこと",
      "おおきびつひこのみこと",
      "うかのみたまのみこと",
      "読み方は未確認",
      "読み方は未確認",
    ][i],
    kind: "神様" as const,
    description:
      "岡山県神社庁の岡山神社の御祭神一覧に記載されています。詳しい由来・関係は未確認です。",
    source: "https://www.okayama-jinjacho.or.jp/search/16434/",
  })),
  {
    id: "sample-kami",
    name: "杜の神（架空）",
    reading: "もりのかみ",
    kind: "神様",
    fictional: true,
    description:
      "画面操作を体験するための架空の神様です。実在する信仰や伝承を説明するものではありません。",
  },
  {
    id: "sample-buddha",
    name: "光の仏（架空）",
    reading: "ひかりのほとけ",
    kind: "ご本尊",
    fictional: true,
    description:
      "寺院の表示と個人メモを試すための架空のご本尊です。実在の教義とは関係ありません。",
  },
];
const real: Shrine[] = [
  {
    id: "ise",
    name: "伊勢神社",
    reading: "いせじんじゃ",
    region: "岡山県",
    city: "岡山市北区",
    address: "岡山県岡山市北区番町2-11-20",
    kind: "神社",
    lat: 34.67465569734284,
    lng: 133.929065025795,
    gods: ["amaterasu", "toyouke"],
    source: ISE_SOURCE,
    checked: CHECKED,
    fictional: false,
    description:
      "岡山県神社庁に、番町1丁目・2丁目を氏子地域として掲載する神社。ご祭神は天照皇大神・豊受大神です。",
  },
  {
    id: "okayama",
    name: "岡山神社",
    reading: "おかやまじんじゃ",
    region: "岡山県",
    city: "岡山市北区",
    address: "岡山県岡山市北区石関町2-33",
    kind: "神社",
    lat: 34.667499,
    lng: 133.931388,
    gods: Array.from({ length: 7 }, (_, i) => `okayama-${i}`),
    source: "https://www.okayama-jinjacho.or.jp/search/16434/",
    checked: CHECKED,
    fictional: false,
    description:
      "岡山市北区石関町に鎮座。公式資料に記載された七柱のご祭神を、詳細から確認できます。",
  },
  {
    id: "ryozenji",
    name: "霊山寺",
    reading: "りょうぜんじ",
    region: "徳島県",
    city: "鳴門市",
    address: "徳島県鳴門市大麻町板東塚鼻126",
    kind: "寺院",
    lat: 34.15936788057693,
    lng: 134.50031681521793,
    gods: ["shaka"],
    source: "https://88shikokuhenro.jp/01ryozenji/",
    checked: CHECKED,
    fictional: false,
    description:
      "四国八十八ヶ所・第一番札所。ご本尊は釈迦如来。高野山真言宗の寺院です。",
  },
  {
    id: "gokurakuji",
    name: "極楽寺",
    reading: "ごくらくじ",
    region: "徳島県",
    city: "鳴門市",
    address: "徳島県鳴門市大麻町檜字段の上12",
    kind: "寺院",
    lat: 34.15567658057788,
    lng: 134.48819461521776,
    gods: ["amida"],
    source: "https://88shikokuhenro.jp/02gokurakuji/",
    checked: CHECKED,
    fictional: false,
    description:
      "四国八十八ヶ所・第二番札所。ご本尊は阿弥陀如来。高野山真言宗の寺院です。",
  },
];
const names = [
  "木漏れ日",
  "朝凪",
  "青葉",
  "月の杜",
  "花霞",
  "風待ち",
  "結びの森",
  "白露",
  "山あかり",
  "水音",
  "星見",
  "若草",
  "小春",
  "千鳥",
  "山桜",
  "夕凪",
  "こだま",
  "ひだまり",
  "秋風",
  "雲の峰",
];
const readings = [
  "こもれび",
  "あさなぎ",
  "あおば",
  "つきのもり",
  "はながすみ",
  "かぜまち",
  "むすびのもり",
  "しらつゆ",
  "やまあかり",
  "みずおと",
  "ほしみ",
  "わかくさ",
  "こはる",
  "ちどり",
  "やまざくら",
  "ゆうなぎ",
  "こだま",
  "ひだまり",
  "あきかぜ",
  "くものみね",
];
const regions = [
  ["岡山県", 34.7, 133.89],
  ["京都府", 35.04, 135.74],
  ["奈良県", 34.69, 135.84],
  ["香川県", 34.28, 134.02],
  ["長野県", 36.6, 138.16],
] as const;
export const shrines: Shrine[] = [
  ...real,
  ...names.map((name, i) => {
    const [region, lat, lng] = regions[i % 5];
    const temple = i % 4 === 3;
    return {
      id: `sample-${i + 1}`,
      name: `${name}${temple ? "寺" : "神社"}`,
      reading: readings[i] + (temple ? "じ" : "じんじゃ"),
      region,
      city: "架空の町域",
      address: `${region} デモ町${i + 1}丁目（架空）`,
      kind: temple ? ("寺院" as const) : ("神社" as const),
      lat: lat + Math.floor(i / 5) * 0.035,
      lng: lng + Math.floor(i / 5) * 0.035,
      gods: [temple ? "sample-buddha" : "sample-kami"],
      fictional: true,
      description:
        "検索・地図・御朱印の整理を試すための架空の寺社です。所在地と地図のピンも操作用サンプルです。実際には訪問できません。",
    };
  }),
];
export const shrineById = (id: string) => shrines.find((s) => s.id === id);
export const normalize = (text: string) =>
  text
    .normalize("NFKC")
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .toLowerCase()
    .replace(/\s/g, "");
