import { useState, type FormEvent } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Flower2,
  Heart,
  LockKeyhole,
  MapPin,
  Plus,
  Sprout,
} from "lucide-react";
import { useDemo } from "../context";
import { gods, shrines, shrineById } from "../data/master";
import { jstDate } from "../data/seed";
import { PageTitle, Section } from "../components/Primitives";
import {
  gratitudeLabels,
  gratitudeSeries,
  journeyProgress,
  milestones,
  orderedEntries,
  pledgeStatuses,
  saveMindEntry,
  validateMindEntry,
} from "../services/mind";
import type { MindEntry, PledgeStatus } from "../types";

export function MindSummary() {
  const { state } = useDemo();
  const progress = journeyProgress(state.photos);
  const latest = orderedEntries(state.mindEntries)[0];
  return (
    <section className="mind-home">
      <div className="mind-home-heading">
        <span className="eyebrow">SHINTO × MINDSET</span>
        <h2>ご縁を、心の変化へ。</h2>
        <p>誓いを立てる。感謝を見つける。日々の自分を振り返る。</p>
      </div>
      <div className="mind-home-grid">
        <Link className="mind-home-record" to="/mind">
          <span className="mind-mark">
            <Flower2 size={30} />
          </span>
          <div>
            <small>わたしの心の記録</small>
            <strong>
              {state.mindEntries.length}
              <span> の振り返り</span>
            </strong>
            <p>
              {latest
                ? `最近の記録 ${latest.date.replaceAll("-", ".")}`
                : "今の気持ちを、一言から。"}
            </p>
          </div>
          <ArrowUpRight size={22} />
        </Link>
        <Link className="mind-home-roadmap" to="/roadmap">
          <div>
            <small>心を育てるロードマップ</small>
            <strong>
              {progress.count}
              <span> / 50か所</span>
            </strong>
            <p>
              {progress.next
                ? `「${progress.next.title}」まで、あと${progress.next.count - progress.count}か所`
                : "4つの節目を、これからの毎日へ。"}
            </p>
          </div>
          <div className="mini-roadmap" aria-hidden="true">
            {milestones.map((m) => (
              <span
                key={m.count}
                className={progress.count >= m.count ? "reached" : ""}
              >
                {m.count}
              </span>
            ))}
          </div>
          <ChevronRight size={20} />
        </Link>
      </div>
      <Link className="button primary" to="/mind/new">
        <Plus size={17} />
        今日の感謝を残す
      </Link>
    </section>
  );
}

function GratitudeChart({ entries }: { entries: MindEntry[] }) {
  const days = gratitudeSeries(entries);
  if (!days.length)
    return (
      <div className="mind-chart-empty">
        <Flower2 size={35} />
        <h3>心のうつろいを、少しずつ。</h3>
        <p>記録を残すと、感謝の実感がここにつながります。</p>
        <Link className="text-link" to="/mind/new">
          最初の記録を書く <ArrowUpRight size={16} />
        </Link>
      </div>
    );
  const points = days.map((day, i) => ({
    ...day,
    x: days.length === 1 ? 260 : 42 + (i * 438) / (days.length - 1),
    y: 152 - (day.value - 1) * 29,
  }));
  return (
    <div className="mind-chart">
      <svg
        viewBox="0 0 520 205"
        role="img"
        aria-label="感謝の実感の推移。詳しい日別の値は下の表で確認できます。"
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <g key={value}>
            <line
              x1="36"
              x2="490"
              y1={152 - (value - 1) * 29}
              y2={152 - (value - 1) * 29}
              stroke="#d8d6c9"
              strokeDasharray="3 5"
            />
            <text
              x="17"
              y={157 - (value - 1) * 29}
              fill="#767666"
              fontSize="12"
            >
              {value}
            </text>
          </g>
        ))}
        {points.length > 1 && (
          <>
            <polygon
              points={`${points[0].x},152 ${points.map((p) => `${p.x},${p.y}`).join(" ")} ${points.at(-1)!.x},152`}
              fill="#d1a878"
              opacity=".15"
            />
            <polyline
              points={points.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#a95335"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </>
        )}
        {points.map((p) => (
          <g key={p.date}>
            <circle
              cx={p.x}
              cy={p.y}
              r="5"
              fill="#a95335"
              stroke="#fffdf5"
              strokeWidth="2"
            />
            <title>
              {p.date}：{p.value} / 5（{p.count}件の平均）
            </title>
          </g>
        ))}
        <text x="42" y="185" fontSize="11" fill="#767666">
          {days[0].date}
        </text>
        {days.length > 1 && (
          <text x="480" y="185" textAnchor="end" fontSize="11" fill="#767666">
            {days.at(-1)!.date}
          </text>
        )}
      </svg>
      <p className="fine">
        感謝の実感：1〜5の自己評価。同じ日の複数記録は平均し、最近の記録がある14日分を表示します。
      </p>
      <details className="chart-data">
        <summary>日別の値を読む</summary>
        <table>
          <caption>感謝の実感の記録</caption>
          <thead>
            <tr>
              <th>日付</th>
              <th>自己評価の平均</th>
              <th>記録数</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.date}>
                <td>{d.date}</td>
                <td>{d.value} / 5</td>
                <td>{d.count}件</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

export function MindPage() {
  const { state } = useDemo();
  const [filter, setFilter] = useState("all");
  const entries = orderedEntries(state.mindEntries);
  const filtered = entries.filter(
    (e) => filter === "all" || (filter === "pledge" ? !!e.pledge : !e.shrineId),
  );
  const days = new Set(entries.map((e) => e.date)).size;
  const practiced = entries.filter(
    (e) => e.pledge && e.pledgeStatus === "実践できた",
  ).length;
  return (
    <>
      <div className="title-with-action">
        <PageTitle eyebrow="MIND LOG / 自分と向き合う時間" title="心の記録">
          参拝で生まれた誓いも、日常で見つけた感謝も。
        </PageTitle>
        <Link className="button primary" to="/mind/new">
          <Plus size={17} />
          心の記録を書く
        </Link>
      </div>
      <div className="mind-intro">
        <Flower2 size={30} />
        <div>
          <h2>感謝のエネルギーを、振り返る。</h2>
          <p>
            今日の自分が感じたことを、そのままに。数値はあなた自身の実感で、心の成長を採点するものではありません。
          </p>
        </div>
      </div>
      <div className="mind-stats">
        <div>
          <strong>{entries.length}</strong>
          <span>心の記録</span>
        </div>
        <div>
          <strong>{days}</strong>
          <span>振り返った日</span>
        </div>
        <div>
          <strong>{practiced}</strong>
          <span>実践できた誓い</span>
        </div>
      </div>
      <Section title="感謝のうつろい">
        <GratitudeChart entries={entries} />
      </Section>
      <Link className="mind-roadmap-link" to="/roadmap">
        <Sprout size={24} />
        <div>
          <b>知る、深める、日常へ。</b>
          <small>10・22・33・50か所の節目と、これからの宣言</small>
        </div>
        <ArrowUpRight size={20} />
      </Link>
      <Section title="わたしのタイムライン">
        <div className="mind-filters" aria-label="心の記録の絞り込み">
          {[
            ["all", "すべて"],
            ["pledge", "誓いのある記録"],
            ["daily", "日常の感謝"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={filter === value ? "primary" : ""}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
        {!filtered.length && (
          <div className="empty">
            <p>
              {entries.length
                ? "この条件に合う記録はまだありません。"
                : "まだ記録はありません。感謝・誓い・気づきのどれか一つから始められます。"}
            </p>
            <Link to="/mind/new" className="button">
              一言、残してみる
            </Link>
          </div>
        )}
        <div className="mind-timeline">
          {filtered.map((entry) => (
            <article className="mind-entry" key={entry.id}>
              <div className="mind-entry-head">
                <time dateTime={entry.date}>
                  {entry.date.replaceAll("-", ".")}
                </time>
                <span className="mind-gratitude">
                  <Flower2 size={15} />
                  感謝の実感 {entry.gratitude} / 5
                </span>
              </div>
              <h3>
                {entry.shrineId ? (
                  <Link to={`/shrines/${entry.shrineId}`}>
                    <MapPin size={15} />
                    {shrineById(entry.shrineId)?.name || "寺社の記録"}
                  </Link>
                ) : (
                  "日常のなかの感謝"
                )}
              </h3>
              {entry.shrineId && shrineById(entry.shrineId)?.fictional && (
                <span className="tag">架空寺社でのデモ記録</span>
              )}
              {entry.gratitudeText && (
                <div className="mind-entry-note">
                  <span>感謝したこと</span>
                  <p>{entry.gratitudeText}</p>
                </div>
              )}
              {entry.pledge && (
                <div className="mind-pledge">
                  <div>
                    <span>わたしの誓い</span>
                    <b className="pledge-status">{entry.pledgeStatus}</b>
                  </div>
                  <p>{entry.pledge}</p>
                  {entry.nextStep && <small>次の一歩：{entry.nextStep}</small>}
                  {entry.reflection && (
                    <p className="pledge-reflection">
                      実践の振り返り：{entry.reflection}
                    </p>
                  )}
                </div>
              )}
              {!entry.pledge && entry.nextStep && (
                <div className="mind-entry-note">
                  <span>次の一歩</span>
                  <p>{entry.nextStep}</p>
                </div>
              )}
              {entry.insight && (
                <div className="mind-entry-note">
                  <span>心の気づき</span>
                  <p>{entry.insight}</p>
                </div>
              )}
              <Link className="mind-edit" to={`/mind/${entry.id}/edit`}>
                {entry.pledge ? "誓いを振り返る・記録を編集" : "記録を編集"}
                <ChevronRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </Section>
      <p className="mind-privacy">
        <LockKeyhole size={15} />
        このブラウザ内に保存され、交流ひろばには公開されません。共用端末では他の人も閲覧できます。クラウド同期はありません。
      </p>
    </>
  );
}

export function MindForm() {
  const { state } = useDemo();
  const { id } = useParams();
  const [params] = useSearchParams();
  const existing = state.mindEntries.find((e) => e.id === id);
  if (id && !existing)
    return (
      <>
        <PageTitle title="この心の記録は見つかりません" />
        <Link to="/mind">心の記録へ戻る</Link>
      </>
    );
  return (
    <MindEditor
      key={id || params.toString()}
      existing={existing}
      shrineId={params.get("shrine") || ""}
      date={params.get("date") || ""}
      prompt={params.get("prompt") || ""}
    />
  );
}
function MindEditor({
  existing,
  shrineId,
  date,
  prompt,
}: {
  existing?: MindEntry;
  shrineId: string;
  date: string;
  prompt: string;
}) {
  const { mutate, busy } = useDemo();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<MindEntry>(() =>
    existing
      ? { ...existing }
      : {
          id: crypto.randomUUID(),
          shrineId: shrineById(shrineId) ? shrineId : "",
          date:
            /^\d{4}-\d{2}-\d{2}$/.test(date) && date <= jstDate()
              ? date
              : jstDate(),
          gratitude: 3,
          gratitudeText: "",
          pledge: "",
          nextStep: "",
          insight: "",
          pledgeStatus: "育てている",
          reflection: "",
          createdAt: new Date().toISOString(),
          updatedAt: "",
        },
  );
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const change = <K extends keyof MindEntry>(key: K, value: MindEntry[K]) =>
    setEntry((e) => ({ ...e, [key]: value }));
  const shrine = shrineById(entry.shrineId);
  const selectedPrompt = milestones.find(
    (m) => String(m.count) === prompt,
  )?.question;
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const draft = { ...entry, updatedAt: new Date().toISOString() };
    try {
      // Validate before mutation, so field errors remain beside the form.
      validateMindEntry(draft);
      if (
        await mutate(
          (s) => saveMindEntry(s, draft, !!existing),
          "心の記録を保存しました",
        )
      )
        navigate("/mind", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "入力内容を確認してください。");
    }
  };
  return (
    <>
      <PageTitle
        eyebrow="A MOMENT FOR YOURSELF / いまの自分に耳を澄ます"
        title={existing ? "心の記録を振り返る" : "心の記録を書く"}
      >
        きれいにまとめなくて大丈夫。感謝・誓い・気づきのどれかを、一言。
      </PageTitle>
      {selectedPrompt && (
        <div className="reflection-prompt">
          <Sprout size={20} />
          <p>{selectedPrompt}</p>
        </div>
      )}
      <form className="mind-form" onSubmit={save}>
        <section className="mind-form-section">
          <span className="mind-step">01 / 場所と時間</span>
          <div className="mind-form-columns">
            <label>
              記録日
              <input
                type="date"
                required
                max={jstDate()}
                value={entry.date}
                onChange={(e) => change("date", e.target.value)}
              />
            </label>
            <label>
              記録する場所
              <select
                value={entry.shrineId}
                onChange={(e) => change("shrineId", e.target.value)}
              >
                <option value="">日常の感謝（寺社を選ばない）</option>
                {shrines.map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.name} · {s.region}
                    {s.fictional ? "（架空）" : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {shrine && (
            <div className="mind-place-context">
              <MapPin size={18} />
              <div>
                <strong>{shrine.name}</strong>
                <p>
                  {shrine.kind === "寺院" ? "ご本尊" : "ご祭神"}：
                  {shrine.gods
                    .map((id) => gods.find((g) => g.id === id)?.name)
                    .join("・")}
                </p>
                {shrine.fictional && (
                  <small>架空寺社を使ったデモ記録です。</small>
                )}
              </div>
            </div>
          )}
        </section>
        <section className="mind-form-section">
          <span className="mind-step">02 / 感謝を見つける</span>
          <fieldset className="gratitude-field">
            <legend>いま、どれくらい感謝を感じていますか？</legend>
            <div className="gratitude-scale">
              {gratitudeLabels.map((label, index) => (
                <label
                  key={label}
                  className={entry.gratitude === index + 1 ? "selected" : ""}
                >
                  <input
                    type="radio"
                    name="gratitude"
                    value={index + 1}
                    checked={entry.gratitude === index + 1}
                    onChange={() => change("gratitude", index + 1)}
                  />
                  <Flower2 size={22} />
                  <b>{index + 1}</b>
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <p className="fine">
              自分の実感を選びます。無理に感謝を探さなくても大丈夫です。
            </p>
          </fieldset>
          <label>
            感謝したこと
            <textarea
              rows={3}
              maxLength={1000}
              placeholder="例：忙しい朝、家族がかけてくれた一言。"
              value={entry.gratitudeText}
              onChange={(e) => change("gratitudeText", e.target.value)}
            />
          </label>
        </section>
        <section className="mind-form-section">
          <span className="mind-step">03 / 自分の誓いを言葉に</span>
          <label>
            わたしの誓い（宣言）
            <textarea
              rows={3}
              maxLength={1000}
              placeholder="例：大切な人に、感謝を言葉で伝えます。"
              value={entry.pledge}
              onChange={(e) => change("pledge", e.target.value)}
            />
          </label>
          <label>
            日常で踏み出す、小さな一歩
            <input
              maxLength={1000}
              placeholder="例：今夜、ありがとうのメッセージを送る。"
              value={entry.nextStep}
              onChange={(e) => change("nextStep", e.target.value)}
            />
          </label>
          {entry.pledge.trim() && (
            <div className="pledge-review">
              <label>
                誓いの現在地
                <select
                  value={entry.pledgeStatus}
                  onChange={(e) =>
                    change("pledgeStatus", e.target.value as PledgeStatus)
                  }
                >
                  {pledgeStatuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                実践して感じたこと
                <textarea
                  rows={3}
                  maxLength={1000}
                  placeholder="後日、できたことや気づいたことを振り返れます。"
                  value={entry.reflection}
                  onChange={(e) => change("reflection", e.target.value)}
                />
              </label>
            </div>
          )}
        </section>
        <section className="mind-form-section">
          <span className="mind-step">04 / 心の気づき</span>
          <label>
            気づいたこと・今の気持ち
            <textarea
              rows={4}
              maxLength={1000}
              placeholder="参拝の前後で変わった気持ちや、今日の自分のこと。"
              value={entry.insight}
              onChange={(e) => change("insight", e.target.value)}
            />
          </label>
        </section>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="actions">
          <button type="submit" className="primary" disabled={busy}>
            {busy ? "保存しています…" : "心の記録を保存"}
          </button>
          <Link className="button" to="/mind">
            一覧へ戻る
          </Link>
        </div>
        <p className="mind-privacy">
          <LockKeyhole size={15} />
          このブラウザ内に保存します。位置情報を取得せず、実際の来訪確認は行いません。
        </p>
      </form>
      {existing && (
        <div className="mind-delete">
          <button className="danger" onClick={() => setConfirm(true)}>
            この心の記録を削除
          </button>
          {confirm && (
            <div
              className="confirm-panel"
              role="group"
              aria-label="心の記録の削除確認"
            >
              <h3>この心の記録を削除しますか？</h3>
              <p>
                誓い・感謝・振り返りも削除され、元に戻せません。御朱印写真は残ります。
              </p>
              <button
                className="danger"
                disabled={busy}
                onClick={async () => {
                  if (
                    await mutate((s) => {
                      s.mindEntries = s.mindEntries.filter(
                        (e) => e.id !== existing.id,
                      );
                    }, "心の記録を削除しました")
                  )
                    navigate("/mind", { replace: true });
                }}
              >
                削除を確定
              </button>
              <button onClick={() => setConfirm(false)}>やめる</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export function RoadmapPage() {
  const { state } = useDemo();
  const progress = journeyProgress(state.photos);
  const [selected, setSelected] = useState<number>(
    () => progress.reached.at(-1)?.count || 10,
  );
  const milestone = milestones.find((m) => m.count === selected)!;
  const unlocked = progress.count >= selected;
  return (
    <>
      <PageTitle
        eyebrow="MIND JOURNEY / 心を育てる4つの節目"
        title="心の成長ロードマップ"
      >
        御朱印を「集める」から、貴方が「整う」。
      </PageTitle>
      <div className="roadmap-intro">
        <div>
          <span className="eyebrow">御朱印を登録した寺社</span>
          <strong>
            {progress.count}
            <span> / 50か所</span>
          </strong>
          <p>
            {progress.next
              ? `次は「${progress.next.title}」。あと${progress.next.count - progress.count}か所のご縁。`
              : "4つの節目を通り、これからの毎日へ。"}
          </p>
        </div>
        <div className="roadmap-emblem" aria-hidden="true">
          <Sprout size={46} />
          <span>整</span>
        </div>
      </div>
      <div
        className="roadmap-track"
        role="progressbar"
        aria-label="御朱印登録の寺社数"
        aria-valuenow={Math.min(progress.count, 50)}
        aria-valuemin={0}
        aria-valuemax={50}
      >
        <span style={{ width: `${progress.percent}%` }} />
      </div>
      <p className="fine">
        同じ寺社は1か所。サンプル画像・架空寺社を含むデモ上の登録数です。心の記録やデモ参拝ボタンでは増えません。御朱印の削除・寺社の変更で再計算します。
      </p>
      <div className="milestone-list">
        {milestones.map((m) => (
          <button
            key={m.count}
            className={`milestone ${selected === m.count ? "selected" : ""} ${progress.count >= m.count ? "reached" : ""}`}
            aria-pressed={selected === m.count}
            onClick={() => setSelected(m.count)}
          >
            <span className="milestone-number">
              {m.count}
              <small>か所</small>
            </span>
            <div>
              <strong>{m.title}</strong>
              <span>{m.theme}</span>
            </div>
            <small className="milestone-state">
              {progress.count >= m.count ? (
                <>
                  <Check size={14} />
                  解放済み
                </>
              ) : (
                "内容を見る"
              )}
            </small>
          </button>
        ))}
      </div>
      <p className="roadmap-demo">
        デモ収録は{shrines.length}
        寺社です。33・50か所の内容も、下のプレビューで体験できます。表示を切り替えても実績は増えません。
      </p>
      <section
        className="milestone-content"
        aria-label={`${milestone.title}のステージ内容`}
      >
        <div className="milestone-content-heading">
          <span className="eyebrow">
            STAGE {milestones.findIndex((m) => m.count === selected) + 1} /{" "}
            {selected}か所
          </span>
          <span className={unlocked ? "tag filled" : "tag"}>
            {unlocked ? "解放済み" : "解放前のプレビュー"}
          </span>
          <h2>
            {milestone.title}
            <small>{milestone.theme}</small>
          </h2>
          <p>{milestone.detail}</p>
        </div>
        {selected === 10 && (
          <>
            <h3>ご祭神を知る、最初のミニ解説</h3>
            <div className="mind-lesson-grid">
              {gods
                .filter((g) => ["amaterasu", "toyouke"].includes(g.id))
                .map((g) => (
                  <article key={g.id}>
                    <Flower2 size={25} />
                    <h4>{g.name}</h4>
                    <span>{g.reading}</span>
                    <p>{g.description}</p>
                    <a href={g.source} target="_blank" rel="noreferrer">
                      公式の出典 <ArrowUpRight size={13} />
                    </a>
                    <Link to={`/gods/${g.id}`}>
                      関係する神社と学びのノートへ <ChevronRight size={15} />
                    </Link>
                  </article>
                ))}
            </div>
            <p className="fine">
              基本の寺社情報・ご祭神図鑑は、登録数にかかわらずいつでも読めます。
            </p>
          </>
        )}
        {selected === 22 && (
          <>
            <h3>学んだことを、自分の言葉へ。</h3>
            <div className="reflection-steps">
              <article>
                <span>一</span>
                <h4>物語に触れる</h4>
                <p>
                  訪れた寺社のご祭神や由緒を読み、心に残った言葉を一つ選ぶ。
                </p>
              </article>
              <article>
                <span>二</span>
                <h4>自分に問いかける</h4>
                <p>
                  いまの暮らしで大切にしたいこと、変えていきたいことは何だろう。
                </p>
              </article>
              <article>
                <span>三</span>
                <h4>誓いと一歩を決める</h4>
                <p>
                  「私はこう行動する」と宣言し、明日できる小さな行動にする。
                </p>
              </article>
            </div>
            <p className="fine">
              ここでの問いかけはアプリ独自の内省ワークです。神様の性質や教義を断定するものではありません。
            </p>
          </>
        )}
        {selected === 33 && (
          <>
            <h3>日常の小さな感謝を、続ける。</h3>
            <GratitudeChart entries={state.mindEntries} />
            <div className="habit-note">
              <Heart size={22} />
              <div>
                <b>以前の誓いを、今の自分で振り返る。</b>
                <p>
                  タイムラインから「誓いを振り返る」を開き、現在地や実践して感じたことを書き足せます。
                </p>
                <Link className="text-link" to="/mind">
                  心のタイムラインへ <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </>
        )}
        {selected === 50 && (
          <>
            <h3>人生のビジョン・マニフェスト</h3>
            <p>
              これまでの感謝や誓いを見返して、これからの生き方を言葉に。自分の軸から、周囲や未来へ届けたいことを考えます。
            </p>
            <ManifestoEditor />
            <p className="fine">
              達成前でも下書きを保存できます。「覚醒」はこのロードマップのステージ名です。
            </p>
          </>
        )}
        {selected !== 50 && (
          <div className="stage-question">
            <span>今日の問い</span>
            <p>{milestone.question}</p>
            <Link
              className="button primary"
              to={`/mind/new?prompt=${selected}`}
            >
              <Plus size={16} />
              この問いから記録する
            </Link>
          </div>
        )}
      </section>
      <p className="fine">
        数は振り返りのきっかけです。参拝の数だけで、心の成長や人の価値を測るものではありません。
      </p>
    </>
  );
}

function ManifestoEditor() {
  const { state, mutate, busy } = useDemo();
  const [draft, setDraft] = useState(() => ({ ...state.manifesto }));
  const [error, setError] = useState("");
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.declaration.trim()) {
      setError("これからの宣言を、一言入力してください。");
      return;
    }
    setError("");
    const next = {
      values: draft.values.trim(),
      contribution: draft.contribution.trim(),
      declaration: draft.declaration.trim(),
      updatedAt: new Date().toISOString(),
    };
    if (
      await mutate((s) => {
        s.manifesto = next;
      }, "これからの宣言を保存しました")
    )
      setDraft(next);
  };
  return (
    <form className="manifesto-form" onSubmit={save}>
      <label>
        私が大切にしたい価値観
        <textarea
          rows={3}
          maxLength={1000}
          value={draft.values}
          onChange={(e) => setDraft({ ...draft, values: e.target.value })}
          placeholder="自分の軸になる、言葉や生き方。"
        />
      </label>
      <label>
        周囲や社会に届けたいこと
        <textarea
          rows={3}
          maxLength={1000}
          value={draft.contribution}
          onChange={(e) => setDraft({ ...draft, contribution: e.target.value })}
          placeholder="誰に、どんな良い変化を届けたいですか？"
        />
      </label>
      <label>
        これからの宣言
        <textarea
          required
          rows={4}
          maxLength={1000}
          value={draft.declaration}
          onChange={(e) => setDraft({ ...draft, declaration: e.target.value })}
          placeholder="私は、これから…。"
        />
      </label>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button className="primary" disabled={busy}>
        {busy ? "保存しています…" : "これからの宣言を保存"}
      </button>
      {draft.updatedAt && (
        <p className="fine">
          最終保存：
          {new Date(draft.updatedAt).toLocaleString("ja-JP", {
            timeZone: "Asia/Tokyo",
          })}
          （日本時間）
        </p>
      )}
      <p className="mind-privacy">
        <LockKeyhole size={14} />
        このブラウザ内だけの、あなたの宣言です。
      </p>
    </form>
  );
}
