import { TopAnnouncement } from "./types";

interface TopAnnouncementsProps {
  announcements: TopAnnouncement[];
}

export default function TopAnnouncements({ announcements }: TopAnnouncementsProps) {
  return (
    <section className="impact-card">
      <h3 className="impact-card__title">Top announcements</h3>
      {announcements.length === 0 ? (
        <div className="impact-empty">
          <span className="impact-empty__icon" aria-hidden>
            <i className="fa-regular fa-thumbs-down" />
          </span>
          No announcements yet — post your first one!
        </div>
      ) : (
        <div className="impact-announce-list">
          {announcements.slice(0, 3).map((item, index) => (
            <article key={item.id} className="impact-announce-item">
              <div className="impact-announce-item__rank">#{index + 1}</div>
              <img
                src={item.image_url || "https://placehold.co/48x48?text=IMG"}
                alt=""
                className="impact-announce-item__img"
              />
              <div className="impact-announce-item__meta">
                <p className="impact-announce-item__title">{item.title}</p>
                <div className="impact-announce-item__sub">
                  <span>
                    <i className="fa-solid fa-eye" aria-hidden /> {item.views} views
                  </span>
                  <span>
                    <i className="fa-solid fa-phone" aria-hidden /> {item.clicks} clicks
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
