import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import route from "../../../utils/route";
import "../../../css/records.css";

type Thumbnail = {
  url?: string | null;
  file_path?: string | null;
  path?: string | null;
};

type DonationProduct = {
  id: number;
  title: string;
  description?: string | null;
  condition?: string | null;
  status?: string | null;
  created_at?: string;
  pickup_address?: string | null;
  super_category?: { name?: string } | null;
  thumbnail?: Thumbnail | null;
};

function getImageUrl(media: Thumbnail | null | undefined): string | null {
  if (!media) return null;
  if (media.url && media.url.startsWith("http")) return media.url;
  const path = media.file_path || media.path;
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const clean = path.replace(/^public\//, "").replace(/^\/+/, "");
  const base = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://127.0.0.1:8000";
  return `${base}/storage/${clean}`;
}

export default function My_Donations() {
  const [donations, setDonations] = useState<DonationProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadDonations = useCallback(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      setLoading(false);
      return;
    }
    const user = JSON.parse(raw) as { id?: number };
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    axios
      .get<{ status: string; products: DonationProduct[] }>(
        route("user.donations", { userId: user.id }).toString(),
      )
      .then((res) => {
        if (res.data.status === "success" && Array.isArray(res.data.products)) {
          setDonations(res.data.products);
        } else {
          setDonations([]);
        }
      })
      .catch((err) => {
        console.error("Donation fetch error:", err);
        setDonations([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  const filtered = donations.filter((d) => {
    const cat = d.super_category?.name ?? "";
    const matchesSearch =
      (d.title?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      cat.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter
      ? (d.status ?? "").toLowerCase() === statusFilter.toLowerCase()
      : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <main>
      <div className="records-container">
        <div className="header-left">
          <h2>Donation History</h2>
        </div>

        <div className="return-right">
          <ul>
            <li>
              <Link to="/user_dashboard" className="return-link">
                Return
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by title or category..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="donate">Donate (live)</option>
          <option value="reserved">Reserved</option>
          <option value="donated">Donated</option>
          <option value="closed">Closed</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Item</th>
              <th>Description</th>
              <th>Condition</th>
              <th>Image</th>
              <th>Date</th>
              <th>Pickup</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8}>Loading donations...</td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((d) => {
                const img = getImageUrl(d.thumbnail ?? null);
                return (
                  <tr key={d.id}>
                    <td>{d.super_category?.name ?? "—"}</td>
                    <td>{d.title}</td>
                    <td>{d.description ? String(d.description).slice(0, 80) : "—"}</td>
                    <td>{d.condition ?? "—"}</td>
                    <td>
                      {img ? (
                        <a href={img} target="_blank" rel="noopener noreferrer">
                          <img
                            src={img}
                            alt={d.title}
                            style={{ width: "50px", height: "auto", borderRadius: "4px" }}
                          />
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{d.created_at ? new Date(d.created_at).toLocaleDateString() : "—"}</td>
                    <td>{d.pickup_address ?? "—"}</td>
                    <td>{d.status ?? "—"}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8}>No donation listings found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
