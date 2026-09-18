import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MapPin, ArrowLeft } from "lucide-react";
import type { Shrine } from "../types";
import { useDemo } from "../context";
import { PlaceVisual } from "./PlaceVisual";
import { stories } from "../data/stories";
import { repository } from "../services/storage";
export function Notice({ children }: { children: ReactNode }) {
  return <div className="notice">{children}</div>;
}
export function Section({
  title,
  link,
  to,
  children,
}: {
  title: string;
  link?: string;
  to?: string;
  children: ReactNode;
}) {
  return (
    <section className="section">
      <div className="section-heading">
        <h2>{title}</h2>
        {to && (
          <Link to={to}>
            {link || "すべて見る"} <ChevronRight size={15} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
export function PageTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-title">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </div>
  );
}
export function Back({ onBack }: { onBack: () => void }) {
  return (
    <button className="back" onClick={onBack}>
      <ArrowLeft size={17} /> 戻る
    </button>
  );
}
export function ShrineCard({
  shrine,
  visited: visitedOverride,
  favorite: favoriteOverride,
}: {
  shrine: Shrine;
  visited?: boolean;
  favorite?: boolean;
}) {
  const { state } = useDemo();
  const visited = visitedOverride ?? !!state.visits[shrine.id];
  const favorite = favoriteOverride ?? state.favorites.includes(shrine.id);
  return (
    <Link className="shrine-card" to={`/shrines/${shrine.id}`}>
      <div className={`shrine-art ${shrine.kind === "寺院" ? "temple" : ""}`}>
        <PlaceVisual shrine={shrine} />
        <span>{shrine.kind}</span>
        {stories[shrine.id]?.photo && (
          <small className="card-photo-credit">
            Photo: {stories[shrine.id].photo!.author} ·{" "}
            {stories[shrine.id].photo!.license}
          </small>
        )}
      </div>
      <div className="shrine-card-body">
        <div className="mini-label">
          {shrine.fictional
            ? "架空サンプル"
            : `${shrine.region} / ${shrine.kind}`}
          {favorite ? " ・ お気に入り" : ""}
        </div>
        <h3>{shrine.name}</h3>
        {stories[shrine.id] && (
          <div className="card-story">{stories[shrine.id].subtitle}</div>
        )}
        <p>
          <MapPin size={13} />
          {shrine.region} · {shrine.city}
        </p>
        <span className={visited ? "tag filled" : "tag"}>
          {visited ? "デモ参拝済み" : "まだ訪れていない場所"}
        </span>
      </div>
      <ChevronRight className="card-arrow" size={18} />
    </Link>
  );
}
export function PhotoImage({
  id,
  original = false,
  className = "",
  alt = "保存した御朱印写真",
}: {
  id: string;
  original?: boolean;
  className?: string;
  alt?: string;
}) {
  const [src, setSrc] = useState("");
  const [error, setError] = useState(false);
  useEffect(() => {
    let live = true,
      url = "";
    repository
      .media(id)
      .then((m) => {
        if (!m) throw Error();
        url = URL.createObjectURL(original ? m.original : m.thumbnail);
        if (live) setSrc(url);
        else URL.revokeObjectURL(url);
      })
      .catch(() => {
        if (live) setError(true);
      });
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id, original]);
  return error ? (
    <div className="empty">
      写真を読み込めません。記録の修正から写真を選び直せます。
    </div>
  ) : src ? (
    <img
      className={className}
      src={src}
      alt={alt}
      onError={() => setError(true)}
    />
  ) : (
    <div className="photo-placeholder">読み込み中…</div>
  );
}
export function dateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(+date)) return value;
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
