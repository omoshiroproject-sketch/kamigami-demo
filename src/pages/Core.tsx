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
import { stories } from "../data/stories";
import { PlaceVisual, PhotoCredit } from "../components/PlaceVisual";
import { MindSummary } from "./Mind";
const MapView = lazy(() => import("../components/MapView"));
export function HomePage() {
  const { state } = useDemo();
  const collected = new Set(state.photos.map((p) => p.shrineId)).size;
  const connected = addressMatcher.match(state.addresses.current);
  return (
    <>
      <div className="edition-line">
        <span>心を整える、参拝の旅帖</span>
        <span>知る、誓う、感謝する。</span>
      </div>
      <section
        className="travel-cover mind-cover"
        aria-label="参拝から始まる心の記録"
      >
        <Link
          to="/shrines/ise-jingu"
          className="cover-photo"
          aria-label="伊勢神宮 内宮の物語を読む"
        >
          <PlaceVisual shrine={shrineById("ise-jingu")!} eager />
          <span className="cover-label">今、訪れたい場所</span>
          <span className="cover-place">
            三重・伊勢<span>ISE JINGU</span>
          </span>
          <span className="cover-credit">
            Photo: Zairon · CC BY 4.0（出典は詳細へ）
          </span>
        </Link>
        <div className="cover-copy">
          <span className="cover-index">SHINTO × MINDSET</span>
          <h1>
            <small>御朱印を「集める」から</small>
            貴方が「整う」。
          </h1>
          <p>
            その場所で、何を誓い、何に感謝したか。
            <br />
            神様を知る旅を、自分を知る時間へ。
          </p>
          <div className="cover-destination">
            <span>伊勢神宮</span>
            <small>五十鈴川のほとり、祈りをたどる</small>
          </div>
          <Link to="/mind/new" className="button primary">
            心の記録を書く <ArrowUpRight size={18} />
          </Link>
          <span className="cover-stamp" aria-hidden="true">
            誓いと感謝
          </span>
        </div>
      </section>
      <MindSummary />
      <div className="journey-tools">
        <Link to="/search">
          <span className="tool-number">01</span>
          <Search />
          <div>
            <b>次の寺社を探す</b>
            <small>地域や名前から、気になる場所へ</small>
          </div>
          <ArrowUpRight size={18} />
        </Link>
        <Link to="/photos/new">
          <span className="tool-number">02</span>
          <BookOpen />
          <div>
            <b>御朱印を残す</b>
            <small>今日のご縁を、あなたの一冊に</small>
          </div>
          <ArrowUpRight size={18} />
        </Link>
        <Link to="/gods">
          <span className="tool-number">03</span>
          <Flower2 />
          <div>
            <b>神様を知る</b>
            <small>名前から広がる、日本の物語</small>
          </div>
          <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="travel-overview">
        <Link to="/book" className="travel-record">
          <span className="record-emblem">
            <BookOpen size={26} />
          </span>
          <div>
            <span className="eyebrow">わたしの参拝図鑑</span>
            <b>
              {collected}
              <small> / {shrines.length} 寺社</small>
            </b>
          </div>
          <div className="record-description">
            <span>御朱印から、ご縁が増えていく。</span>
            <small>
              デモ収録分 · デモ参拝 {Object.keys(state.visits).length} 寺社
            </small>
          </div>
          <ArrowUpRight size={21} />
        </Link>
        <Link className="travel-connection" to="/addresses">
          <MapPin size={24} />
          <div>
            <span className="eyebrow">暮らしのそばにあるご縁</span>
            <b>
              {connected?.ids[0]
                ? `${shrineById(connected.ids[0])?.name}とのご縁`
                : "自分の神社を知る"}
            </b>
            <small>町域のテスト例から探す</small>
          </div>
          <ChevronRight size={18} />
        </Link>
      </div>
      <Section title="次のご縁を探す" to="/search" link="寺社を探す">
        <div className="cards-grid">
          {["ise-jingu", "okayama", "ryozenji", "gokurakuji"]
            .map((id) => shrineById(id)!)
            .map((s) => (
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
      <PageTitle eyebrow="EXPLORE / 参拝の旅を見つける" title="寺社を探す">
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
              aria-label="地域"
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
              aria-label="寺社の種類"
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
              aria-label="参拝の記録"
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
        デモ収録{shrines.length}件：公式資料参照
        {shrines.filter((s) => !s.fictional).length}件・架空サンプル
        {shrines.filter((s) => s.fictional).length}
        件。実景写真とイメージイラストを使用しています。
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
  const story = stories[s.id];
  const ios =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const destination = encodeURIComponent(s.name + " " + s.address);
  return (
    <>
      <div
        className={`place-hero ${story?.photo ? "has-photo" : "illustrated"}`}
      >
        <PlaceVisual key={s.id} shrine={s} eager />
        <div className="place-hero-shade" />
        <div className="place-hero-copy">
          <span className="eyebrow">
            {s.region} · {s.city} / {s.kind}
          </span>
          <h1>{s.name}</h1>
          {s.id === "ise" && (
            <span className="place-locale">岡山県岡山市 · 番町</span>
          )}
          <p className="place-reading">{s.reading}</p>
          <p className="place-subtitle">
            {story?.subtitle || "一冊に残す、架空の参拝体験。"}
          </p>
        </div>
        <span className="place-seal">{s.fictional ? "見本" : "参拝"}</span>
        {!story?.photo && (
          <span className="visual-label">
            {s.fictional ? "架空サンプル · イラスト" : "イメージイラスト"}
          </span>
        )}
      </div>
      <PhotoCredit shrine={s} />
      {s.id === "ise" && (
        <aside className="place-distinction">
          <MapPin size={22} />
          <div>
            <strong>こちらは岡山県の「伊勢神社」です</strong>
            <p>三重県の「伊勢神宮」とは別の神社です。</p>
            <Link to="/shrines/ise-jingu">
              三重県・伊勢神宮 内宮を見る <ArrowUpRight size={16} />
            </Link>
          </div>
        </aside>
      )}
      {(s.id === "ise-jingu" || s.id === "ise-geku") && (
        <aside className="jingu-guide">
          <div>
            <span className="eyebrow">ふたつのお宮、それぞれのご祭神</span>
            <strong>伊勢神宮は、125の宮社の総称です。</strong>
            <p>
              内宮には天照大御神、外宮には豊受大御神。所在地と参拝の記録を分けてご案内しています。
            </p>
          </div>
          <Link
            to={
              s.id === "ise-jingu" ? "/shrines/ise-geku" : "/shrines/ise-jingu"
            }
          >
            {s.id === "ise-jingu" ? "外宮・豊受大神宮へ" : "内宮・皇大神宮へ"}
            <ArrowUpRight size={18} />
          </Link>
        </aside>
      )}
      <nav className="place-tabs" aria-label="寺社詳細の目次">
        {story && (
          <>
            <a href="#history">歴史・由緒</a>
            <a href="#blessings">ご利益</a>
          </>
        )}
        <a href="#deities">{s.kind === "寺院" ? "ご本尊" : "ご祭神"}</a>
        <a href="#visit-record">参拝の記録</a>
        <a href="#access">アクセス</a>
      </nav>
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
      <p className="place-lead">{story?.lead || s.description}</p>
      {story && (
        <>
          <div className="place-facts">
            <div>
              <span>創建・歴史</span>
              <strong>{story.era}</strong>
            </div>
            <div>
              <span>
                {s.kind === "寺院" ? "ご本尊・宗派" : "お祀りする神様"}
              </span>
              <strong>{story.identity}</strong>
            </div>
          </div>
          <section className="story-section" id="history">
            <div className="story-heading">
              <span>01 / HISTORY</span>
              <h2>この場所が、歩んだ時。</h2>
              <p>歴史・由緒</p>
            </div>
            <div className="story-body">
              {story.history.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <ol className="history-line">
                {story.timeline.map((t) => (
                  <li key={t.year}>
                    <strong>{t.year}</strong>
                    <span>{t.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
          <section className="blessing-panel" id="blessings">
            <div className="story-heading">
              <span>02 / PRAYERS</span>
              <h2>ここで願うこと。</h2>
              <p>ご利益・伝わる信仰</p>
            </div>
            <div>
              <div className="blessing-tags">
                {story.blessings.map((b) => (
                  <span key={b}>
                    <Flower2 size={16} />
                    {b}
                  </span>
                ))}
              </div>
              <p>{story.belief}</p>
              <small>ご利益は信仰や伝承としての紹介です。</small>
            </div>
          </section>
          <section className="highlights">
            <div className="story-heading">
              <span>境内を歩く</span>
              <h2>知ってから訪れたい、見どころ。</h2>
            </div>
            <div className="highlight-grid">
              {story.highlights.map((h, i) => (
                <article key={h.title}>
                  <span className="highlight-number">0{i + 1}</span>
                  <h3>{h.title}</h3>
                  <p>{h.text}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
      <Notice>
        {s.fictional
          ? "架空サンプルです。所在地・祭神・地図も操作用で、実際には訪問できません。"
          : "所在地・ご祭神等は公式資料を参照。受付時間・料金・現地入口は未確認です。参拝前に公式案内をご確認ください。"}
      </Notice>
      <div id="deities" />
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
      <div id="visit-record" />
      <Section title="この場所で、記録する">
        <div className="actions">
          <Link className="button" to={`/mind/new?shrine=${s.id}`}>
            <Heart size={17} />
            この場所の誓い・感謝を残す
          </Link>
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
      <div id="access" />
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
        {story && (
          <div className="story-sources">
            <h3>このページの出典</h3>
            <p>
              公式資料をもとに要約。創建にまつわる話は伝承として記載しています。確認日：2026-09-17
            </p>
            {story.sources.map((source) => (
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                key={source.url}
              >
                {source.title}
                <ArrowUpRight size={14} />
              </a>
            ))}
          </div>
        )}
        {s.source && (
          <p className="source">
            <a href={s.source} target="_blank" rel="noreferrer">
              出典：
              {s.source.startsWith("https://www.isejingu.or.jp/")
                ? "伊勢神宮公式"
                : s.kind === "寺院"
                  ? "四国八十八ヶ所霊場会"
                  : "岡山県神社庁"}{" "}
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
              <Link to="/gods/toyouke">豊受大御神</Link>
              <span>── お食事をつかさどる ── →</span>
              <Link to="/gods/amaterasu">天照大御神</Link>
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
                : "この図は、資料で確認できた寺社とご祭神のつながりを示しています。"}
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
