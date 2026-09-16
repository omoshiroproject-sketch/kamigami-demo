import { useState } from "react";
import type { Shrine } from "../types";
import { stories } from "../data/stories";
export function PlaceVisual({
  shrine,
  eager = false,
}: {
  shrine: Shrine;
  eager?: boolean;
}) {
  const photo = stories[shrine.id]?.photo;
  const [failed, setFailed] = useState(false);
  const fallback = shrine.kind === "寺院" ? "/temple.svg" : "/shrine.svg";
  return (
    <>
      <img
        src={photo && !failed ? photo.src : fallback}
        alt={
          photo && !failed
            ? photo.alt
            : `${shrine.name}：寺社のイメージイラスト（実景ではありません）`
        }
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onError={() => setFailed(true)}
      />
      {failed && photo && (
        <span className="image-fallback">
          写真を読み込めないためイラストを表示
        </span>
      )}
    </>
  );
}
export function PhotoCredit({ shrine }: { shrine: Shrine }) {
  const photo = stories[shrine.id]?.photo;
  if (!photo)
    return (
      <p className="photo-credit">
        イメージイラスト · 実際の建物の写真ではありません
        {!shrine.fictional && "（再利用できる実景写真を確認できていません）"}
      </p>
    );
  return (
    <p className="photo-credit">
      写真：
      <a href={photo.source} target="_blank" rel="noreferrer">
        {photo.author} / Wikimedia Commons
      </a>{" "}
      ·{" "}
      <a href={photo.licenseUrl} target="_blank" rel="noreferrer">
        {photo.license}
      </a>
      <br />
      撮影 {photo.date} · 表示枠に合わせてトリミング ·
      現在の景観と異なる場合があります
    </p>
  );
}
