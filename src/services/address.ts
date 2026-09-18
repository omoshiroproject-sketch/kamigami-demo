import { ISE_SOURCE } from "../data/master";
export const addressExamples = [
  { id: "bancho1", label: "岡山市北区番町1丁目（町域のテスト例）" },
  { id: "bancho2", label: "岡山市北区番町2丁目（町域のテスト例）" },
  { id: "multiple", label: "架空の町・結び町（複数候補）" },
  { id: "partial", label: "架空の町・境の町（詳細確認）" },
  { id: "unknown", label: "架空の町・新しい町（未整備）" },
];
export interface AddressMatcher {
  match(exampleId: string): AddressMatch | null;
}
export type AddressMatch = {
  status: string;
  ids: string[];
  official: boolean;
  reason: string;
  source?: string;
};
export const addressMatcher: AddressMatcher = {
  match(id) {
    if (!id) return null;
    if (id === "bancho1" || id === "bancho2")
      return {
        status: "公式資料との一致",
        ids: ["ise"],
        official: true,
        reason:
          "岡山県神社庁の氏子地域一覧に番町1丁目・2丁目の記載があります。保存済み対応表との照合であり、個人への証明やリアルタイムの公式判定ではありません。",
        source: ISE_SOURCE,
      };
    if (id === "multiple")
      return {
        status: "複数候補",
        ids: ["sample-1", "sample-2"],
        official: false,
        reason:
          "区域が重なる場面を再現したサンプル照合です。実際は神社庁・地域の神社へ区域を確認します。",
      };
    if (id === "partial")
      return {
        status: "詳細確認が必要",
        ids: ["sample-3"],
        official: false,
        reason:
          "町域の一部だけが対応する場面のサンプル照合です。境界や区域資料の確認が必要なため、確定しません。",
      };
    return {
      status: "未整備",
      ids: [],
      official: false,
      reason:
        "地域資料が未登録の場合のサンプル照合です。神社が存在しないという意味ではありません。地域の神社庁などに確認します。",
    };
  },
};
