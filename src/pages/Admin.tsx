import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowUpRight } from "lucide-react";
import { useDemo } from "../context";
import { PageTitle, Notice, Section } from "../components/Primitives";
import { validateItem } from "../services/domain";
import { jstDate } from "../data/seed";
import type { Mission, Reward, EventItem, Status } from "../types";
export default function AdminPage() {
  const { state, mutate, busy } = useDemo();
  const [enabled, setEnabled] = useState(false);
  const [category, setCategory] = useState<"missions" | "events" | "rewards">(
    "missions",
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<Mission["kind"]>("learn");
  const [rewardKind, setRewardKind] = useState<Reward["kind"]>("物品");
  const [points, setPoints] = useState(50);
  const [count, setCount] = useState(1);
  const [start, setStart] = useState(jstDate() + "T00:00");
  const [end, setEnd] = useState(
    jstDate(new Date(Date.now() + 30 * 86400000)) + "T23:59",
  );
  const [date, setDate] = useState(
    jstDate(new Date(Date.now() + 7 * 86400000)) + "T10:00",
  );
  const [cancelable, setCancelable] = useState(true);
  const [status, setStatus] = useState<Status>("下書き");
  const [error, setError] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const base = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      status,
    };
    let item: Mission | Reward | EventItem;
    if (category === "missions")
      item = {
        ...base,
        kind,
        target: count,
        points,
        start: start + ":00+09:00",
        end: end + ":00+09:00",
      };
    else if (category === "events")
      item = {
        ...base,
        date: date + ":00+09:00",
        capacity: count,
        remaining: count,
      };
    else
      item = {
        ...base,
        kind: rewardKind,
        points,
        stock: count,
        date:
          rewardKind === "特別体験"
            ? date.replace("T", " ") + "（日本時間）"
            : "日程指定なし・発送なし",
        cancelable,
      };
    try {
      validateItem(item);
      if (
        category === "rewards" &&
        rewardKind === "特別体験" &&
        !Number.isFinite(Date.parse(date + ":00+09:00"))
      )
        throw Error("体験の日程を入力してください。");
    } catch (e) {
      setError((e as Error).message);
      return;
    }
    if (
      await mutate((s) => {
        if (category === "missions") s.missions.unshift(item as Mission);
        else if (category === "events") s.events.unshift(item as EventItem);
        else s.rewards.unshift(item as Reward);
      }, `${status}として保存しました。同じブラウザの利用者画面に反映されます。`)
    ) {
      setTitle("");
      setDescription("");
    }
  };
  return (
    <>
      <PageTitle
        eyebrow="同じブラウザで、運営を体験。"
        title="運営体験モード"
      />
      <Notice>
        デモ用の切替です。本物の管理者認証・権限管理はありません。変更はこのブラウザだけに反映され、他の利用者へは公開されません。
      </Notice>
      {!enabled ? (
        <div className="panel">
          <h2>運営と利用者の両方を試す</h2>
          <p>
            企画を作り、下書き・公開・終了を切り替えます。公開後は利用者画面から参加・申込・交換ができます。
          </p>
          <button className="primary" onClick={() => setEnabled(true)}>
            デモ運営を開始
          </button>
        </div>
      ) : (
        <>
          <div className="segmented wide">
            {(
              [
                ["missions", "ミッション"],
                ["events", "イベント"],
                ["rewards", "特典"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                className={category === value ? "selected" : ""}
                onClick={() => {
                  setCategory(value);
                  setError("");
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="admin-layout">
            <form className="panel" onSubmit={submit}>
              <h2>
                <Plus size={20} />
                新しい
                {category === "missions"
                  ? "ミッション"
                  : category === "events"
                    ? "イベント"
                    : "特典"}
              </h2>
              <label>
                名称
                <input
                  required
                  maxLength={70}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label>
                説明・参加条件
                <textarea
                  required
                  maxLength={1000}
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
              {category === "missions" && (
                <>
                  <label>
                    達成の種類
                    <select
                      value={kind}
                      onChange={(e) =>
                        setKind(e.target.value as Mission["kind"])
                      }
                    >
                      <option value="learn">学習を記録</option>
                      <option value="collect">御朱印を登録</option>
                      <option value="visit">デモ参拝を記録</option>
                    </select>
                  </label>
                  <div className="field-pair">
                    <label>
                      開始日時（日本時間）
                      <input
                        type="datetime-local"
                        required
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                      />
                    </label>
                    <label>
                      終了日時（日本時間・未満）
                      <input
                        type="datetime-local"
                        required
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                      />
                    </label>
                  </div>
                </>
              )}
              {category === "rewards" && (
                <>
                  <label>
                    特典の種類
                    <select
                      value={rewardKind}
                      onChange={(e) =>
                        setRewardKind(e.target.value as Reward["kind"])
                      }
                    >
                      <option>物品</option>
                      <option>特別体験</option>
                    </select>
                  </label>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={cancelable}
                      onChange={(e) => setCancelable(e.target.checked)}
                    />
                    キャンセル時にポイントを返還する
                  </label>
                </>
              )}
              {(category === "events" ||
                (category === "rewards" && rewardKind === "特別体験")) && (
                <label>
                  日程（日本時間）
                  <input
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>
              )}
              <div className="field-pair">
                <label>
                  {category === "missions"
                    ? "目標数（神様・寺社の数）"
                    : category === "events"
                      ? "定員"
                      : "残数"}
                  <input
                    type="number"
                    min={category === "rewards" ? 0 : 1}
                    max={100000}
                    required
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                  />
                </label>
                {category !== "events" && (
                  <label>
                    {category === "missions" ? "報酬ポイント" : "必要ポイント"}
                    <input
                      type="number"
                      min={1}
                      max={100000}
                      required
                      value={points}
                      onChange={(e) => setPoints(Number(e.target.value))}
                    />
                  </label>
                )}
              </div>
              <label>
                保存時の状態
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Status)}
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
                このブラウザに保存
              </button>
            </form>
            <div>
              <Section title="登録した企画">
                {state[category].map((item) => (
                  <div className="panel admin-item" key={item.id}>
                    <span className="tag">{item.status}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <label>
                      状態
                      <select
                        aria-label={`${item.title}の状態`}
                        value={item.status}
                        disabled={busy}
                        onChange={(e) => {
                          const value = e.target.value as Status;
                          void mutate((s) => {
                            const target = s[category].find(
                              (x) => x.id === item.id,
                            );
                            if (target) target.status = value;
                          }, "公開状態を更新しました");
                        }}
                      >
                        <option>下書き</option>
                        <option>公開</option>
                        <option>終了</option>
                      </select>
                    </label>
                  </div>
                ))}
              </Section>
              <Link
                className="button"
                to={
                  category === "events"
                    ? "/events"
                    : category === "rewards"
                      ? "/rewards"
                      : "/missions"
                }
              >
                利用者画面で確認 <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
