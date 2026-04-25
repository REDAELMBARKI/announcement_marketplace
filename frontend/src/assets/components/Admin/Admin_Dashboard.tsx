import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "../../../css/admin.css";
import api from "../../../services/api";

type TrendPoint = { label: string; count: number };
type StatsResponse = {
  total_announcements: number;
  active_announcements: number;
  pending_moderation: number;
  new_users_today: number;
  donation_trends: TrendPoint[];
  user_trends: TrendPoint[];
};
type TypeSplitResponse = { donations: number; sales: number };
type FunnelResponse = {
  posted: number;
  active: number;
  contacted: number;
  closed: number;
};
type CategoryPoint = { category: string; count: number };
type UserRetentionResponse = { new_users: number; returning_users: number };
type PendingItem = {
  id: number;
  type: "donate" | "sell" | string;
  title: string;
  city: string;
  time_ago: string;
};
type PendingResponse = { items: PendingItem[]; total: number };

const donutColors = {
  donation: "#22c55e",
  sale: "#f59e0b",
  newUser: "#7c3aed",
  returningUser: "#a78bfa",
};

const funnelColors = ["#bbf7d0", "#86efac", "#4ade80", "#16a34a"];

function CardError({ message }: { message: string }) {
  return <p className="card-error">{message}</p>;
}

export function Admin_Dashboard() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [typeSplit, setTypeSplit] = useState<TypeSplitResponse | null>(null);
  const [funnel, setFunnel] = useState<FunnelResponse | null>(null);
  const [categories, setCategories] = useState<CategoryPoint[]>([]);
  const [retention, setRetention] = useState<UserRetentionResponse | null>(null);
  const [hourlyActivity, setHourlyActivity] = useState<number[]>([]);
  const [pendingModeration, setPendingModeration] = useState<PendingResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const nextErrors: Record<string, string> = {};

      const requests = await Promise.allSettled([
        api.get("/admin/stats"),
        api.get("/admin/stats/type-split"),
        api.get("/admin/stats/funnel"),
        api.get("/admin/stats/categories"),
        api.get("/admin/stats/user-retention"),
        api.get("/admin/stats/hourly-activity"),
        api.get("/admin/moderation/pending?limit=5"),
      ]);

      const [statsRes, splitRes, funnelRes, categoriesRes, retentionRes, hourlyRes, pendingRes] =
        requests;

      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data.data);
      } else {
        nextErrors.stats = "Unable to load overview stats.";
      }

      if (splitRes.status === "fulfilled") {
        setTypeSplit(splitRes.value.data.data);
      } else {
        nextErrors.typeSplit = "Unable to load donation vs sale split.";
      }

      if (funnelRes.status === "fulfilled") {
        setFunnel(funnelRes.value.data.data);
      } else {
        nextErrors.funnel = "Unable to load announcement funnel.";
      }

      if (categoriesRes.status === "fulfilled") {
        setCategories(categoriesRes.value.data.data || []);
      } else {
        nextErrors.categories = "Unable to load top categories.";
      }

      if (retentionRes.status === "fulfilled") {
        setRetention(retentionRes.value.data.data);
      } else {
        nextErrors.retention = "Unable to load user retention.";
      }

      if (hourlyRes.status === "fulfilled") {
        setHourlyActivity(hourlyRes.value.data.data || []);
      } else {
        nextErrors.hourly = "Unable to load hourly posting activity.";
      }

      if (pendingRes.status === "fulfilled") {
        setPendingModeration(pendingRes.value.data.data);
      } else {
        nextErrors.pending = "Unable to load pending moderation queue.";
      }

      setErrors(nextErrors);
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  const typeSplitData = useMemo(
    () => [
      { name: "Donations", value: typeSplit?.donations ?? 0, color: donutColors.donation },
      { name: "Sales", value: typeSplit?.sales ?? 0, color: donutColors.sale },
    ],
    [typeSplit],
  );

  const retentionData = useMemo(
    () => [
      { name: "New Users", value: retention?.new_users ?? 0, color: donutColors.newUser },
      {
        name: "Returning Users",
        value: retention?.returning_users ?? 0,
        color: donutColors.returningUser,
      },
    ],
    [retention],
  );

  const funnelStages = useMemo(() => {
    const posted = funnel?.posted ?? 0;
    return [
      { label: "Posted", count: posted, color: funnelColors[0] },
      { label: "Active", count: funnel?.active ?? 0, color: funnelColors[1] },
      { label: "Contacted", count: funnel?.contacted ?? 0, color: funnelColors[2] },
      { label: "Closed", count: funnel?.closed ?? 0, color: funnelColors[3] },
    ].map((stage) => ({
      ...stage,
      percentage: posted > 0 ? Math.round((stage.count / posted) * 100) : 0,
    }));
  }, [funnel]);

  const hourlyMax = Math.max(...hourlyActivity, 0);
  const pendingCount = pendingModeration?.items?.length ?? 0;
  const pendingTotal = pendingModeration?.total ?? pendingCount;
  const pendingMore = Math.max(pendingTotal - pendingCount, 0);

  return (
    <div className="admin-dashboard">
      <div className="admin-links">
        <h2>Welcome Admin!</h2>
        <ul>
          <li>
            <i className="fa-solid fa-users"></i>
            <Link to="/view_users">View Users</Link>
          </li>
          <li>
            <i className="fa-solid fa-database"></i>
            <Link to="/admin_inventory">View Inventory</Link>
          </li>
          <li>
            <i className="fa-solid fa-hand-holding-heart"></i>
            <Link to="/admin_donations">Announcements</Link>
          </li>
          <li>
            <i className="fa-solid fa-chart-line"></i>
            <Link to="/data_reports">Data Reports</Link>
          </li>
          <li>
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            <button
              className="admin-button"
              onClick={() => {
                localStorage.removeItem("admin");
                window.location.href = "/login";
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      <div className="admin-overview">
        <div className="Stats">
          <div>
            <h4>Total Announcements</h4>
            {loading ? (
              <p>...</p>
            ) : (
              <p>{stats?.total_announcements ?? 0}</p>
            )}
            {errors.stats ? <CardError message={errors.stats} /> : null}
          </div>
          <div>
            <h4>Active Listings</h4>
            {loading ? (
              <p>...</p>
            ) : (
              <p>{stats?.active_announcements ?? 0}</p>
            )}
            {errors.stats ? <CardError message={errors.stats} /> : null}
          </div>
          <div>
            <h4>Pending Moderation</h4>
            {loading ? (
              <p>...</p>
            ) : (
              <p className={(stats?.pending_moderation ?? 0) > 0 ? "pending-warning" : ""}>
                {stats?.pending_moderation ?? 0}
              </p>
            )}
            {errors.stats ? <CardError message={errors.stats} /> : null}
          </div>
          <div>
            <h4>New Users Today</h4>
            {loading ? (
              <p>...</p>
            ) : (
              <p>{stats?.new_users_today ?? 0}</p>
            )}
            {errors.stats ? <CardError message={errors.stats} /> : null}
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="two-col-grid">
          <div className="chart-card">
            <h3>Donation Trends</h3>
            <div className="chart-box">
              {loading ? (
                <p>Loading chart...</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.donation_trends ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#22c55e"
                      fill="rgba(34, 197, 94, 0.25)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            {errors.stats ? <CardError message={errors.stats} /> : null}
          </div>

          <div className="chart-card">
            <h3>Monthly User Trends</h3>
            <div className="chart-box">
              {loading ? (
                <p>Loading chart...</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.user_trends ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      fill="rgba(59, 130, 246, 0.25)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            {errors.stats ? <CardError message={errors.stats} /> : null}
          </div>
        </div>

        <div className="two-col-grid">
          <div className="chart-card">
            <h3>Donation vs Sale Split</h3>
            <div className="donut-layout">
              <div className="donut-box">
                {loading ? (
                  <p>Loading chart...</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeSplitData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={80}
                      >
                        {typeSplitData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="chart-legend">
                {typeSplitData.map((item) => {
                  const total = (typeSplit?.donations ?? 0) + (typeSplit?.sales ?? 0);
                  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                  return (
                    <div key={item.name} className="legend-item">
                      <span className="legend-dot" style={{ background: item.color }} />
                      <span>
                        {item.name}: {item.value} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            {errors.typeSplit ? <CardError message={errors.typeSplit} /> : null}
          </div>

          <div className="chart-card">
            <h3>New vs Returning Users</h3>
            <div className="donut-layout">
              <div className="donut-box">
                {loading ? (
                  <p>Loading chart...</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={retentionData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={80}
                      >
                        {retentionData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="chart-legend">
                {retentionData.map((item) => (
                  <div key={item.name} className="legend-item">
                    <span className="legend-dot" style={{ background: item.color }} />
                    <span>
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {errors.retention ? <CardError message={errors.retention} /> : null}
          </div>
        </div>

        <div className="two-col-grid">
          <div className="chart-card">
            <h3>Announcement Funnel</h3>
            <div className="funnel-wrap">
              {loading
                ? Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="funnel-skeleton">Loading...</div>
                  ))
                : funnelStages.map((stage) => (
                    <div key={stage.label}>
                      <div className="funnel-row-head">
                        <span>{stage.label}</span>
                        <span>
                          {stage.count} ({stage.percentage}%)
                        </span>
                      </div>
                      <div className="funnel-row-track">
                        <div
                          className="funnel-row-fill"
                          style={{
                            width: `${Math.max(stage.percentage, stage.count > 0 ? 8 : 0)}%`,
                            backgroundColor: stage.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
            </div>
            {errors.funnel ? <CardError message={errors.funnel} /> : null}
          </div>

          <div className="chart-card">
            <h3>Top Categorie</h3>
            <div className="chart-box">
              {loading ? (
                <p>Loading chart...</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categories} layout="vertical" margin={{ left: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="category" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            {errors.categories ? <CardError message={errors.categories} /> : null}
          </div>
        </div>

        <div className="chart-card full-width-card">
          <h3>Peak Posting Hours</h3>
          <div className="hourly-grid">
            {(loading ? Array.from({ length: 24 }, () => 0) : hourlyActivity).map((count, hour) => {
              const intensity = hourlyMax > 0 ? count / hourlyMax : 0;
              const bg = `rgba(22, 163, 74, ${Math.max(0.08, intensity)})`;
              return (
                <div
                  key={`hour-${hour}`}
                  className="hour-cell"
                  style={{ backgroundColor: bg }}
                  title={`${hour}h: ${count} posts`}
                />
              );
            })}
          </div>
          <div className="hour-labels">
            <span>0h</span>
            <span>4h</span>
            <span>8h</span>
            <span>12h</span>
            <span>16h</span>
            <span>20h</span>
          </div>
          {errors.hourly ? <CardError message={errors.hourly} /> : null}
        </div>

        <div className="chart-card full-width-card">
          <h3>Pending Moderation Queue</h3>
          <div className="pending-list">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="pending-item">Loading...</div>
              ))
            ) : (pendingModeration?.items?.length ?? 0) === 0 ? (
              <p>No announcements pending moderation.</p>
            ) : (
              pendingModeration?.items?.map((item) => (
                <div key={item.id} className="pending-item">
                  <div className="pending-left">
                    <span
                      className={item.type === "donate" ? "tag-donation" : "tag-sale"}
                    >
                      {item.type === "donate" ? "Donation" : "Sale"}
                    </span>
                    <div>
                      <p>{item.title}</p>
                      <p className="muted-text">{item.city}</p>
                    </div>
                  </div>
                  <span className="muted-text">{item.time_ago}</span>
                </div>
              ))
            )}
          </div>
          <div className="pending-footer">
            <Link to="/admin_donations">
              {pendingMore} more in queue -&gt;
            </Link>
          </div>
          {errors.pending ? <CardError message={errors.pending} /> : null}
        </div>
      </div>
    </div>
  );
}

export default Admin_Dashboard;
