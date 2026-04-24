import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../../../css/records.css";
import "../../../css/modal.css";
import api from "../../../services/api";

export function Admin_Donations() {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  // Build image URL correctly
  const buildImageUrl = (path) => {
    if (!path) return null;
    path = path.replace(/^public\//, "").replace(/^\/+/, "");
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  const navigate = useNavigate();

  useEffect(() => {
    const admin = localStorage.getItem("admin");

    // if (!admin) {
    //   navigate("/"); // redirect to home page if ur not admin
    // }
  }, [navigate]);

  // Fetch all donations
  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      try {
        const response = await api.get("/admin/donations");
        if (response.data.status === "success") {
          setDonations(response.data.donations);
          setFilteredDonations(response.data.donations);
        }
      } catch (err) {
        console.error("Error fetching donations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  // Filter donations based on search, listing mode and status
  useEffect(() => {
    const filtered = donations.filter((d) => {
      const item = d.items?.[0] ?? {};
      const donorId = String(d?.donor?.user_ID || "");
      const itemName = (item?.item_name || "").toLowerCase();
      const itemCategory = (item?.item_category || "").toLowerCase();

      const searchMatch =
        !search ||
        donorId.includes(search) ||
        itemName.includes(search.toLowerCase()) ||
        itemCategory.includes(search.toLowerCase());

      const modeMatch = modeFilter
        ? (d.listing_mode || "").toLowerCase() === modeFilter.toLowerCase()
        : true;

      const statusMatch = statusFilter
        ? (d.donation_status || "").toLowerCase() === statusFilter.toLowerCase()
        : true;

      return searchMatch && modeMatch && statusMatch;
    });

    setFilteredDonations(filtered);
  }, [search, modeFilter, statusFilter, donations]);

  const handleReset = () => {
    setSearch("");
    setModeFilter("");
    setStatusFilter("");
    setFilteredDonations(donations);
  };

  const openModal = (imgUrl) => {
    setModalImage(imgUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalImage(null);
  };

  return (
    <main>
      <div className="records-container">
        <div className="header-left">
          <h2>Announcements</h2>
        </div>
        <div className="return-right">
          <li>
            <Link to="/admin_dashboard">Return</Link>
          </li>
        </div>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by item, category, or donor ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          className="status-filter"
        >
          <option value="">Donate / Sell</option>
          <option value="donate">Donate</option>
          <option value="sell">Sell</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Declined">Declined</option>
        </select>

        <button className="filter-button" onClick={handleReset}>
          Reset
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Announcement ID</th>
              <th>Donor ID</th>
              <th>Item</th>
              <th>Category</th>
              <th>Image</th>
              <th>Date Posted</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8">Loading...</td>
              </tr>
            ) : filteredDonations.length > 0 ? (
              filteredDonations.map((d) => {
                const item = d.items?.[0] ?? {};
                const donorId = d?.donor?.user_ID || "Unknown";
                const imgUrl = buildImageUrl(item?.item_image);

                return (
                  <tr key={d.donation_ID}>
                    <td>{d.donation_ID}</td>
                    <td>{donorId}</td>
                    <td>{item?.item_name ?? "N/A"}</td>
                    <td>{item?.item_category ?? "N/A"}</td>
                    <td>
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item.item_name}
                          style={{
                            width: "50px",
                            height: "auto",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                          onClick={() => openModal(imgUrl)}
                        />
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      {d.donation_date
                        ? new Date(d.donation_date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>{d.donation_status}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8">No donations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Image Modal */}
      {modalOpen && modalImage && (
        <div className="image-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={modalImage} alt="Full Preview" className="full-image" />
            <button className="close-modal-btn" onClick={closeModal}>
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Admin_Donations;
