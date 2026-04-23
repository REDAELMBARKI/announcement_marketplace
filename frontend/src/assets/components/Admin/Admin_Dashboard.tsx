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
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalItemsAccepted: 0,
    totalCO2Saved: 0,
    activeCharities: 0,
    donationDates: [],
    userDates: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    // if (!admin) {
    //   navigate("/"); // redirect to home page if ur not admin
    // }
  }, [navigate]);

  // references to charts
  const donationChartRef = useRef(null);
  const userChartRef = useRef(null);
  const sustainabilityChartRef = useRef(null);
  const charityChartRef = useRef(null);

  // fetch dashboard data from the API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/admin/stats");
        const data = response.data.data;
        
        setStats({
          totalDonations: data.totalDonations || 0,
          totalItemsAccepted: data.activeProducts || 0, // Using activeProducts as total items accepted for now
          totalCO2Saved: data.totalCO2Saved || 0,
          activeCharities: data.activeCharities || 0,
          donationDates: data.donationDates || [],
          userDates: data.userDates || []
        });
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

  // update charts when stats data changes
  useEffect(() => {
    if (loading) return;

    // Destroy existing charts
    if (donationChartRef.current) donationChartRef.current.destroy();
    if (userChartRef.current) userChartRef.current.destroy();
    if (sustainabilityChartRef.current) sustainabilityChartRef.current.destroy();
    if (charityChartRef.current) charityChartRef.current.destroy();

    const labels = stats.donationDates && stats.donationDates.length > 0 ? stats.donationDates : ["1D", "1W", "1M", "3M", "6M", "Total"];
    
    // Group donation dates for the chart
    const donationData = labels.map((label, index) => {
        if (stats.donationDates && stats.donationDates.length > 0) return index + 1; // dummy progression
        return stats.totalDonations / labels.length; 
    });

    // Donation trends chart
    const donationCtx = document.getElementById("donationTrends");
    donationChartRef.current = new Chart(donationCtx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Donations",
            data: donationData,
            borderColor: "#22C55E",
            backgroundColor: "rgba(34, 197, 94, 0.2)",
            fill: true,
            tension: 0.3,
            pointRadius: 4,
          }
        ],
      },
      options: {
        color: getChartTextColor(),
        responsive: true,
        plugins: { legend: { position: "top" }, title: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    });

    // Sustainability chart
    const sustainabilityCtx = document.getElementById("sustainabilityImpactChart");
    sustainabilityChartRef.current = new Chart(sustainabilityCtx, {
      type: "doughnut",
      data: {
        labels: ["CO2 Saved (kg)", "Remaining Goal"],
        datasets: [
          {
            data: [stats.totalCO2Saved, Math.max(0, 1000 - stats.totalCO2Saved)],
            backgroundColor: ["#22C55E", "#E5E7EB"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: getChartTextColor() },
          },
        },
      },
    });

    // User stats chart
    const userCtx = document.getElementById("userTrends");
    const userLabels = stats.userDates && stats.userDates.length > 0 ? stats.userDates : ["1D", "1W", "1M", "3M", "6M", "Total"];
    const userData = userLabels.map((label, index) => {
        if (stats.userDates && stats.userDates.length > 0) return index + 1;
        return stats.totalUsers / userLabels.length;
    });

    userChartRef.current = new Chart(userCtx, {
      type: "line",
      data: {
        labels: userLabels,
        datasets: [
          {
            label: "Users",
            data: userData,
            borderColor: "#3B82F6",
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
        plugins: {
          legend: { position: "top" },
          title: { display: false }
        },
        scales: { y: { beginAtZero: true } },
      },
    });

    // Charity stats chart
    const charityCtx = document.getElementById("charityPerformance");
    charityChartRef.current = new Chart(charityCtx, {
      type: "pie",
      data: {
        labels: ["Active Charities", "Inactive"],
        datasets: [
          {
            data: [stats.activeCharities, Math.max(0, 50 - stats.activeCharities)],
            backgroundColor: ["#F59E0B", "#E5E7EB"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: getChartTextColor() },
          },
        },
      },
    });
  }, [stats, loading]);

  const { totalDonations, totalItemsAccepted, totalCO2Saved, activeCharities } = stats;

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
