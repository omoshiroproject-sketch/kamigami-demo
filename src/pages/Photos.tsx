import { useEffect, useState, type FormEvent } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Plus,
  Camera,
  ImagePlus,
  FolderOpen,
  CalendarDays,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
import { useDemo } from "../context";
import { shrines, shrineById } from "../data/master";
import { repository } from "../services/storage";
import { photoProcessor, type PreparedPhoto } from "../services/photos";
import {
  Notice,
  PageTitle,
  PhotoImage,
  Section,
} from "../components/Primitives";
export function BookPage() {
  const { state } = useDemo();
  const [params, setParams] = useSearchParams();
  const mode = params.get("mode") || "shrine";
  const collection = new Set(state.photos.map((p) => p.shrineId));
  const groups =
    mode === "month"
      ? [
          ...new Set(
            state.photos.map((p) => p.date.slice(0, 7) || "授与日不明"),
          ),
        ]
          .sort()
          .reverse()
      : [...collection];
  return (
    <>
      <div className="title-with-action">
        <PageTitle
          eyebrow="ひとつひとつの、ご縁を綴る。"
          title="わたしの御朱印帳"
        >
          あなたの思い出が、一冊の図鑑に。
        </PageTitle>
        <Link className="button primary" to="/photos/new">
          <Plus size={18} />
          御朱印を追加
        </Link>
      </div>
      <div className="book-stats">
        <div>
          <b>{state.photos.length}</b>
          <span>写真の記録</span>
        </div>
        <div>
          <b>
            {collection.size}
            <small> / {shrines.length}</small>
          </b>
          <span>御朱印登録の寺社</span>
        </div>
        <div>
          <b>{Object.keys(state.visits).length}</b>
          <span>デモ参拝の寺社</span>
        </div>
      </div>
      <Notice>
        写真はこのブラウザ内に保存されます。図鑑はデモ収録分の進捗です。御朱印の登録だけでは参拝済みになりません。
      </Notice>
      <div className="segmented wide">
        <button
          className={mode === "shrine" ? "selected" : ""}
          onClick={() => setParams({ mode: "shrine" })}
        >
          <FolderOpen size={16} />
          寺社別
        </button>
        <button
          className={mode === "month" ? "selected" : ""}
          onClick={() => setParams({ mode: "month" })}
        >
          <CalendarDays size={16} />
          年月別
        </button>
        <button
          className={mode === "collection" ? "selected" : ""}
          onClick={() => setParams({ mode: "collection" })}
        >
          <BookOpen size={16} />
          図鑑
        </button>
      </div>
      {mode === "collection" ? (
        <div className="collection-grid">
          {shrines.map((s, i) => {
            const photo = state.photos.find((p) => p.shrineId === s.id);
            return (
              <Link
                key={s.id}
                to={photo ? `/photos/${photo.id}` : `/shrines/${s.id}`}
                className={
                  photo ? "collection-item collected" : "collection-item"
                }
              >
                <div className="collection-photo">
                  {photo ? (
                    <PhotoImage id={photo.id} />
                  ) : (
                    <>
                      <span className="collection-number">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="outline-flower">❀</span>
                      <small>未登録</small>
                    </>
                  )}
                </div>
                <h3>{s.name}</h3>
                <p>
                  {s.region} · {s.fictional ? "架空" : "公式参照"}
                </p>
              </Link>
            );
          })}
        </div>
      ) : (
        groups.map((group) => (
          <Section
            key={group}
            title={mode === "month" ? group : shrineById(group)?.name || group}
          >
            <div className="photo-grid">
              {state.photos
                .filter((p) =>
                  mode === "month"
                    ? (p.date.slice(0, 7) || "授与日不明") === group
                    : p.shrineId === group,
                )
                .map((p) => (
                  <Link
                    className="photo-card"
                    key={p.id}
                    to={`/photos/${p.id}`}
                  >
                    <PhotoImage id={p.id} />
                    <div>
                      <h3>{shrineById(p.shrineId)?.name}</h3>
                      <small>
                        {p.date || "授与日不明"}
                        {p.sample ? " · サンプル" : ""}
                      </small>
                    </div>
                  </Link>
                ))}
            </div>
          </Section>
        ))
      )}
      {mode !== "collection" && !state.photos.length && (
        <div className="empty illustrated">
          <img src="/book.svg" alt="" />
          <h2>まだ白紙の、あなたの一冊。</h2>
          <p>御朱印写真を追加すると、寺社ごとに整理されます。</p>
          <Link className="button primary" to="/photos/new">
            <Plus size={17} />
            最初の一頁を追加
          </Link>
        </div>
      )}
    </>
  );
}
export function PhotoForm() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { state, perform, busy, notify } = useDemo();
  const navigate = useNavigate();
  const existing = state.photos.find((p) => p.id === id);
  const [shrineId, setShrineId] = useState(
    existing?.shrineId || params.get("shrine") || "",
  );
  const [date, setDate] = useState(existing?.date || "");
  const [note, setNote] = useState(existing?.note || "");
  const [prepared, setPrepared] = useState<PreparedPhoto | null>(null);
  const [preview, setPreview] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [duplicate, setDuplicate] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [recordId] = useState(id || crypto.randomUUID());
  useEffect(() => {
    if (!prepared) return;
    const url = URL.createObjectURL(prepared.media.thumbnail);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [prepared]);
  const prepare = async (operation: () => Promise<PreparedPhoto>) => {
    setError("");
    setProcessing(true);
    try {
      const result = await operation();
      setPrepared(result);
      setAllowed(false);
      setDuplicate(
        existing?.hash !== result.hash &&
          state.photos.some((p) => p.id !== recordId && p.hash === result.hash),
      );
      if (result.shrineId) setShrineId(result.shrineId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setProcessing(false);
    }
  };
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!prepared && !existing) {
      setError("写真を選択してください。");
      return;
    }
    if (!shrines.some((s) => s.id === shrineId)) {
      setError("保存先の寺社を選択してください。");
      return;
    }
    if (duplicate && !allowed) {
      setError(
        "同じ写真が登録されています。追加する場合は確認欄にチェックしてください。",
      );
      return;
    }
    const record = {
      id: recordId,
      shrineId,
      date,
      note: note.trim(),
      hash: prepared?.hash || existing!.hash,
      sample: prepared?.sample ?? existing!.sample,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };
    if (
      await perform(
        async () => {
          try {
            return await repository.savePhoto(record, prepared?.media, allowed);
          } catch (e) {
            if ((e as Error).message === "DUPLICATE") {
              setDuplicate(true);
              throw Error(
                "同じ写真が登録されています。重複の確認欄をご確認ください。",
              );
            }
            throw e;
          }
        },
        existing
          ? "御朱印の記録を更新しました"
          : "御朱印を保存しました。図鑑に反映しました。",
      )
    )
      navigate(`/photos/${recordId}`, { replace: true });
  };
  if (id && !existing) return <PageTitle title="記録が見つかりません" />;
  return (
    <>
      <PageTitle
        eyebrow="ご縁を、一頁に。"
        title={existing ? "御朱印の記録を修正" : "御朱印を追加"}
      />
      <form className="photo-form" onSubmit={save}>
        <div className="photo-input-panel">
          <div className="photo-preview">
            {preview ? (
              <img src={preview} alt="保存前の写真プレビュー" />
            ) : existing ? (
              <PhotoImage id={existing.id} />
            ) : (
              <div>
                <ImagePlus size={44} />
                <p>御朱印の写真を選んでください</p>
                <small>JPEG・PNG・WebP / 20MBまで</small>
              </div>
            )}
          </div>
          <div className="actions file-actions">
            <label className="button">
              <ImagePlus size={18} />
              写真を選ぶ
              <input
                aria-label="写真を選ぶ"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={processing || busy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void prepare(() => photoProcessor.prepare(f));
                  e.target.value = "";
                }}
              />
            </label>
            <label className="button">
              <Camera size={18} />
              撮影する
              <input
                aria-label="撮影する"
                type="file"
                capture="environment"
                accept="image/jpeg,image/png,image/webp"
                disabled={processing || busy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void prepare(() => photoProcessor.prepare(f));
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <details className="sample-picker" open={!existing}>
            <summary>写真がなくても、サンプルで体験</summary>
            <p className="fine">
              サンプルによる自動整理です。実AIの読み取りではありません。画像はデモ専用の見本で、正式な御朱印ではありません。
            </p>
            <div className="sample-options">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={processing || busy}
                  onClick={() => prepare(() => photoProcessor.sample(n))}
                >
                  <img src={`/samples/sample-${n}.svg`} alt="" />
                  <span>
                    {["伊勢神社", "霊山寺", "木漏れ日神社（架空）"][n - 1]}
                  </span>
                </button>
              ))}
            </div>
          </details>
        </div>
        <div className="panel photo-fields">
          <label>
            保存先の寺社
            <select
              required
              aria-label="保存先の寺社"
              value={shrineId}
              onChange={(e) => setShrineId(e.target.value)}
            >
              <option value="">寺社を選択してください</option>
              {shrines.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}（{s.region}
                  {s.fictional ? "・架空" : ""}）
                </option>
              ))}
            </select>
          </label>
          {prepared?.sample && (
            <Notice>
              サンプルによる自動整理で寺社を選択しました。保存前に変更できます。
            </Notice>
          )}
          <label>
            授与日 <span className="optional">任意</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <p className="fine">
            分からない場合は空欄のまま「日付不明」で保存できます。撮影日は自動入力しません。
          </p>
          {date && (
            <button type="button" onClick={() => setDate("")}>
              日付不明にする
            </button>
          )}
          <label>
            ひとことメモ <span className="optional">任意</span>
            <textarea
              rows={4}
              maxLength={2000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="思い出や気づいたことを。"
            />
          </label>
          {duplicate && (
            <div className="notice">
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={allowed}
                  onChange={(e) => setAllowed(e.target.checked)}
                />
                同じ写真が登録済みであることを確認し、もう一枚追加する
              </label>
            </div>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="primary full"
            disabled={busy || processing}
            type="submit"
          >
            {processing
              ? "写真を読み込み中…"
              : busy
                ? "保存しています…"
                : existing
                  ? "変更を保存"
                  : "御朱印を保存"}
          </button>
          <p className="fine">
            端末内保存・他の人には共有されません。原画像と縮小画像を保存します。
          </p>
        </div>
      </form>
    </>
  );
}
export function PhotoDetail() {
  const { id } = useParams();
  const { state, perform, busy } = useDemo();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const p = state.photos.find((p) => p.id === id);
  if (!p)
    return (
      <>
        <PageTitle title="この記録は見つかりません" />
        <Link to="/book">御朱印帳へ</Link>
      </>
    );
  return (
    <>
      <PageTitle
        eyebrow={p.sample ? "デモ専用のサンプル画像" : "あなたの御朱印の記録"}
        title={shrineById(p.shrineId)?.name || "御朱印"}
      >
        {p.date ? `授与日 ${p.date}` : "授与日不明"}
      </PageTitle>
      <div className="record-detail">
        <div className="original-photo">
          <PhotoImage id={p.id} original />
        </div>
        <div className="panel">
          <h2>この一頁の思い出</h2>
          <p className="prose pre-wrap">{p.note || "メモはまだありません。"}</p>
          <div className="stack">
            <Link className="button primary" to={`/photos/${p.id}/edit`}>
              寺社・日付・写真を修正
            </Link>
            <Link className="button" to={`/shrines/${p.shrineId}`}>
              寺社とご祭神を見る <ArrowUpRight size={16} />
            </Link>
            <Link className="button" to="/book?mode=collection">
              図鑑への反映を見る
            </Link>
            <Link className="button" to="/missions">
              ミッションの進捗を見る
            </Link>
            <button className="danger" onClick={() => setConfirm(true)}>
              この記録を削除
            </button>
          </div>
          {confirm && (
            <div className="confirm-panel">
              <h3>写真と記録を削除しますか？</h3>
              <p>
                元に戻せません。発行済みのデモポイントは維持され、同じ達成への再付与はありません。
              </p>
              <div className="actions">
                <button
                  className="danger"
                  disabled={busy}
                  onClick={async () => {
                    if (
                      await perform(
                        () => repository.deletePhoto(p.id),
                        "写真と記録を削除しました",
                      )
                    )
                      navigate("/book", { replace: true });
                  }}
                >
                  削除する
                </button>
                <button onClick={() => setConfirm(false)}>やめる</button>
              </div>
            </div>
          )}
          <p className="fine">
            写真の原画像はこのブラウザ内に保存されています。
          </p>
        </div>
      </div>
    </>
  );
}
