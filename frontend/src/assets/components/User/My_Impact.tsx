import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import route from "../../../utils/route";
import "../../../css/my_impact.css";

// This allows users to view and track their donation impact
export default function My_Impact() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user?.slug) {
      setLoading(false);
      return;
    }
    // fetch donations for this donor
    axios.get(route('users.donations', { user: user.slug }).toString())
      .then((res) => {
        if (res.data.status === "success") {
          setDonations(res.data.products);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Impact fetch error:", err);
        setLoading(false);
      });
  }, [user.slug]);
  // calculate impact metrics
  const totalItems = donations.length;
  const totalCO2 = (totalItems * 1.5).toFixed(1);
  const peopleHelped = totalItems * 1;

  return (
    <main className="dashboard-main">
      <div className="records-container">
        <div className="header-left">
          <h2>My Impact</h2>
        </div>

        <div className="return-right">
          <Link to="/User_Dashboard" className="return-link">
            Return
          </Link>
        </div>
      </div>

      <p className="impact-description">
        Track your contributions and see how your donations help the community
        and environment.
      </p>

      {loading ? (
        <p>Loading your impact...</p>
      ) : (
        <div className="impact-grid">
          {/* Total Items Donated */}
          <div className="impact-card">
            <i className="fa-solid fa-shirt fa-2x"></i>
            <h3>{totalItems}</h3>
            <p>Total items you've donated so far.</p>
          </div>

          {/* CO₂ Saved */}
          <div className="impact-card">
            <i className="fa-solid fa-earth-africa fa-2x"></i>
            <h3>{totalCO2} kg</h3>
            <p>Estimated CO₂ saved by donating instead of discarding.</p>
          </div>

          {/* People Helped */}
          <div className="impact-card">
            <i className="fa-solid fa-heart fa-2x"></i>
            <h3>{peopleHelped}</h3>
            <p>People who benefited from your donations.</p>
          </div>
        </div>
      )}
    </main>
  );
}
