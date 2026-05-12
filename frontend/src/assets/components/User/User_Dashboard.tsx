import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../../services/api";
import route from "../../../utils/route";
import "../../../css/user.css";
import MyImpactView from "../../../views/MyImpactView";

type ProductRow = Record<string, unknown>;

export default function User_Dashboard() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [allListings, setAllListings] = useState<ProductRow[]>([]);
  const [donationListings, setDonationListings] = useState<ProductRow[]>([]);
  const [foundations, setFoundations] = useState<{ id: number; name: string; phone?: string }[]>([]);
  const [loadingFoundations, setLoadingFoundations] = useState(true);
  const [recentFilter, setRecentFilter] = useState<"all" | "donations" | "sale">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser
      ? (JSON.parse(storedUser) as Record<string, unknown>)
      : { user_ID: 0, user_name: "Guest", donor: {} };
    setUser(parsedUser);
  }, [id, navigate]);

  useEffect(() => {
    const uid = user?.id as number | undefined;
    if (!uid) return;

    Promise.all([
      api.get<{ status: string; products: ProductRow[] }>(route("user.announcements", { userId: uid }).toString()),
      api.get<{ status: string; products: ProductRow[] }>(route("user.donations", { userId: uid }).toString()),
    ])
      .then(([annRes, donRes]) => {
        const ann = annRes.data.status === "success" && Array.isArray(annRes.data.products) ? annRes.data.products : [];
        const don = donRes.data.status === "success" && Array.isArray(donRes.data.products) ? donRes.data.products : [];
        setAllListings(ann);
        setDonationListings(don);
      })
      .catch((err) => console.error("Listings fetch error:", err));
  }, [user]);

  useEffect(() => {
    api
      .get<{ status: string; foundations: { id: number; name: string; phone?: string }[] }>("/foundations")
      .then((res) => {
        if (res.data.status === "success" && Array.isArray(res.data.foundations)) {
          setFoundations(res.data.foundations);
        }
      })
      .catch(() => setFoundations([]))
      .finally(() => setLoadingFoundations(false));
  }, []);

  const displayedRows = useMemo(() => {
    let rows: ProductRow[] = [];
    if (recentFilter === "donations") {
      rows = donationListings;
    } else if (recentFilter === "sale") {
      rows = allListings.filter((p) => p.listing_mode === "sell");
    } else {
      rows = allListings;
    }
    const sorted = [...rows].sort((a, b) => {
      const ta = a.created_at ? new Date(String(a.created_at)).getTime() : 0;
      const tb = b.created_at ? new Date(String(b.created_at)).getTime() : 0;
      return tb - ta;
    });
    return sorted.slice(0, 8);
  }, [recentFilter, allListings, donationListings]);

  const donationThumbUrl = (d: ProductRow) => {
    const thumb = d.thumbnail as { url?: string; file_path?: string; path?: string } | undefined;
    if (!thumb) return null;
    if (thumb.url && String(thumb.url).startsWith("http")) return String(thumb.url);
    const path = thumb.file_path || thumb.path;
    if (!path) return null;
    const clean = String(path).replace(/^public\//, "").replace(/^\/+/, "");
    const base = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://127.0.0.1:8000";
    return `${base}/storage/${clean}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <>
      <div className="user-dashboard-container">
        <div className="dashboard-left">
          <div className="dashboard">
            <aside className="links">
              <ul>
                <li>
                  <i className="fa-solid fa-gauge"></i>
                  <Link to="/user_dashboard">My Impact</Link>
                </li>
                <li>
                  <i className="fa-solid fa-shop"></i>
                  <Link to="/marketplace">Marketplace</Link>
                </li>
                <li>
                  <i className="fa-solid fa-list"></i>
                  <Link to="/my_announcements">My Announcements</Link>
                </li>
                <li>
                  <i className="fa-solid fa-inbox"></i>
                  <Link to="/my_donations">My Donations</Link>
                </li>
                <li>
                  <i className="fa-solid fa-user"></i>
                  <Link to="/my_profile">Profile Settings</Link>
                </li>
                <li>
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  <button type="button" className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            </aside>

            <main className="dashboard-main">
              <h2>Welcome, {(user.user_name as string) ?? (user.name as string) ?? "Guest"}</h2>
              <MyImpactView />
            </main>
          </div>
        </div>

        <div className="dashboard-right">
          <div className="new-donation">
            <h3>Your marketplace</h3>
            <p>
              Post anything you want to sell or give away. Buyers and donors connect with you directly by phone to
              arrange pickup or delivery.
            </p>
            {loadingFoundations ? (
              <p>Loading partner foundations…</p>
            ) : (
              <p>
                {foundations.length} verified foundations you can support when you donate.
              </p>
            )}
            <Link to="/add_announcement" className="cta-link">
              Add announcement
            </Link>
          </div>
        </div>
      </div>

      <div className="donation-history full-width">
        <div className="recent-toolbar">
          <h3>Recent announcements &amp; donations</h3>
          <label className="recent-filter-label">
            <span>Show</span>
            <select
              className="recent-filter-select"
              value={recentFilter}
              onChange={(e) => setRecentFilter(e.target.value as "all" | "donations" | "sale")}
            >
              <option value="all">All listings</option>
              <option value="donations">Donations only</option>
              <option value="sale">For sale only</option>
            </select>
          </label>
        </div>

        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Title</th>
              <th>Size / notes</th>
              <th>Image</th>
              <th>Date</th>
              <th>Category</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Pickup</th>
            </tr>
          </thead>

          <tbody>
            {displayedRows.length > 0 ? (
              displayedRows.map((d) => {
                const rowId = d.id as number;
                const title = (d.title as string) ?? "—";
                const mode = (d.listing_mode as string) ?? "—";
                const sizes = Array.isArray(d.sizes) ? (d.sizes as string[]).join(", ") : "—";
                const url = donationThumbUrl(d);
                const created = d.created_at ? new Date(String(d.created_at)).toLocaleDateString() : "—";
                const cat = (d.super_category as { name?: string } | undefined)?.name ?? "—";
                const status = (d.status as string) ?? "—";
                const pickup = (d.pickup_address as string) ?? "—";
                const phone = (d.contact_phone as string) ?? "—";

                return (
                  <tr key={rowId}>
                    <td>{mode === "sell" ? "Sale" : "Donation"}</td>
                    <td>{title}</td>
                    <td>{sizes}</td>
                    <td>
                      {url ? (
                        <img
                          src={url}
                          alt=""
                          style={{
                            width: "50px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setModalImage(url);
                            setModalOpen(true);
                          }}
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{created}</td>
                    <td>{cat}</td>
                    <td>{phone}</td>
                    <td>{status}</td>
                    <td>{pickup}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9}>Nothing to show for this filter yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && modalImage ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={() => setModalOpen(false)}
        >
          <img
            src={modalImage}
            alt="Listing"
            style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 8 }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
