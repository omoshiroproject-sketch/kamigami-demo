import { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  MapPin,
  Flower2,
  Gift,
  Ticket,
  Settings,
  ChevronRight,
  Download,
  MessageCircle,
  Heart,
  Sprout,
  Flag,
} from "lucide-react";
import { useDemo } from "../context";
import { addressExamples, addressMatcher } from "../services/address";
import { CHECKED, shrines, gods } from "../data/master";
import { repository } from "../services/storage";
import { balance } from "../services/domain";
import {
  PageTitle,
  Notice,
  Section,
  ShrineCard,
  dateTime,
} from "../components/Primitives";
export function ProfilePage() {
  const { state, perform, busy } = useDemo();
  const [reset, setReset] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const ios =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const android = /Android/.test(navigator.userAgent);
  return (
    <>
      <PageTitle eyebrow="あなたのご縁を、大切に。" title="マイページ" />
      <div className="profile-card">
        <div className="avatar">
          <User size={30} />
        </div>
        <div>
          <h2>旅するあなた</h2>
          <p>このブラウザのデモ利用者</p>
        </div>
        <span className="tag">端末内保存</span>
      </div>
      <div className="link-rows">
        {[
          ["/mind", "心の記録", "感謝・誓い・気づきを振り返る", Heart],
          [
            "/roadmap",
            "心の成長ロードマップ",
            "4つの節目と、これからの宣言",
            Sprout,
          ],
          ["/missions", "ミッション", "参加と達成・デモポイント", Flag],
          [
            "/addresses",
            "自分の神社・住所のテスト例",
            "現住所と出生地を別々に管理",
            MapPin,
          ],
          [
            "/points",
            "徳ポイント",
            `${balance(state)}徳 · 履歴を確認`,
            Flower2,
          ],
          ["/rewards", "ご縁の特典", "交換とキャンセルの体験", Gift],
          ["/tickets", "わたしの参加券", "イベントの申込状況", Ticket],
          [
            "/community",
            "交流ひろば",
            "この端末だけの投稿とコメント",
            MessageCircle,
          ],
          [
            "/admin",
            "運営体験モード",
            "ミッション・イベント・特典を作成",
            Settings,
          ],
        ].map(([path, title, sub, Icon]) => {
          const I = Icon as typeof User;
          return (
            <Link to={path as string} key={path as string}>
              <I />
              <div>
                <b>{title as string}</b>
                <small>{sub as string}</small>
              </div>
              <ChevronRight />
            </Link>
          );
        })}
      </div>
      <Section title="お気に入り">
        <div className="cards-grid">
          {shrines
            .filter((s) => state.favorites.includes(s.id))
            .map((s) => (
              <ShrineCard shrine={s} key={s.id} favorite />
            ))}
        </div>
        {!state.favorites.length && (
          <p className="fine">寺社の詳細から、お気に入りを登録できます。</p>
        )}
      </Section>
      <Section title="ご祭神ノート">
        {Object.entries(state.notes).map(([id, note]) => (
          <Link className="panel note-preview" to={`/gods/${id}`} key={id}>
            <b>{gods.find((g) => g.id === id)?.name}</b>
            <p>{note}</p>
          </Link>
        ))}
        {!Object.keys(state.notes).length && (
          <Link className="inline-link" to="/gods">
            神様を知って、ノートを残す
          </Link>
        )}
      </Section>
      <Section title="保存について">
        <Notice>
          写真・住所のテスト例・記録は、同じ端末・同じブラウザ内だけに保存されます。ブラウザデータを削除すると失われます。別端末や別の公開ドメインには引き継がれず、クラウド同期はありません。共用端末では同じブラウザを開いた人が閲覧できます。
        </Notice>
        <p className="fine">
          会員認証・本番の管理者認証はありません。デモ運営の公開操作もこのブラウザ内だけに反映されます。
        </p>
      </Section>
      <Section title="ホーム画面に追加">
        <div className="panel">
          <Download size={24} />
          <h3>アプリのように、すぐひらく。</h3>
          <p>
            {ios
              ? "Safariの共有ボタンから「ホーム画面に追加」を選択してください。"
              : android
                ? "Chromeのメニューから「アプリをインストール」または「ホーム画面に追加」を選択してください。"
                : "Chrome・Edgeではアドレスバー付近のインストール操作、MacのSafariでは「ファイル」→「Dockに追加」を利用できます。表示されない場合はブラウザのブックマークをご利用ください。"}
          </p>
          <p className="fine">
            HTTPS公開後に対応ブラウザで利用できます。地図や初回起動には通信が必要です。全機能のオフライン動作は保証していません。
          </p>
        </div>
      </Section>
      <Section title="デモを最初から体験する">
        <button className="danger" onClick={() => setReset(true)}>
          全デモデータをリセット
        </button>
        {reset && (
          <div className="confirm-panel">
            <h3>保存した写真もすべて消えます</h3>
            <p>
              御朱印・心の記録・これからの宣言・メモ・住所のテスト例・お気に入り・ポイント履歴・運営変更・投稿を削除し、初期状態（300徳）に戻します。元に戻せません。
            </p>
            <label className="check-label">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              写真も削除されることを確認しました
            </label>
            <div className="actions">
              <button
                className="danger"
                disabled={busy || !confirmed}
                onClick={async () => {
                  if (
                    await perform(
                      () => repository.reset(),
                      "初期データに戻しました",
                    )
                  ) {
                    setReset(false);
                    setConfirmed(false);
                  }
                }}
              >
                すべて削除して初期化
              </button>
              <button
                onClick={() => {
                  setReset(false);
                  setConfirmed(false);
                }}
              >
                やめる
              </button>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
export function AddressPage() {
  const { state, mutate, busy } = useDemo();
  return (
    <>
      <PageTitle
        eyebrow="暮らす場所、生まれた場所。"
        title="自分の神社を知る"
      />
      <Notice>
        実際の住所は入力せず、町域のテスト例を選んでください。このブラウザ内に保存され、共用端末では同じブラウザを開いた人が閲覧できます。本番の本人認証はありません。
      </Notice>
      {(["current", "birth"] as const).map((key) => {
        const value = state.addresses[key];
        const result = addressMatcher.match(value);
        return (
          <section className="address-section panel" key={key}>
            <h2>
              {key === "current" ? "現住所のテスト例" : "出生地のテスト例"}
            </h2>
            <label>
              {key === "current" ? "住んでいる地域の例" : "生まれた地域の例"}
              <select
                aria-label={
                  key === "current" ? "現住所のテスト例" : "出生地のテスト例"
                }
                disabled={busy}
                value={value}
                onChange={(e) => {
                  const next = e.target.value;
                  void mutate(
                    (s) => {
                      s.addresses[key] = next;
                    },
                    next
                      ? "テスト例を保存し、照合結果を更新しました"
                      : "テスト例と照合結果を削除しました",
                  );
                }}
              >
                <option value="">未登録</option>
                {addressExamples.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="fine">
              選択すると保存され、結果を更新します。町域の例がURLや交流ひろばに載ることはありません。
            </p>
            {result ? (
              <>
                <div className="match-result">
                  <span className={result.official ? "tag filled" : "tag"}>
                    {result.official ? "確認済み対応表" : "サンプル照合"}
                  </span>
                  <h3>
                    {key === "birth"
                      ? "生まれた地域の神社／産土神社の候補"
                      : "氏神神社の照合結果"}
                  </h3>
                  <strong>{result.status}</strong>
                  <p>{result.reason}</p>
                  {key === "birth" && (
                    <p className="fine">
                      現在の資料に基づく候補です。出生当時の関係や個人の守護神を確定しません。
                    </p>
                  )}
                  {result.source && (
                    <p className="source">
                      <a href={result.source} target="_blank" rel="noreferrer">
                        出典：岡山県神社庁・伊勢神社
                      </a>
                      <br />
                      確認日 {CHECKED}
                    </p>
                  )}
                  <div className="stack">
                    {result.ids.map((id) => {
                      const shrine = shrines.find((s) => s.id === id)!;
                      return <ShrineCard key={id} shrine={shrine} />;
                    })}
                  </div>
                  {!result.ids.length && (
                    <Link className="button" to="/search">
                      自分で寺社を探す
                    </Link>
                  )}
                </div>
                <button
                  className="danger"
                  disabled={busy}
                  onClick={() =>
                    mutate((s) => {
                      s.addresses[key] = "";
                    }, "テスト例と照合結果を削除しました")
                  }
                >
                  {key === "current" ? "現住所" : "出生地"}のテスト例を削除
                </button>
              </>
            ) : (
              <p className="empty">
                まだ登録されていません。上のテスト例から照合を体験できます。
              </p>
            )}
          </section>
        );
      })}
    </>
  );
}
export function CommunityPage() {
  const { state, mutate, busy } = useDemo();
  const [text, setText] = useState("");
  const [comments, setComments] = useState<Record<string, string>>({});
  const [showHidden, setShowHidden] = useState(false);
  return (
    <>
      <PageTitle eyebrow="参拝の気づきを、言葉に。" title="交流ひろば" />
      <Notice>
        サンプル投稿と、この端末だけの投稿・コメントを体験できます。他の利用者への共有・送信は行いません。
      </Notice>
      <form
        className="panel"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!text.trim()) return;
          const post = {
            id: crypto.randomUUID(),
            text: text.trim(),
            sample: false,
            hidden: false,
            at: new Date().toISOString(),
            comments: [],
          };
          if (
            await mutate((s) => {
              s.posts.unshift(post);
            }, "この端末に投稿を保存しました")
          )
            setText("");
        }}
      >
        <label>
          今日のひとこと
          <textarea
            value={text}
            maxLength={2000}
            rows={3}
            required
            onChange={(e) => setText(e.target.value)}
            placeholder="参拝で気づいたこと、学んだこと。"
          />
        </label>
        <button className="primary" disabled={busy || !text.trim()}>
          端末内に投稿を保存
        </button>
      </form>
      <label className="check-label">
        <input
          type="checkbox"
          checked={showHidden}
          onChange={(e) => setShowHidden(e.target.checked)}
        />
        非表示にした投稿も表示
      </label>
      <div className="posts">
        {state.posts
          .filter((p) => !p.hidden || showHidden)
          .map((p) => (
            <article className="panel" key={p.id}>
              <div className="toolbar">
                <b>
                  {p.sample ? "杜のたより（サンプル）" : "あなた（この端末）"}
                </b>
                <span className="tag">{p.hidden ? "非表示" : "端末内"}</span>
              </div>
              <small>{dateTime(p.at)}</small>
              <p className="pre-wrap">{p.text}</p>
              <div className="actions">
                <button
                  disabled={busy}
                  onClick={() =>
                    mutate((s) => {
                      const post = s.posts.find((x) => x.id === p.id);
                      if (post) post.hidden = !post.hidden;
                    })
                  }
                >
                  {p.hidden ? "表示に戻す" : "非表示にする"}
                </button>
                {!p.sample && (
                  <button
                    className="danger"
                    disabled={busy}
                    onClick={() =>
                      mutate((s) => {
                        s.posts = s.posts.filter((x) => x.id !== p.id);
                      }, "投稿とコメントを削除しました")
                    }
                  >
                    投稿を削除
                  </button>
                )}
              </div>
              <div className="comments">
                {p.comments.map((c) => (
                  <div key={c.id}>
                    <p className="pre-wrap">{c.text}</p>
                    <button
                      aria-label="コメントを削除"
                      className="text-button"
                      disabled={busy}
                      onClick={() =>
                        mutate((s) => {
                          const post = s.posts.find((x) => x.id === p.id);
                          if (post)
                            post.comments = post.comments.filter(
                              (x) => x.id !== c.id,
                            );
                        })
                      }
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
              <form
                className="comment-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const text = (comments[p.id] || "").trim();
                  if (!text) return;
                  const comment = { id: crypto.randomUUID(), text };
                  if (
                    await mutate((s) => {
                      const post = s.posts.find((x) => x.id === p.id);
                      if (!post) throw Error("投稿が削除されています。");
                      post.comments.push(comment);
                    }, "コメントを端末内に保存しました")
                  )
                    setComments({ ...comments, [p.id]: "" });
                }}
              >
                <input
                  aria-label={`${p.sample ? "サンプル投稿" : p.text}へのコメント`}
                  maxLength={500}
                  required
                  placeholder="コメントを残す"
                  value={comments[p.id] || ""}
                  onChange={(e) =>
                    setComments({ ...comments, [p.id]: e.target.value })
                  }
                />
                <button disabled={busy || !(comments[p.id] || "").trim()}>
                  保存
                </button>
              </form>
            </article>
          ))}
      </div>
    </>
  );
}
