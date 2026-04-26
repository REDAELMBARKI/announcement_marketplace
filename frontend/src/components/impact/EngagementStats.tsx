import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardStats } from "./types";

interface EngagementStatsProps {
  stats: DashboardStats;
}

export default function EngagementStats({ stats }: EngagementStatsProps) {
  const conversionRate =
    stats.total_views > 0
      ? `${Math.round((stats.total_clicks / stats.total_views) * 100)}%`
      : "—";

  const barData = [
    { name: "Views", value: stats.total_views, fill: "#ea580c" },
    { name: "Contact clicks", value: stats.total_clicks, fill: "#ef9f27" },
  ];

  return (
    <section className="impact-card">
      <h3 className="impact-card__title">Engagement</h3>
      <div className="impact-engagement-row">
        <div className="impact-engagement-stats">
          <div className="impact-stat-pill">
            <p className="impact-stat-pill__label">Total views</p>
            <p className="impact-stat-pill__value">{stats.total_views}</p>
          </div>
          <div className="impact-stat-pill">
            <p className="impact-stat-pill__label">Total contact clicks</p>
            <p className="impact-stat-pill__value">{stats.total_clicks}</p>
          </div>
          <div className="impact-stat-pill">
            <p className="impact-stat-pill__label">Conversion rate</p>
            <p className="impact-stat-pill__value">{conversionRate}</p>
            <p className="impact-metric-card__hint" style={{ marginTop: "0.35rem" }}>
              clicks ÷ views (all time)
            </p>
          </div>
        </div>
        <div>
          <p className="impact-metric-card__label" style={{ marginBottom: "0.5rem" }}>
            Views vs contact clicks
          </p>
          <div className="impact-chart-wrap impact-chart-wrap--sm">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5ebe7" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#6b7f72" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#6b7f72" />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  {barData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
