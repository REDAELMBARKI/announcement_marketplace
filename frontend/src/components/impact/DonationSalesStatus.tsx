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
import { DashboardStatus } from "./types";

interface DonationSalesStatusProps {
  status: DashboardStatus;
}

interface StatusItem {
  key: string;
  label: string;
  count: number;
  fill: string;
}

function StatusPanel({
  title,
  items,
  chartData,
}: {
  title: string;
  items: StatusItem[];
  chartData: { name: string; value: number; fill: string }[];
}) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="impact-status-panel">
      <h4 className="impact-status-panel__title">{title}</h4>
      <div className="impact-status-rows">
        {items.map((item) => (
          <div key={item.key} className="impact-status-row">
            <div className="impact-status-row__left">
              <span className="impact-status-dot" style={{ background: item.fill }} />
              <span>{item.label}</span>
            </div>
            <span className="impact-legend__count">{item.count}</span>
          </div>
        ))}
      </div>

      <div className="impact-chart-wrap impact-chart-wrap--sm" style={{ marginTop: "0.75rem" }}>
        {total === 0 ? (
          <p className="impact-metric-card__hint" style={{ textAlign: "center", padding: "1rem" }}>
            No items in this group yet — counts will appear here.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5ebe7" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="#6b7f72" />
              <YAxis
                type="category"
                dataKey="name"
                width={118}
                tick={{ fontSize: 11 }}
                stroke="#6b7f72"
              />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
                {chartData.map((c) => (
                  <Cell key={c.name} fill={c.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default function DonationSalesStatus({ status }: DonationSalesStatusProps) {
  const donationItems: StatusItem[] = [
    { key: "pending", label: "Pending", count: status.donations.pending, fill: "#eab308" },
    { key: "scheduled", label: "Scheduled pickup", count: status.donations.scheduled, fill: "#3b82f6" },
    { key: "completed", label: "Completed", count: status.donations.completed, fill: "#22c55e" },
  ];

  const salesItems: StatusItem[] = [
    { key: "available", label: "Available", count: status.sales.available, fill: "#eab308" },
    { key: "reserved", label: "Reserved", count: status.sales.reserved, fill: "#f97316" },
    { key: "sold", label: "Sold", count: status.sales.sold, fill: "#22c55e" },
  ];

  const donationChart = donationItems.map((i) => ({
    name: i.label,
    value: i.count,
    fill: i.fill,
  }));

  const salesChart = salesItems.map((i) => ({
    name: i.label,
    value: i.count,
    fill: i.fill,
  }));

  return (
    <section className="impact-card">
      <h3 className="impact-card__title">Donation &amp; sales status</h3>
      <div className="impact-status-grid">
        <StatusPanel title="Donations" items={donationItems} chartData={donationChart} />
        <StatusPanel title="Sales" items={salesItems} chartData={salesChart} />
      </div>
    </section>
  );
}
