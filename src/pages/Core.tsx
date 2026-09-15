import { lazy, Suspense, useMemo, useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  Plus,
  Heart,
  MapPin,
  Search,
  LocateFixed,
  BookOpen,
  Flower2,
  ChevronRight,
  CalendarDays,
  MessageCircle,
  Check,
} from "lucide-react";
import { useDemo } from "../context";
import {
  shrines,
  gods,
  shrineById,
  normalize,
  CHECKED,
  GOD_SOURCE,
} from "../data/master";
import { addressMatcher } from "../services/address";
import {
  Notice,
  Section,
  PageTitle,
  ShrineCard,
  PhotoImage,
  dateTime,
} from "../components/Primitives";
const MapView = lazy(() => import("../components/MapView"));
export function HomePage() {
  const { state } = useDemo();
  const collected = new Set(state.photos.map((p) => p.shrineId)).size;
  const connected = addressMatcher.match(state.addresses.current);
  return (
    <>
      <div className="home-greeting">
        <div>
          <span className="eyebrow">めぐる、知る、つながる。</span>
          <h1>今日も、心に残るご縁を。</h1>
        </div>
        <div className="seal">縁</div>
      </div>
      <div className="home-overview">
        <div className="collection-summary">
          <span className="eyebrow light">わたしの参拝図鑑</span>
          <div className="summary-numbers">
            <strong>
              {collected}
              <small> / {shrines.length}</small>
            </strong>
            <span>
              寺社の御朱印を登録
              <br />
              デモ収録分
            </span>
          </div>
          <div className="progress-track">
            <i style={{ width: `${(collected / shrines.length) * 100}%` }} />
          </div>
          <div className="summary-foot">
            <span>
              デモ参拝 <b>{Object.keys(state.visits).length}</b> 寺社
            </span>
            <Link to="/book">
              一冊をひらく <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
        <Link className="connection-card" to="/addresses">
          <span className="icon-circle">
            <Flower2 size={25} />
          </span>
          <div>
            <span className="eyebrow">暮らしと、神社のつながり</span>
            <h2>
              {connected?.ids[0]
                ? `${shrineById(connected.ids[0])?.name}とのご縁`
                : "自分の神社を知る"}
            </h2>
            <p>
              現住所と生まれた地域から。
              <br />
              町域のテスト例で、ご縁をたどります。
            </p>
            <span className="text-link">
              {connected ? "照合結果を見る" : "テスト例を選んでみる"}{" "}
              <ChevronRight size={15} />
            </span>
          </div>
        </Link>
      </div>
      <Section title="次のご縁を探す" to="/search" link="寺社を探す">
        <div className="cards-grid">
          {shrines.slice(0, 2).map((s) => (
            <ShrineCard
              key={s.id}
              shrine={s}
              visited={!!state.visits[s.id]}
              favorite={state.favorites.includes(s.id)}
            />
          ))}
        </div>
      </Section>
      <div className="two-column">
        <Section title="最近の御朱印" to="/book" link="御朱印帳へ">
          {state.photos.length ? (
            <div className="recent-photos">
              {state.photos.slice(0, 3).map((p) => (
                <Link to={`/photos/${p.id}`} key={p.id}>
                  <PhotoImage id={p.id} />
                  <strong>{shrineById(p.shrineId)?.name}</strong>
                  <small>{p.date || "授与日不明"}</small>
                </Link>
              ))}
            </div>
          ) : (
            <div className="first-page">
              <img src="/book.svg" alt="御朱印帳のイラスト" />
              <div>
                <h3>思い出を、最初の一頁に。</h3>
                <p>
                  手元の写真も、サンプルも。
                  <br />
                  あなたのペースで集めていきましょう。
                </p>
                <Link to="/photos/new" className="button primary">
                  <Plus size={17} />
                  御朱印を追加
                </Link>
              </div>
            </div>
          )}
        </Section>
        <Section title="ご縁を深める">
          <div className="link-rows">
            <Link to="/gods">
              <Flower2 />
              <div>
                <b>神様・ご本尊を知る</b>
                <small>名前の先にある、つながりをたどる</small>
              </div>
              <ChevronRight />
            </Link>
            <Link to="/events">
              <CalendarDays />
              <div>
                <b>開催イベント</b>
                <small>デモの参加券を受け取ってみる</small>
              </div>
              <ChevronRight />
            </Link>
            <Link to="/community">
              <MessageCircle />
              <div>
                <b>交流ひろば</b>
                <small>この端末だけのお話の場</small>
              </div>
              <ChevronRight />
            </Link>
          </div>
        </Section>
      </div>
      <Link className="mission-banner" to="/missions">
        <span className="icon-circle">
          <BookOpen />
        </span>
        <div>
          <span className="eyebrow">小さな学びを、ひとつずつ。</span>
          <h3>ミッションから、次の楽しみを。</h3>
        </div>
        <ArrowUpRight />
      </Link>
    </>
  );
}
export function SearchPage() {
  const { state, notify } = useDemo();
  const [params, setParams] = useSearchParams();
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const q = params.get("q") || "",
    region = params.get("region") || "",
    kind = params.get("kind") || "",
    visited = params.get("visited") || "",
    fav = params.get("fav") === "1",
    mode = params.get("mode") || "list";
  const change = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true, preventScrollReset: true });
  };
  const filtered = useMemo(
    () =>
      shrines.filter(
        (s) =>
          (!q ||
            normalize(s.name + s.reading + s.region + s.city).includes(
              normalize(q),
            )) &&
          (!region || s.region === region) &&
          (!kind || s.kind === kind) &&
          (!fav || state.favorites.includes(s.id)) &&
          (!visited ||
            (visited === "yes" ? !!state.visits[s.id] : !state.visits[s.id])),
      ),
    [q, region, kind, fav, visited, state.favorites, state.visits],
  );
  const locate = () => {
    if (!navigator.geolocation) {
      notify("現在地を利用できません。地域選択から探せます。");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPosition([p.coords.latitude, p.coords.longitude]);
        change("mode", "map");
        setLocating(false);
        notify("現在地を地図に表示しました。位置は保存しません。");
      },
      () => {
        setLocating(false);
        notify(
          "現在地を取得できませんでした。位置情報を許可しなくても、地域選択と一覧を利用できます。",
        );
      },
      { timeout: 8000, maximumAge: 0 },
    );
  };
  return (
    <>
      <PageTitle eyebrow="小さな旅の、はじまり。" title="寺社を探す">
        名前や地域から、次に訪れたい場所を。
      </PageTitle>
      <div className="search-panel">
        <label className="search-input">
          <Search size={20} />
          <input
            aria-label="寺社名・読み方・地域で検索"
            placeholder="寺社名・読み方・地域で検索"
            value={q}
            onChange={(e) => change("q", e.target.value)}
          />
        </label>
        <div className="filter-grid">
          <label>
            地域
            <select
              value={region}
              onChange={(e) => change("region", e.target.value)}
            >
              <option value="">すべての地域</option>
              {[...new Set(shrines.map((s) => s.region))].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <label>
            寺社の種類
            <select
              value={kind}
              onChange={(e) => change("kind", e.target.value)}
            >
              <option value="">神社と寺院</option>
              <option>神社</option>
              <option>寺院</option>
            </select>
          </label>
          <label>
            参拝の記録
            <select
              value={visited}
              onChange={(e) => change("visited", e.target.value)}
            >
              <option value="">すべて</option>
              <option value="yes">デモ参拝済み</option>
              <option value="no">未参拝</option>
            </select>
          </label>
        </div>
        <div className="toolbar">
          <label className="check-label">
            <input
              type="checkbox"
              checked={fav}
              onChange={(e) => change("fav", e.target.checked ? "1" : "")}
            />
            お気に入りのみ
          </label>
          <button onClick={locate} disabled={locating}>
            <LocateFixed size={16} />
            {locating ? "現在地を確認中…" : "現在地"}
          </button>
        </div>
      </div>
      <div className="toolbar section-heading">
        <span>
          <b>{filtered.length}</b> 件の寺社
        </span>
        <div className="segmented">
          <button
            className={mode === "list" ? "selected" : ""}
            onClick={() => change("mode", "list")}
          >
            一覧
          </button>
          <button
            className={mode === "map" ? "selected" : ""}
            onClick={() => change("mode", "map")}
          >
            地図
          </button>
        </div>
      </div>
      <p className="fine">
        デモ収録24件：公式資料参照4件・架空サンプル20件。写真はイラストです。
      </p>
      {mode === "map" && (
        <Suspense fallback={<p>地図を読み込んでいます…</p>}>
          <MapView shrines={filtered} position={position} />
        </Suspense>
      )}
      <div className="cards-grid search-results">
        {filtered.map((s) => (
          <ShrineCard
            key={s.id}
            shrine={s}
            visited={!!state.visits[s.id]}
            favorite={state.favorites.includes(s.id)}
          />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty">
          該当する寺社がありません。
          <button onClick={() => setParams({})}>検索条件をリセット</button>
        </div>
      )}
    </>
  );
}
export function ShrinePage() {
  const { id } = useParams();
  const s = shrineById(id || "");
  const { state, mutate, busy } = useDemo();
  if (!s) return <PageTitle title="寺社が見つかりません" />;
  const fav = state.favorites.includes(s.id);
  const ios =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const destination = encodeURIComponent(s.name + " " + s.address);
  return (
    <>
      <div className="detail-heading">
        <span className="eyebrow">
          {s.region} · {s.kind} ·{" "}
          {s.fictional ? "架空サンプル" : "公式情報を参照"}
        </span>
        <h1>{s.name}</h1>
        <p>{s.reading}</p>
      </div>
      <div className="detail-cover">
        <img
          src={s.kind === "寺院" ? "/temple.svg" : "/shrine.svg"}
          alt="寺社をイメージしたイラスト（実際の建物の写真ではありません）"
        />
        <div className="cover-caption">
          {s.fictional ? "架空の寺社" : "寺社のイメージイラスト"}
        </div>
      </div>
      <div className="toolbar">
        <button
          disabled={busy}
          className={fav ? "favorite active" : "favorite"}
          onClick={() =>
            mutate(
              (d) => {
                d.favorites = d.favorites.includes(s.id)
                  ? d.favorites.filter((x) => x !== s.id)
                  : [...d.favorites, s.id];
              },
              fav ? "お気に入りを解除しました" : "お気に入りに追加しました",
            )
          }
        >
          <Heart size={17} fill={fav ? "currentColor" : "none"} />
          {fav ? "お気に入り登録済み" : "お気に入りに追加"}
        </button>
        <span className="tag">
          {state.visits[s.id] ? "デモ参拝済み" : "未参拝"}
        </span>
      </div>
      <p className="prose">{s.description}</p>
      <Notice>
        {s.fictional
          ? "架空サンプルです。所在地・祭神・地図も操作用で、実際には訪問できません。"
          : "所在地・ご祭神等は公式資料を参照。受付時間・料金・現地入口は未確認です。参拝前に公式案内をご確認ください。"}
      </Notice>
      <Section title={s.kind === "寺院" ? "ご本尊を知る" : "ご祭神を知る"}>
        <div className="god-links">
          {s.gods.map((id) => {
            const g = gods.find((g) => g.id === id)!;
            return (
              <Link to={`/gods/${id}`} key={id}>
                <span className="god-symbol">
                  {s.kind === "寺院" ? "蓮" : "結"}
                </span>
                <span>
                  <strong>{g.name}</strong>
                  <small>{g.reading}</small>
                </span>
                <ChevronRight size={18} />
              </Link>
            );
          })}
        </div>
      </Section>
      <Section title="この場所で、記録する">
        <div className="actions">
          <Link className="button primary" to={`/photos/new?shrine=${s.id}`}>
            <Plus size={17} />
            御朱印を追加
          </Link>
          <button
            disabled={busy}
            onClick={() =>
              mutate((d) => {
                d.visits[s.id] = new Date().toISOString();
              }, "デモ参拝を記録しました。来訪確認は行っていません。")
            }
          >
            <Check size={17} />
            {state.visits[s.id] ? "デモ参拝を再記録" : "デモ参拝を記録"}
          </button>
        </div>
        <p className="fine">
          位置や来訪は確認しません。写真登録数と参拝数は別に数えます。
        </p>
        {state.photos
          .filter((p) => p.shrineId === s.id)
          .map((p) => (
            <Link className="record-link" key={p.id} to={`/photos/${p.id}`}>
              {p.date || "授与日不明"} の御朱印 <ChevronRight size={15} />
            </Link>
          ))}
      </Section>
      <Section title="所在地と経路案内">
        <p>
          <MapPin size={16} />
          {s.address}
        </p>
        {s.fictional ? (
          <p className="fine">
            架空の地点のため、実際の経路案内は利用できません。
          </p>
        ) : (
          <>
            <div className="actions">
              <a
                className="button"
                target="_blank"
                rel="noreferrer"
                href={`https://www.google.com/maps/dir/?api=1&destination=${destination}`}
              >
                Googleマップで経路案内 <ArrowUpRight size={16} />
              </a>
              {ios && (
                <a
                  className="button"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://maps.apple.com/?daddr=${destination}`}
                >
                  Appleマップで経路案内
                </a>
              )}
            </div>
            <p className="fine">
              寺社名と所在地を送信します。登録した住所は出発地に使いません。入口・駐車場は現地で確認してください。
            </p>
          </>
        )}
        {s.source && (
          <p className="source">
            <a href={s.source} target="_blank" rel="noreferrer">
              出典：
              {s.kind === "寺院" ? "四国八十八ヶ所霊場会" : "岡山県神社庁"}{" "}
              <ArrowUpRight size={13} />
            </a>
            <br />
            確認日 {s.checked}
          </p>
        )}
      </Section>
    </>
  );
}
export function GodIndex() {
  return (
    <>
      <PageTitle eyebrow="名前の先に、広がる物語。" title="神様・ご本尊の図鑑">
        神様と仏様を区別して、ご縁をたどります。
      </PageTitle>
      <div className="god-index">
        {gods.map((g) => (
          <Link to={`/gods/${g.id}`} key={g.id} className="panel">
            <span className="eyebrow">
              {g.kind}
              {g.fictional ? " · 架空サンプル" : ""}
            </span>
            <h2>{g.name}</h2>
            <p>{g.reading}</p>
            <span className="text-link">
              紹介とノートをひらく <ChevronRight size={15} />
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
export function GodPage() {
  const { id } = useParams();
  const god = gods.find((g) => g.id === id);
  const { state, mutate, busy } = useDemo();
  const [note, setNote] = useState(state.notes[id || ""] || "");
  useEffect(() => setNote(state.notes[id || ""] || ""), [id]);
  if (!god) return <PageTitle title="神様・ご本尊が見つかりません" />;
  return (
    <>
      <PageTitle
        eyebrow={`${god.kind}${god.fictional ? " · 架空サンプル" : ""}`}
        title={god.name}
      >
        {god.reading}
      </PageTitle>
      <div className="god-description">
        <span className="large-god-symbol">
          {god.kind === "神様" ? "結" : "蓮"}
        </span>
        <p>{god.description}</p>
      </div>
      {god.source && (
        <p className="source">
          <a href={god.source} target="_blank" rel="noreferrer">
            紹介の出典を確認 <ArrowUpRight size={13} />
          </a>{" "}
          · {CHECKED}
        </p>
      )}
      <Section
        title={god.kind === "神様" ? "ご縁の関係図" : "ご本尊と寺院のつながり"}
      >
        {["amaterasu", "toyouke"].includes(god.id) ? (
          <>
            <div className="relationship">
              <Link to="/gods/toyouke">豊受大神</Link>
              <span>── お食事をつかさどる ── →</span>
              <Link to="/gods/amaterasu">天照皇大神</Link>
            </div>
            <p className="fine">
              御饌都神としての関係を表しています。親子関係を示す線ではありません。
              <a href={GOD_SOURCE} target="_blank" rel="noreferrer">
                出典：伊勢神宮
              </a>
              （{CHECKED}）
            </p>
          </>
        ) : (
          <>
            <div className="relationship">
              <strong>{god.name}</strong>
              <span>
                ── {god.kind === "神様" ? "お祀りする" : "ご本尊とする"} ── →
              </span>
              {shrines
                .filter((s) => s.gods.includes(god.id))
                .slice(0, 2)
                .map((s) => (
                  <Link to={`/shrines/${s.id}`} key={s.id}>
                    {s.name}
                  </Link>
                ))}
            </div>
            <p className="fine">
              {god.kind === "ご本尊"
                ? "寺院のご本尊を神様の家系図には接続しません。"
                : "確認できた祭祀関係のみ表示しています。親子・兄弟関係は未確認です。"}
              {god.fictional ? " この関係は架空サンプルです。" : ""}
            </p>
          </>
        )}
      </Section>
      <button
        className="primary"
        disabled={busy}
        onClick={() =>
          mutate((s) => {
            s.learned[god.id] = new Date().toISOString();
          }, "学習を記録しました。ミッションの進捗をご確認ください。")
        }
      >
        <BookOpen size={17} />
        {state.learned[god.id] ? "もう一度学習を記録" : "学習を記録"}
      </button>
      <Link className="inline-link" to="/missions">
        ミッションへ
      </Link>
      <Section title="わたしのご祭神ノート">
        <label>
          気づいたこと、覚えておきたいこと
          <textarea
            maxLength={2000}
            rows={5}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="この端末だけの、あなたのノートです。"
          />
        </label>
        <div className="actions">
          <button
            className="primary"
            disabled={busy}
            onClick={() =>
              mutate((s) => {
                if (note.trim()) s.notes[god.id] = note.trim();
                else delete s.notes[god.id];
              }, "ノートを保存しました")
            }
          >
            ノートを保存
          </button>
          <button
            disabled={busy || !state.notes[god.id]}
            onClick={async () => {
              if (
                await mutate((s) => {
                  delete s.notes[god.id];
                }, "ノートを削除しました")
              )
                setNote("");
            }}
          >
            ノートを削除
          </button>
        </div>
        <p className="fine">
          端末内に保存されます。他の利用者には共有されません。
        </p>
      </Section>
      <Section title="関連する寺社">
        <div className="cards-grid">
          {shrines
            .filter((s) => s.gods.includes(god.id))
            .map((s) => (
              <ShrineCard key={s.id} shrine={s} />
            ))}
        </div>
      </Section>
    </>
  );
}
