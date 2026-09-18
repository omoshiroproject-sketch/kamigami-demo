import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Flower2,
  Gift,
  ArrowUpRight,
  BookOpen,
  Camera,
  MapPin,
  Ticket,
  Check,
  CalendarDays,
} from "lucide-react";
import { useDemo } from "../context";
import {
  balance,
  active,
  progress,
  joinMission,
  claimMission,
  exchange,
  cancelExchange,
  bookEvent,
  cancelEvent,
} from "../services/domain";
import { PageTitle, Notice, Section, dateTime } from "../components/Primitives";
import {
  EventFeatureCard,
  InformationEventDetail,
  EventVisual,
  EventImageCredit,
} from "../components/EventGuide";
const disclaimer = "デモ・実際の交換や予約は発生しません";
export function MissionsPage() {
  const { state, mutate, busy } = useDemo();
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      <PageTitle
        eyebrow="知ることも、記録することも。"
        title="ご縁のミッション"
      >
        小さな一歩を重ねて、楽しみを広げましょう。
      </PageTitle>
      <div className="points-banner">
        <div>
          <Flower2 />
          <span>あなたのデモ徳ポイント</span>
          <strong>
            {balance(state)}
            <small> 徳</small>
          </strong>
        </div>
        <Link className="button" to="/rewards">
          特典を見てみる <ArrowUpRight size={16} />
        </Link>
      </div>
      <Notice>
        ミッションに参加してから、学習・写真登録・デモ参拝を行ってください。徳ポイントは信仰の深さや神様の評価を表す数値ではありません。
      </Notice>
      <div className="mission-grid">
        {state.missions
          .filter((m) => m.status !== "下書き")
          .map((m) => {
            const done = state.ledger.some((l) => l.id === `mission:${m.id}`);
            const joined = !!state.joined[m.id];
            const count = progress(state, m);
            const enabled = active(m, now);
            const Icon = { learn: BookOpen, collect: Camera, visit: MapPin }[
              m.kind
            ];
            return (
              <article className="mission-card" key={m.id}>
                <div className="toolbar">
                  <span className="icon-circle">
                    <Icon />
                  </span>
                  <span className={done ? "tag filled" : "tag"}>
                    {done
                      ? "達成済み"
                      : !enabled
                        ? "期間外・終了"
                        : joined
                          ? "参加中"
                          : "参加できます"}
                  </span>
                </div>
                <span className="eyebrow">
                  {m.kind === "learn"
                    ? "学び"
                    : m.kind === "collect"
                      ? "図鑑登録"
                      : "デモ参拝"}
                </span>
                <h2>{m.title}</h2>
                <p>{m.description}</p>
                <div className="mission-reward">
                  +{m.points}
                  <small> 徳ポイント</small>
                </div>
                <p className="fine">
                  {dateTime(m.start)} 〜 {dateTime(m.end)} 未満（日本時間）
                </p>
                <div className="toolbar">
                  <span>
                    進捗 {Math.min(count, m.target)} / {m.target}
                  </span>
                  {done && <Check size={18} />}
                </div>
                <div className="progress-track">
                  <i
                    style={{
                      width: `${Math.min(100, (count / m.target) * 100)}%`,
                    }}
                  />
                </div>
                <div className="stack">
                  {!joined && !done ? (
                    <button
                      className="primary"
                      disabled={busy || !enabled}
                      onClick={() =>
                        mutate(
                          (s) => joinMission(s, m.id),
                          "ミッションに参加しました",
                        )
                      }
                    >
                      ミッションに参加
                    </button>
                  ) : !done ? (
                    <>
                      <Link
                        className="button"
                        to={
                          m.kind === "learn"
                            ? "/gods"
                            : m.kind === "collect"
                              ? "/photos/new"
                              : "/search"
                        }
                      >
                        {m.kind === "learn"
                          ? "神様の紹介を読む"
                          : m.kind === "collect"
                            ? "御朱印を登録する"
                            : "寺社からデモ参拝を記録"}
                      </Link>
                      <button
                        className="primary"
                        disabled={busy || !enabled || count < m.target}
                        onClick={() =>
                          mutate(
                            (s) => claimMission(s, m.id),
                            `${m.points}徳ポイントを受け取りました`,
                          )
                        }
                      >
                        達成してポイントを受け取る
                      </button>
                    </>
                  ) : (
                    <span className="completed-label">
                      ポイント受け取り済み
                    </span>
                  )}
                </div>
              </article>
            );
          })}
      </div>
      <Link to="/points" className="inline-link">
        ポイント履歴を確認する <ArrowUpRight size={16} />
      </Link>
    </>
  );
}
export function PointsPage() {
  const { state } = useDemo();
  return (
    <>
      <PageTitle eyebrow="体験を重ねた、足あと。" title="徳ポイントの履歴" />
      <div className="balance-card">
        <Flower2 size={32} />
        <p>利用できるデモポイント</p>
        <strong>
          {balance(state)}
          <small> 徳</small>
        </strong>
        <Link className="button" to="/rewards">
          特典と交換する
        </Link>
      </div>
      <Notice>初期残高は300徳。実際の金銭価値・換金・決済はありません。</Notice>
      <div className="ledger">
        {[...state.ledger].reverse().map((e) => (
          <div key={e.id}>
            <div>
              <b>{e.label}</b>
              <small>{dateTime(e.at)}（日本時間）</small>
            </div>
            <strong className={e.amount > 0 ? "positive" : ""}>
              {e.amount > 0 ? "+" : ""}
              {e.amount}
              <small> 徳</small>
            </strong>
          </div>
        ))}
      </div>
    </>
  );
}
export function RewardsPage() {
  const { state, mutate, busy } = useDemo();
  const [review, setReview] = useState<{
    id: string;
    requestId: string;
  } | null>(null);
  const reward = state.rewards.find((r) => r.id === review?.id);
  return (
    <>
      <PageTitle eyebrow="次の楽しみを、選びましょう。" title="ご縁の特典" />
      <Notice>{disclaimer}。配送先は収集しません。</Notice>
      <div className="toolbar section-heading">
        <span>
          利用可能 <b className="point-number">{balance(state)}</b> 徳
        </span>
        <Link to="/points">
          ポイント履歴 <ArrowUpRight size={15} />
        </Link>
      </div>
      {review && reward && (
        <div
          className="confirm-panel"
          role="region"
          aria-label="交換内容の確認"
        >
          <h2>交換内容の確認</h2>
          <Notice>{disclaimer}</Notice>
          <h3>{reward.title}</h3>
          <p>
            {reward.points}徳 · 残数{reward.stock} · {reward.date}
          </p>
          <p>交換後の残高：{balance(state) - reward.points}徳</p>
          <p>
            {reward.cancelable
              ? "キャンセルすると一度だけポイントと残数が戻ります。"
              : "この物品のデモ交換はキャンセルできません。"}
            追加費用はありません。
          </p>
          <div className="actions">
            <button
              className="primary"
              disabled={
                busy ||
                reward.stock < 1 ||
                balance(state) < reward.points ||
                reward.status !== "公開"
              }
              onClick={async () => {
                if (
                  await mutate(
                    (s) => exchange(s, reward.id, review.requestId),
                    "デモ交換が完了しました。交換履歴で確認できます。",
                  )
                )
                  setReview(null);
              }}
            >
              デモ交換を確定
            </button>
            <button disabled={busy} onClick={() => setReview(null)}>
              やめる
            </button>
          </div>
        </div>
      )}
      <div className="reward-grid">
        {state.rewards
          .filter((r) => r.status !== "下書き")
          .map((r, i) => (
            <article className="reward-card" key={r.id}>
              <div className={`reward-art art-${i % 3}`}>
                <img
                  src={r.kind === "物品" ? "/gift.svg" : "/shrine.svg"}
                  alt="特典のイメージイラスト"
                />
                <span>{r.kind}</span>
              </div>
              <div className="reward-body">
                <h2>{r.title}</h2>
                <p>{r.description}</p>
                <div className="toolbar">
                  <strong className="point-number">
                    {r.points}
                    <small> 徳</small>
                  </strong>
                  <span className="tag">
                    残り {r.stock}
                    {r.kind === "物品" ? "個" : "枠"}
                  </span>
                </div>
                <p className="fine">{r.date}</p>
                <button
                  className="primary full"
                  disabled={
                    busy ||
                    r.status !== "公開" ||
                    r.stock < 1 ||
                    balance(state) < r.points
                  }
                  onClick={() => {
                    setReview({ id: r.id, requestId: crypto.randomUUID() });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {r.status !== "公開"
                    ? "受付終了"
                    : r.stock < 1
                      ? "残数なし"
                      : balance(state) < r.points
                        ? "ポイントが不足しています"
                        : "交換内容を確認"}
                </button>
              </div>
            </article>
          ))}
      </div>
      <Section title="交換の記録">
        {!state.redemptions.length ? (
          <p className="empty">まだ交換の記録はありません。</p>
        ) : (
          [...state.redemptions].reverse().map((r) => (
            <div className="panel exchange-history" key={r.id}>
              <span className="tag">
                {r.cancelled ? "キャンセル済み・返還済み" : "デモ交換完了"}
              </span>
              <h3>{r.title}</h3>
              <p>
                {r.points}徳 · {r.date}
              </p>
              <small>受付番号 DEMO-{r.id.slice(0, 8)}</small>
              {r.cancelable && !r.cancelled && (
                <button
                  disabled={busy}
                  onClick={() =>
                    mutate(
                      (s) => cancelExchange(s, r.id),
                      "キャンセルし、ポイントを返還しました",
                    )
                  }
                >
                  キャンセルして返還
                </button>
              )}
            </div>
          ))
        )}
      </Section>
    </>
  );
}
export function EventsPage() {
  const { state } = useDemo();
  return (
    <>
      <PageTitle eyebrow="ご縁を深める、ひととき。" title="開催イベント" />
      <Notice>
        実在する祭典の紹介と、架空イベントの申込体験を掲載しています。アプリから実際の予約はできません。
      </Notice>
      <div className="event-list">
        {state.events
          .filter((e) => e.status !== "下書き")
          .map((e) => (
            <EventFeatureCard event={e} key={e.id} />
          ))}
      </div>
      <Link className="button" to="/tickets">
        <Ticket size={18} />
        参加券を確認
      </Link>
    </>
  );
}
export function EventDetail() {
  const { id } = useParams();
  const { state, mutate, busy } = useDemo();
  const [requestId, setRequestId] = useState(crypto.randomUUID());
  const event = state.events.find((e) => e.id === id && e.status !== "下書き");
  if (!event) return <PageTitle title="イベントは公開されていません" />;
  if (event.infoOnly) return <InformationEventDetail event={event} />;
  const ticket = state.tickets.find((t) => t.eventId === id && !t.cancelled);
  const open = event.status === "公開" && Date.parse(event.date) > Date.now();
  return (
    <>
      <PageTitle eyebrow="デモのイベント" title={event.title} />
      <Notice>{disclaimer}</Notice>
      <div className="panel">
        {event.image ? (
          <>
            <EventVisual key={event.image.src} event={event} eager />
            <EventImageCredit event={event} />
          </>
        ) : (
          <div className="event-detail-art">
            <CalendarDays size={50} />
          </div>
        )}
        <dl className="detail-list">
          <dt>日程</dt>
          <dd>{dateTime(event.date)}（日本時間）</dd>
          <dt>定員</dt>
          <dd>
            {event.capacity}名 · 残り{event.remaining}席
          </dd>
          <dt>会場・主催</dt>
          <dd>{event.venue || "架空のデモ会場・デモ運営"}</dd>
          <dt>参加費</dt>
          <dd>{event.fee || "無料（デモ）"}</dd>
        </dl>
        <p className="prose">{event.description}</p>
        {ticket ? (
          <Link className="button primary" to="/tickets">
            申込済み・参加券を見る
          </Link>
        ) : (
          <button
            className="primary"
            disabled={busy || !open || event.remaining < 1}
            onClick={async () => {
              if (
                await mutate(
                  (s) => bookEvent(s, event.id, requestId),
                  "デモ申込が完了しました。参加券をご確認ください。",
                )
              )
                setRequestId(crypto.randomUUID());
            }}
          >
            {!open
              ? "受付終了"
              : event.remaining < 1
                ? "満席です"
                : "1名でデモ申込"}
          </button>
        )}
      </div>
    </>
  );
}
export function TicketsPage() {
  const { state, mutate, busy } = useDemo();
  return (
    <>
      <PageTitle eyebrow="次の楽しみを、手元に。" title="わたしの参加券" />
      <Notice>
        この参加券はデモです。現地での入場や特別立入には使えません。
      </Notice>
      {!state.tickets.length && (
        <div className="empty">
          <Ticket size={36} />
          <p>まだ参加券はありません。</p>
          <Link className="button primary" to="/events">
            イベントを見てみる
          </Link>
        </div>
      )}
      {state.tickets.map((t) => (
        <div className="ticket" key={t.id}>
          <div>
            <span className="eyebrow">DEMO TICKET</span>
            <h2>{t.title}</h2>
            <p>{dateTime(t.date)}（日本時間）</p>
            <b>{t.cancelled ? "キャンセル済み" : "デモ申込済み・1名"}</b>
            <p className="fine">番号 DEMO-{t.id.slice(0, 8)}</p>
            {!t.cancelled && (
              <button
                disabled={busy || Date.parse(t.date) <= Date.now()}
                onClick={() =>
                  mutate(
                    (s) => cancelEvent(s, t.id),
                    "デモ申込をキャンセルしました",
                  )
                }
              >
                申込をキャンセル
              </button>
            )}
          </div>
          <div className="ticket-stub">
            <Flower2 size={40} />
            <span>
              体験用
              <br />
              入場不可
            </span>
          </div>
        </div>
      ))}
    </>
  );
}
