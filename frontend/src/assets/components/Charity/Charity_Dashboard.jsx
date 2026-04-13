import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Chart } from "chart.js/auto";
import "../../../css/charity.css";

function getChartTextColor() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "#ffffff"
    : "#000000";
}

export function Charity_Dashboard() {
  const [donations, setDonations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({ items: 0, co2: 0, people: 0 });
  const [loading, setLoading] = useState(true);
  const [charity, setCharity] = useState({ charity_name: "Unknown Charity" });

  const chartRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = localStorage.getItem("role");

  // Redirect if not charity staff
  useEffect(() => {
    // if (!user.user_ID || role !== "11") {
    //   window.location.href = "/login";
    // }
  }, [user.user_ID, role]);

  // Fetch all charities and find assigned one
  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/charities");
        const data = await res.json();
        const allCharities = data.charities || data || [];
        const assigned = allCharities.find(
          (c) => c.charity_ID === user.charity_ID,
        );
        if (assigned) setCharity(assigned);
      } catch (err) {
        console.error("Failed to fetch charities:", err);
      }
    };
    if (user.charity_ID) fetchCharities();
  }, [user.charity_ID]);

  // Fetch donations and inventory
  useEffect(() => {
    if (!user.charity_ID) return;

    const fetchData = async () => {
      try {
        const donationRes = await fetch(
          `http://127.0.0.1:8000/api/charity/${user.charity_ID}/donations`,
        );
        const donationJson = await donationRes.json();
        const donationList =
          donationJson.status === "success" ? donationJson.donations || [] : [];

        const inventoryRes = await fetch(
          `http://127.0.0.1:8000/api/inventory?charity_ID=${user.charity_ID}`,
        );
        const inventoryJson = await inventoryRes.json();
        const inventoryList = inventoryJson.inventory || [];

        setDonations(donationList);
        setInventory(inventoryList);

        // Calculate stats
        const totalItems = donationList.reduce((sum, d) => {
          if (!d.items) return sum;
          return (
            sum +
            d.items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0)
          );
        }, 0);

        setStats({
          items: totalItems,
          co2: (totalItems * 1.5).toFixed(1),
          people: totalItems,
        });

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch charity data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [user.charity_ID]);

  // Inventory chart
  useEffect(() => {
    if (!inventory.length) return;

    const categoryMap = {};
    inventory.forEach((item) => {
      const category = item.category || "Unknown";
      const qty = Number(item.quantity) || 0;
      categoryMap[category] = (categoryMap[category] || 0) + qty;
    });

    const labels = Object.keys(categoryMap);
    const quantities = Object.values(categoryMap);

    if (chartRef.current) chartRef.current.destroy();

    const ctx = document.getElementById("myChart");
    chartRef.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data: quantities,
            backgroundColor: [
              "#5b7d62",
              "#76a79b",
              "#9fc3ab",
              "#2d484c",
              "#7e8568",
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
  }, [inventory]);

  return (
    <div className="charity-dashboard-container">
      <div className="dashboard">
        <aside className="links">
          <ul>
            <li>
              <i className="fa-solid fa-shirt"></i>
              <Link to="/View_Inventory">Inventory</Link>
            </li>
            <li>
              <i className="fa-solid fa-warehouse"></i>
              <Link to="/view_donations">Donations</Link>
            </li>
            <li>
              <i className="fa-solid fa-hand-holding-heart"></i>
              <Link to="/approve_donations">Approve Donations</Link>
            </li>
            <li>
              <i className="fa-solid fa-truck"></i>
              <Link to="/distribution_records">Distribution Records</Link>
            </li>
            <li>
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
              <button
                type="button"
                className="logout-btn"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/login";
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </aside>

        <main className="dashboard-main">
          <h2>Welcome, {user.user_name} Staff!</h2>
          <p className="charity-info">
            Assigned Charity: <strong>{charity.charity_name}</strong>
          </p>

          {loading ? (
            <p>Loading dashboard...</p>
          ) : (
            <>
              <div className="stats-container">
                <div className="stat-card">
                  <i className="fa-solid fa-leaf"></i>
                  <p className="stat-number">{stats.co2} kg</p>
                  <p className="stat-text">CO₂ Saved</p>
                </div>

                <div className="stat-card">
                  <i className="fa-solid fa-shirt"></i>
                  <p className="stat-number">{stats.items}</p>
                  <p className="stat-text">Items Donated</p>
                </div>

                <div className="stat-card">
                  <i className="fa-solid fa-people-group"></i>
                  <p className="stat-number">{stats.people}</p>
                  <p className="stat-text">People Helped</p>
                </div>
              </div>

              <div className="inventory-chart">
                <h3>Inventory Overview</h3>
                <canvas
                  id="myChart"
                  style={{ width: "100%", maxWidth: "700px" }}
                ></canvas>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Charity_Dashboard;
