export interface DashboardStats {
  total_donated: number;
  total_sold: number;
  total_views: number;
  total_clicks: number;
}

export interface ActivityPoint {
  date: string;
  donations: number;
  announcements: number;
}

export interface TopAnnouncement {
  id: number;
  title: string;
  image_url: string | null;
  views: number;
  clicks: number;
}

export interface DashboardCategory {
  category: "Clothes" | "Shoes" | "Accessories" | string;
  count: number;
}

export interface DashboardStatus {
  donations: {
    pending: number;
    scheduled: number;
    completed: number;
  };
  sales: {
    available: number;
    reserved: number;
    sold: number;
  };
}
