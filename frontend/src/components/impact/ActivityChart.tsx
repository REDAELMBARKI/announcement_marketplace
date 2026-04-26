import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ActivityPoint } from "./types";

interface ActivityChartProps {
  activity: ActivityPoint[];
}

function formatTickLabel(value: string, index: number): string {
  if (index % 7 !== 0) {
    return "";
  }
  const date = new Date(value);
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

export default function ActivityChart({ activity }: ActivityChartProps) {
  return (
    <section className="impact-card">
      <h3 className="impact-card__title">Activity (last 30 days)</h3>
      <div className="impact-chart-wrap">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={activity} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5ebe7" />
            <XAxis dataKey="date" tickFormatter={formatTickLabel} stroke="#6b7f72" fontSize={11} />
            <YAxis allowDecimals={false} stroke="#6b7f72" fontSize={11} />
            <Tooltip />
            <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "12px" }} />
            <Line
              type="monotone"
              dataKey="donations"
              name="Donations per day"
              stroke="#c2410c"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="announcements"
              name="Announcements created per day"
              stroke="#ef9f27"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
