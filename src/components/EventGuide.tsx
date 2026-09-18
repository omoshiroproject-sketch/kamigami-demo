import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { useDemo } from "../context";
import { jstDate } from "../data/seed";
import {
  eventDate,
  eventImageUrl,
  homeEvents,
  safeEventUrl,
} from "../services/events";
import type { EventItem } from "../types";
import { PageTitle, Section } from "./Primitives";

export function EventVisual({
  event,
  eager = false,
}: {
  event: EventItem;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const src = eventImageUrl(event.image?.src);
  return (
    <div className="event-visual">
      {src && !failed ? (
        <img
          src={src}
          alt={event.image!.alt}
          loading={eager ? "eager" : "lazy"}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="event-photo-placeholder">
          <CalendarDays size={40} />
          <span>まつり・イベント</span>
        </div>
      )}
    </div>
  );
}

function RecommendationDemo() {
  return (
    <span className="event-recommendation">
      道幸先生のおすすめ枠 <small>掲載デモ</small>
    </span>
  );
}

export function EventFeatureCard({
  event,
  eager = false,
}: {
  event: EventItem;
  eager?: boolean;
}) {
  const ended =
    event.status === "終了" || jstDate(new Date(event.date)) < jstDate();
  return (
    <Link className="event-card event-feature-card" to={`/events/${event.id}`}>
      <div className="event-card-image">
        <EventVisual key={event.image?.src} event={event} eager={eager} />
        <span className="event-date-chip">
          <CalendarDays size={15} />
          {new Date(event.date).toLocaleDateString("ja-JP", {
            timeZone: "Asia/Tokyo",
            month: "long",
            day: "numeric",
            weekday: "short",
          })}
        </span>
      </div>
      <div className="event-card-copy">
        {event.recommendationDemo && <RecommendationDemo />}
        <span className="event-place">
          <MapPin size={14} />
          {event.venue || "架空のデモ会場"}
        </span>
        <h2>{event.title}</h2>
        <p>{event.summary || event.description}</p>
        <div className="event-card-footer">
          <span>
            {ended
              ? "終了"
              : event.infoOnly
                ? "祭典のご案内"
                : event.remaining
                  ? `デモ申込 · 残り${event.remaining}席`
                  : "満席"}
          </span>
          <b>
            詳しく見る <ArrowUpRight size={17} />
          </b>
        </div>
        {event.image && (
          <small className="event-card-credit">
            写真：{event.image.author} / {event.image.license}
          </small>
        )}
      </div>
    </Link>
  );
}

export function HomeEvents() {
  const { state } = useDemo();
  const events = homeEvents(state.events).slice(0, 3);
  return (
    <section className="home-events" aria-label="まつり・イベント">
      <div className="event-section-heading">
        <div>
          <span className="eyebrow">季節にふれる、特別な一日。</span>
          <h2>まつり・イベント</h2>
        </div>
        <Link to="/events">
          すべて見る <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="home-event-list">
        {events.map((event, index) => (
          <EventFeatureCard key={event.id} event={event} eager={index === 0} />
        ))}
      </div>
      {!events.length && (
        <p className="event-empty">次のイベント情報をお楽しみに。</p>
      )}
    </section>
  );
}

export function EventImageCredit({ event }: { event: EventItem }) {
  const photo = event.image;
  if (!photo) return null;
  return (
    <p className="event-image-credit">
      写真：{photo.author}
      {photo.date && `（${photo.date}撮影）`} ·{" "}
      <a href={safeEventUrl(photo.source)} target="_blank" rel="noreferrer">
        出典
      </a>{" "}
      ·{" "}
      <a href={safeEventUrl(photo.licenseUrl)} target="_blank" rel="noreferrer">
        {photo.license}
      </a>
      。表示枠に合わせてトリミングしています。
    </p>
  );
}

export function InformationEventDetail({ event }: { event: EventItem }) {
  const official = safeEventUrl(event.officialUrl);
  return (
    <article className="event-guide">
      <Link className="inline-link" to="/events">
        まつり・イベント一覧へ
      </Link>
      <PageTitle eyebrow="まつりを知り、その土地にふれる。" title={event.title}>
        {event.summary}
      </PageTitle>
      {event.recommendationDemo && (
        <div className="event-demo-note">
          <RecommendationDemo />
          <p>
            おすすめ情報を掲載するための見本です。道幸先生ご本人の推薦を確認した情報ではありません。
          </p>
        </div>
      )}
      <EventVisual key={event.image?.src} event={event} eager />
      <EventImageCredit event={event} />
      <div className="event-guide-columns">
        <div className="event-guide-story">
          <Section title="このお祭りについて">
            <p>{event.description}</p>
          </Section>
          {event.history && (
            <Section title="祭典の由来">
              <p>{event.history}</p>
            </Section>
          )}
          {event.highlights && (
            <Section title="見どころ">
              <p>{event.highlights}</p>
            </Section>
          )}
        </div>
        <aside className="event-practical" aria-label="開催概要">
          <h2>開催概要</h2>
          {(event.status === "終了" ||
            jstDate(new Date(event.date)) < jstDate()) && (
            <span className="tag">終了したイベント</span>
          )}
          <dl>
            <dt>日時</dt>
            <dd>
              <time dateTime={event.date}>{eventDate(event.date)}</time>
              <small>日本時間</small>
            </dd>
            <dt>場所</dt>
            <dd>
              {event.venue}
              <small>{event.address}</small>
            </dd>
            {event.fee && (
              <>
                <dt>参加費</dt>
                <dd>{event.fee}</dd>
              </>
            )}
            {event.access && (
              <>
                <dt>アクセス</dt>
                <dd>{event.access}</dd>
              </>
            )}
          </dl>
          {official && (
            <a
              className="button primary full"
              href={official}
              target="_blank"
              rel="noreferrer"
            >
              公式案内を確認する <ArrowUpRight size={16} />
            </a>
          )}
          {event.address && (
            <a
              className="button full"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue || ""} ${event.address}`)}`}
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={16} />
              地図で場所を見る
            </a>
          )}
          <p className="fine">
            このページは情報の紹介です。アプリでの予約・参加券発行はありません。内容の変更や最新の催行情報は主催者の案内をご確認ください。
          </p>
        </aside>
      </div>
      {event.sourceNote && (
        <p className="event-source-note">{event.sourceNote}</p>
      )}
    </article>
  );
}
