import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Plus } from "lucide-react";
import { useDemo } from "../context";
import { jstDate } from "../data/seed";
import { kenkunPhoto } from "../data/events";
import { saveEvent, validateEvent } from "../services/events";
import type { EventItem, EventPhoto, Status } from "../types";
import { EventVisual } from "./EventGuide";
import { Section } from "./Primitives";

function newEvent(): EventItem {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    date: jstDate(new Date(Date.now() + 7 * 86400000)) + "T11:00:00+09:00",
    status: "下書き",
    capacity: 1,
    remaining: 1,
    infoOnly: true,
    homeFeatured: true,
  };
}
const blankPhoto: EventPhoto = {
  src: "",
  alt: "",
  author: "",
  source: "",
  license: "",
  licenseUrl: "",
};
function localDate(value: string) {
  return new Date(Date.parse(value) + 9 * 3600000).toISOString().slice(0, 16);
}

export function EventManager() {
  const { state, mutate, busy } = useDemo();
  const [draft, setDraft] = useState<EventItem>(newEvent);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const titleInput = useRef<HTMLInputElement>(null);
  const change = <K extends keyof EventItem>(key: K, value: EventItem[K]) =>
    setDraft((previous) => ({ ...previous, [key]: value }));
  const photoChange = (key: keyof EventPhoto, value: string) =>
    setDraft((previous) => ({
      ...previous,
      image: { ...blankPhoto, ...previous.image, [key]: value },
    }));
  const reset = () => {
    setDraft(newEvent());
    setEditing(false);
    setError("");
  };
  const textField = (
    key:
      | "venue"
      | "address"
      | "access"
      | "fee"
      | "summary"
      | "history"
      | "highlights"
      | "officialUrl"
      | "sourceNote",
    label: string,
    multiline = false,
  ) => (
    <label key={key}>
      {label}
      {multiline ? (
        <textarea
          aria-label={label}
          rows={3}
          maxLength={2000}
          value={draft[key] || ""}
          onChange={(e) => change(key, e.target.value)}
        />
      ) : (
        <input
          aria-label={label}
          type={key === "officialUrl" ? "url" : "text"}
          maxLength={1000}
          value={draft[key] || ""}
          onChange={(e) => change(key, e.target.value)}
        />
      )}
    </label>
  );
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const item = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      image: draft.image?.src.trim() ? draft.image : undefined,
    };
    try {
      validateEvent(item);
    } catch (err) {
      setError((err as Error).message);
      return;
    }
    if (
      await mutate(
        (s) => saveEvent(s, item, editing),
        editing
          ? "イベント情報を更新しました"
          : `${item.status}として保存しました。同じブラウザの利用者画面に反映されます。`,
      )
    )
      reset();
  };
  return (
    <div className="admin-layout">
      <form className="panel event-editor" onSubmit={submit}>
        <h2>
          <Plus size={20} />
          {editing ? "イベントを編集" : "新しいイベント"}
        </h2>
        <label>
          名称
          <input
            ref={titleInput}
            aria-label="名称"
            required
            maxLength={70}
            value={draft.title}
            onChange={(e) => change("title", e.target.value)}
          />
        </label>
        <label>
          説明・参加条件
          <textarea
            aria-label="説明・参加条件"
            required
            maxLength={1000}
            rows={4}
            value={draft.description}
            onChange={(e) => change("description", e.target.value)}
          />
        </label>
        <label>
          日程（日本時間）
          <input
            aria-label="日程（日本時間）"
            type="datetime-local"
            required
            value={draft.date ? localDate(draft.date) : ""}
            onChange={(e) =>
              change("date", e.target.value ? e.target.value + ":00+09:00" : "")
            }
          />
        </label>
        <label>
          イベントの扱い
          <select
            aria-label="イベントの扱い"
            value={draft.infoOnly ? "info" : "booking"}
            onChange={(e) => change("infoOnly", e.target.value === "info")}
          >
            <option value="info">案内のみ（アプリで申込なし）</option>
            <option value="booking">デモ申込あり（架空の催し）</option>
          </select>
        </label>
        {!draft.infoOnly && (
          <label>
            定員
            <input
              aria-label="定員"
              type="number"
              min={1}
              max={100000}
              required
              value={draft.capacity}
              onChange={(e) => change("capacity", Number(e.target.value))}
            />
          </label>
        )}
        {textField("venue", "会場・場所")}
        {textField("summary", "一覧用の短い紹介")}
        {textField("address", "住所")}
        {textField("fee", "参加費")}
        {textField("access", "アクセス", true)}
        {textField("officialUrl", "公式案内URL")}
        <details>
          <summary>由来・見どころ・情報の出典</summary>
          {textField("history", "由来", true)}
          {textField("highlights", "見どころ", true)}
          {textField("sourceNote", "情報の補足・出典", true)}
        </details>
        <details>
          <summary>トップ写真を設定</summary>
          <p className="fine">
            掲載できる利用条件の写真を指定してください。写真がない場合はイベントのイラスト枠を表示します。
          </p>
          <div className="event-editor-actions">
            <button
              type="button"
              onClick={() => change("image", structuredClone(kenkunPhoto))}
            >
              見本写真を使う
            </button>
            <button type="button" onClick={() => change("image", undefined)}>
              写真を外す
            </button>
          </div>
          {draft.image?.src && (
            <EventVisual key={draft.image.src} event={draft} />
          )}
          {(
            [
              ["src", "写真URL"],
              ["alt", "写真の説明"],
              ["author", "撮影者"],
              ["source", "写真の出典URL"],
              ["license", "利用条件"],
              ["licenseUrl", "利用条件URL"],
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                aria-label={label}
                maxLength={1000}
                value={draft.image?.[key] || ""}
                onChange={(e) => photoChange(key, e.target.value)}
              />
            </label>
          ))}
        </details>
        <label className="check-label">
          <input
            type="checkbox"
            checked={!!draft.homeFeatured}
            onChange={(e) => change("homeFeatured", e.target.checked)}
          />
          ホームに掲載
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={!!draft.recommendationDemo}
            onChange={(e) => change("recommendationDemo", e.target.checked)}
          />
          道幸先生のおすすめ枠に掲載（デモ）
        </label>
        <p className="fine">
          ホームには「公開」かつ開催日が今日以降のイベントを、日付順で最大3件表示します。推薦の確認前の見本には「掲載デモ」が表示されます。
        </p>
        <label>
          保存時の状態
          <select
            aria-label="保存時の状態"
            value={draft.status}
            onChange={(e) => change("status", e.target.value as Status)}
          >
            <option>下書き</option>
            <option>公開</option>
            <option>終了</option>
          </select>
        </label>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button className="primary full" disabled={busy}>
          {editing ? "変更を保存" : "このブラウザに保存"}
        </button>
        {editing && (
          <button
            type="button"
            className="full"
            disabled={busy}
            onClick={reset}
          >
            編集をやめる
          </button>
        )}
      </form>
      <div className="event-admin-list">
        <Section title="登録したイベント">
          {state.events.map((event) => (
            <div className="panel admin-item" key={event.id}>
              <span className="tag">
                {event.status}
                {event.homeFeatured ? " · ホーム掲載" : ""}
              </span>
              <h3>{event.title}</h3>
              <p>{event.summary || event.description}</p>
              <label>
                状態
                <select
                  aria-label={`${event.title}の状態`}
                  value={event.status}
                  disabled={busy}
                  onChange={(e) => {
                    const value = e.target.value as Status;
                    void mutate((s) => {
                      const target = s.events.find((x) => x.id === event.id);
                      if (target) target.status = value;
                    }, "公開状態を更新しました");
                  }}
                >
                  <option>下書き</option>
                  <option>公開</option>
                  <option>終了</option>
                </select>
              </label>
              <button
                type="button"
                aria-label={`${event.title}を編集`}
                disabled={busy}
                onClick={() => {
                  setDraft(structuredClone(event));
                  setEditing(true);
                  setError("");
                  titleInput.current?.focus();
                  titleInput.current?.scrollIntoView({
                    block: "center",
                    behavior: "smooth",
                  });
                }}
              >
                内容・写真を編集
              </button>
            </div>
          ))}
        </Section>
        <Link className="button" to="/events">
          利用者画面で確認 <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}
