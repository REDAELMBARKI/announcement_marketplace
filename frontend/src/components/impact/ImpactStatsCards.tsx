import { DashboardStats } from "./types";

interface ImpactStatsCardsProps {
  stats: DashboardStats;
}

export default function ImpactStatsCards({ stats }: ImpactStatsCardsProps) {
  const cards = [
    {
      title: "Total Items Donated",
      value: stats.total_donated,
      subtitle: "all time",
      iconClass: "fa-solid fa-box-open",
    },
    {
      title: "Total Items Sold",
      value: stats.total_sold,
      subtitle: "all time",
      iconClass: "fa-solid fa-tags",
    },
    {
      title: "Total Views",
      value: stats.total_views,
      subtitle: "across all posts",
      iconClass: "fa-solid fa-eye",
    },
    {
      title: "Total Contact Clicks",
      value: stats.total_clicks,
      subtitle: "people reached out",
      iconClass: "fa-solid fa-phone",
    },
  ];

  return (
    <section className="impact-card">
      <h3 className="impact-card__title">My Impact Overview</h3>
      <div className="impact-metrics-grid">
        {cards.map((card) => (
          <article key={card.title} className="impact-metric-card">
            <div className="impact-metric-card__icon" aria-hidden>
              <i className={card.iconClass} />
            </div>
            <p className="impact-metric-card__label">{card.title}</p>
            <p className="impact-metric-card__value">{card.value}</p>
            <p className="impact-metric-card__hint">{card.subtitle}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
