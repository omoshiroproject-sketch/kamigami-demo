import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Shrine } from "../types";
export default function MapView({
  shrines,
  position,
}: {
  shrines: Shrine[];
  position: [number, number] | null;
}) {
  const element = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!element.current) return;
    setFailed(false);
    const map = L.map(element.current, { scrollWheelZoom: false }).setView(
      [34.75, 134.8],
      7,
    );
    const tiles = L.tileLayer(
      import.meta.env.VITE_MAP_TILE_URL ||
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
        maxZoom: 18,
      },
    );
    tiles.on("tileerror", () => setFailed(true));
    tiles.addTo(map);
    const markers = shrines.map((s) => {
      const icon = L.divIcon({
        className: "map-pin",
        html: `<span>${s.kind === "神社" ? "⛩" : "寺"}</span>`,
        iconSize: [36, 36],
        iconAnchor: [18, 34],
      });
      const marker = L.marker([s.lat, s.lng], {
        icon,
        title: s.name,
        alt: s.name,
      }).addTo(map);
      marker.getElement()?.setAttribute("aria-label", s.name);
      const node = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = s.name;
      const p = document.createElement("p");
      p.textContent = s.fictional
        ? "架空のサンプル地点"
        : "所在地付近の参考位置";
      const b = document.createElement("button");
      b.textContent = "詳細を見る";
      b.onclick = () => navigate(`/shrines/${s.id}`);
      node.append(title, p, b);
      marker.bindPopup(node);
      return marker;
    });
    if (markers.length)
      map.fitBounds(L.featureGroup(markers).getBounds(), {
        padding: [35, 35],
        maxZoom: 13,
      });
    if (position) {
      L.circleMarker(position, { radius: 8, color: "#a4402d" })
        .addTo(map)
        .bindPopup("現在地（保存しません）");
      map.setView(position, 12);
    }
    return () => {
      map.remove();
    };
  }, [shrines, position, navigate]);
  return (
    <>
      <div className="map" ref={element} aria-label="寺社の地図" />
      {failed && (
        <div role="status" className="notice">
          地図画像を読み込めません。下の寺社一覧と詳細の外部地図リンクを利用できます。
        </div>
      )}
      <p className="fine">
        ピンを押すと詳細へ進めます。架空寺社のピンは操作用です。実在寺社も入口を確認した位置ではありません。
      </p>
      <a
        className="fine"
        href="https://www.openstreetmap.org/fixthemap"
        target="_blank"
        rel="noreferrer"
      >
        地図の問題を報告
      </a>
    </>
  );
}
