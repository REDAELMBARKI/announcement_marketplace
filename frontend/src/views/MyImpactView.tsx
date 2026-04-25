import { useEffect, useState } from "react";
import api from "../services/api";
import ActivityChart from "../components/impact/ActivityChart";
import CategoryBreakdown from "../components/impact/CategoryBreakdown";
import DonationSalesStatus from "../components/impact/DonationSalesStatus";
import EngagementStats from "../components/impact/EngagementStats";
import ImpactStatsCards from "../components/impact/ImpactStatsCards";
import TopAnnouncements from "../components/impact/TopAnnouncements";
import {
  ActivityPoint,
  DashboardCategory,
  DashboardStats,
  DashboardStatus,
  TopAnnouncement,
} from "../components/impact/types";
import "../css/impact-dashboard.css";

const useMockData = false;

const mockStats: DashboardStats = {
  total_donated: 14,
  total_sold: 6,
  total_views: 450,
  total_clicks: 92,
};

const mockActivity: ActivityPoint[] = [
  { date: "2026-04-01", donations: 2, announcements: 1 },
  { date: "2026-04-08", donations: 1, announcements: 3 },
  { date: "2026-04-15", donations: 3, announcements: 2 },
  { date: "2026-04-22", donations: 2, announcements: 4 },
];

const mockTop: TopAnnouncement[] = [
  { id: 1, title: "Kids Jacket Bundle", image_url: null, views: 120, clicks: 17 },
  { id: 2, title: "School Shoes Size 32", image_url: null, views: 90, clicks: 9 },
  { id: 3, title: "Winter Accessories Pack", image_url: null, views: 70, clicks: 6 },
];

const mockCategories: DashboardCategory[] = [
  { category: "Clothes", count: 12 },
  { category: "Shoes", count: 4 },
  { category: "Accessories", count: 5 },
];

const mockStatus: DashboardStatus = {
  donations: { pending: 3, scheduled: 2, completed: 9 },
  sales: { available: 4, reserved: 1, sold: 6 },
};

export default function MyImpactView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityPoint[]>([]);
  const [topAnnouncements, setTopAnnouncements] = useState<TopAnnouncement[]>([]);
  const [categories, setCategories] = useState<DashboardCategory[]>([]);
  const [statusData, setStatusData] = useState<DashboardStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      if (useMockData) {
        setStats(mockStats);
        setActivity(mockActivity);
        setTopAnnouncements(mockTop);
        setCategories(mockCategories);
        setStatusData(mockStatus);
        setLoading(false);
        return;
      }

      try {
        const [statsRes, activityRes, topRes, categoriesRes, statusRes] = await Promise.all([
          api.get<DashboardStats>("/dashboard/stats"),
          api.get<ActivityPoint[]>("/dashboard/activity"),
          api.get<TopAnnouncement[]>("/dashboard/top-announcements"),
          api.get<DashboardCategory[]>("/dashboard/categories"),
          api.get<DashboardStatus>("/dashboard/status"),
        ]);

        setStats(statsRes.data);
        setActivity(activityRes.data);
        setTopAnnouncements(topRes.data);
        setCategories(categoriesRes.data);
        setStatusData(statusRes.data);
      } catch (_err) {
        setError("Unable to load your impact data right now.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="impact-root impact-loading">
        <div className="impact-skeleton" />
        <div className="impact-skeleton impact-skeleton--tall" />
        <div className="impact-skeleton" />
      </div>
    );
  }

  if (error || !stats || !statusData) {
    return (
      <div className="impact-root">
        <div className="impact-error">{error || "Unable to render impact view."}</div>
      </div>
    );
  }

  return (
    <div className="impact-root">
      <h2 className="impact-section-title">My Impact</h2>
      <div className="impact-stack">
        <ImpactStatsCards stats={stats} />
        <ActivityChart activity={activity} />
        <EngagementStats stats={stats} />
        <div className="impact-grid-2">
          <TopAnnouncements announcements={topAnnouncements} />
          <CategoryBreakdown categories={categories} />
        </div>
        <DonationSalesStatus status={statusData} />
      </div>
    </div>
  );
}
