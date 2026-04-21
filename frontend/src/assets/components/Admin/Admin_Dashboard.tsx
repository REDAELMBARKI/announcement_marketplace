import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Chart } from "chart.js/auto";
import "../../../css/admin.css";
import api from "../../../services/api";

// this is js to get text color based on theme
function getChartTextColor() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "#ffffff"
    : "#000000";
}

export function Admin_Dashboard() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const admin = localStorage.getItem("admin");

    // if (!admin) {
    //   navigate("/"); // redirect to home page if ur not admin
    // }
  }, [navigate]);

  // references to charts which means we can destroy them before recreating in case of data updates so we dont get overlapping charts
  const donationChartRef = useRef(null);
  const userChartRef = useRef(null);
  const sustainabilityChartRef = useRef(null);
  const charityChartRef = useRef(null);

  // destroy previous chart js incase it exists similar to references above
  if (sustainabilityChartRef.current) sustainabilityChartRef.current.destroy();
  if (donationChartRef.current) donationChartRef.current.destroy();
  if (userChartRef.current) userChartRef.current.destroy();
  if (charityChartRef.current) charityChartRef.current.destroy();

  // fetch donations from the API aka backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/admin/donations");
        const payload = response.data;
        const records = payload?.data ?? payload?.donations ?? [];
        setDonations(Array.isArray(records) ? records : []);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          "Unable to load admin dashboard data. Please login again.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // filters donations by time period, returning only those within the specified number of days
  const filterByTime = (days) => {
    const now = new Date();
    return donations.filter((d) => {
      const date = new Date(d.donation_date);
      return (now - date) / (1000 * 60 * 60 * 24) <= days;
    });
  };

  // update charts when donations data changes
  useEffect(() => {
    if (loading || donations.length === 0) return;

    const labels = ["1D", "1W", "1M", "3M", "6M", "Total"];

    const countByStatus = (days, status) => {
      const filtered = days === "Total" ? donations : filterByTime(days);
      return filtered.filter((d) => d.donation_status === status).length;
    };

    const dayMap = {
      "1D": 1,
      "1W": 7,
      "1M": 30,
      "3M": 90,
      "6M": 180,
      Total: "Total",
    };

    // prep datasets which counts donations by status over different time frames
    const approvedCounts = labels.map((l) =>
      countByStatus(dayMap[l], "Approved"),
    );
    const pendingCounts = labels.map((l) =>
      countByStatus(dayMap[l], "Pending"),
    );
    const declinedCounts = labels.map((l) =>
      countByStatus(dayMap[l], "Declined"),
    );

    // Donation trends chart
    const donationCtx = document.getElementById("donationTrends");
    donationChartRef.current = new Chart(donationCtx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Approved",
            data: approvedCounts,
            borderColor: "#22C55E", // green
            backgroundColor: "rgba(34, 197, 94, 0.2)",
            fill: true,
            tension: 0.3,
            pointRadius: 4,
          },
          {
            label: "Pending",
            data: pendingCounts,
            borderColor: "#3B82F6", // blue
            backgroundColor: "rgba(160, 179, 229, 0.15)",
            fill: true,
            tension: 0.3,
            pointRadius: 4,
          },
          {
            label: "Declined",
            data: declinedCounts,
            borderColor: "#8B5CF6", // bluish purple
            backgroundColor: "rgba(139, 92, 246, 0.2)",
            fill: true,
            tension: 0.3,
            pointRadius: 4,
          },
        ],
      },
      options: {
        color: getChartTextColor(), // Adjust text color based on theme
        responsive: true,
        plugins: { legend: { position: "top" }, title: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    });

    // User trends timeframes
    const userCounts = labels.map((label) => {
      let filtered = [];
      switch (label) {
        case "1D":
          filtered = filterByTime(1);
          break;
        case "1W":
          filtered = filterByTime(7);
          break;
        case "1M":
          filtered = filterByTime(30);
          break;
        case "3M":
          filtered = filterByTime(90);
          break;
        case "6M":
          filtered = filterByTime(180);
          break;
        case "Total":
          filtered = donations;
          break;
      }
      const uniqueUsers = new Set(filtered.map((d) => d.donor_ID));
      return uniqueUsers.size;
    });

    // User trends chart
    const userCtx = document.getElementById("userTrends");
    userChartRef.current = new Chart(userCtx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Active Donors",
            data: userCounts,
            borderColor: "#3B62F6", // blue
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            fill: true,
            tension: 0.3,
            pointRadius: 4,
          },
        ],
      },
      options: {
        color: getChartTextColor(),
        responsive: true,
        plugins: { legend: { display: true }, title: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    });

    // Sustainability chart
    const sustainabilityCtx = document.getElementById(
      "sustainabilityImpactChart",
    );

    sustainabilityChartRef.current = new Chart(sustainabilityCtx, {
      type: "bar",
      data: {
        labels: ["Sustainability Impact"],
        datasets: [
          {
            label: "Items Reused",
            data: [totalItemsAccepted],
            backgroundColor: "#8B5CF6", // purple
          },
          {
            label: "CO₂ Reduced (kg)",
            data: [totalCO2Saved],
            backgroundColor: "#22C55E", // green
          },
        ],
      },
      options: {
        color: getChartTextColor(),
        responsive: true,
        plugins: {
          legend: { display: true, position: "top" },
          title: { display: false },
        },
        scales: { y: { beginAtZero: true } },
      },
    });

    //charity
    const charities = {};
    donations.forEach((d) => {
      const name = d.charity?.charity_name || "Unknown";
      charities[name] = (charities[name] || 0) + 1;
    });

    const charityCtx = document.getElementById("charityPerformance");
    charityChartRef.current = new Chart(charityCtx, {
      type: "pie",
      data: {
        labels: Object.keys(charities),
        datasets: [
          {
            data: Object.values(charities),
            backgroundColor: [
              "#60A5FA", // light blue
              "#22D3EE", // cyan
              "#34D399", // green
              "#A78BFA", // purple
              "#FBBF24", // orange
              "#F87171", // red/pink
            ],
          },
        ],
      },
      options: {
        color: getChartTextColor(),
        responsive: true,
        plugins: { legend: { position: "right" } },
      },
    });
  }, [donations, loading]);

  // stats

  const totalDonations = donations.length;
  const totalItemsAccepted = donations
    .filter((d) => d.donation_status === "Approved")
    .reduce((sum, d) => sum + (d.items?.length || 0), 0);
  const totalCO2Saved = (totalItemsAccepted * 1.5).toFixed(1);
  const activeCharities = new Set(donations.map((d) => d.charity?.charity_name))
    .size;

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
            <Link to="/admin_donations">Donations</Link>
          </li>
          <li>
            <i className="fa-solid fa-chart-line"></i>
            <Link to="/data_reports">Data Reports</Link>
          </li>
          <li>
            <i className="fa-solid fa-users"></i>
            <Link to="/add_charity">Add Charity</Link>
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
            <h4>Total Items Donated</h4>
            <p>{totalDonations}</p>
          </div>
          <div>
            <h4>Total Items Accepted</h4>
            <p>{totalItemsAccepted}</p>
          </div>
          <div>
            <h4>Total CO₂ Saved</h4>
            <p>{totalCO2Saved} kg</p>
          </div>
          <div>
            <h4>Active Charities</h4>
            <p>{activeCharities}</p>
          </div>
        </div>
      </div>

      <div className="data-reports">
        {loading ? (
          <p>Loading data...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <>
            <div className="chart-card">
              <h3>Donation Trends</h3>
              <canvas id="donationTrends"></canvas>
            </div>
            <div className="chart-card">
              <h3>Monthly User Trends</h3>
              <canvas id="userTrends"></canvas>
            </div>
            <div className="chart-card">
              <h3>Sustainability Impact</h3>
              <canvas id="sustainabilityImpactChart"></canvas>
            </div>
            <div className="chart-card">
              <h3>Charity Performance Comparison</h3>
              <canvas id="charityPerformance"></canvas>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Admin_Dashboard;
