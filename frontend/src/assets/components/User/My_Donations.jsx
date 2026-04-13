import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../css/records.css";

// This allows users to view and filter their donation history
export default function My_Donations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user?.donor?.donor_ID) return;

    fetch(`http://localhost:8000/api/donations/user/${user.donor.donor_ID}`) // fetch donations for this donor
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setDonations(data.donations);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Donation fetch error:", err);
        setLoading(false);
      });
  }, [user]);

  //filtering donations
  const filtered = donations.filter((d) => {
    const item = d.items?.[0];

    const matchesSearch =
      item?.item_name?.toLowerCase().includes(search.toLowerCase()) ||
      item?.item_category?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter
      ? d.donation_status?.toLowerCase() === statusFilter.toLowerCase()
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
              <Link to="/User_Dashboard" className="return-link">
                Return
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by item or category..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Item Name</th>
              <th>Description</th>
              <th>Condition</th>
              <th>Image</th>
              <th>Date Donated</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Loading donations...</td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((d) => {
                const item = d.items?.[0];
                return (
                  <tr key={d.donation_ID}>
                    <td>{item?.item_category ?? "N/A"}</td>
                    <td>{item?.item_name ?? "N/A"}</td>
                    <td>{item?.item_description ?? "N/A"}</td>
                    <td>{item?.item_condition ?? "N/A"}</td>

                    <td>
                      {item?.item_image
                        ? (() => {
                            let path = item.item_image;

                            path = path.replace(/^public\//, "");

                            path = path.replace(/^\/+/, "");

                            const imageUrl = path.startsWith("http")
                              ? path
                              : `http://localhost:8000/storage/${path}`;

                            return (
                              <a
                                href={imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={imageUrl}
                                  alt={item.item_name}
                                  style={{
                                    width: "50px",
                                    height: "auto",
                                    borderRadius: "4px",
                                  }}
                                />
                              </a>
                            );
                          })()
                        : "N/A"}
                    </td>

                    <td>{new Date(d.donation_date).toLocaleDateString()}</td>
                    <td>{d.donation_status}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7">No donations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
