import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "../../../css/user.css";

export default function User_Dashboard() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [charities, setCharities] = useState([]);
  const [loadingCharities, setLoadingCharities] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const role = localStorage.getItem("role");

    // if (!storedUser || !role) {
    //   navigate("/login");
    //   return;
    // }

    const parsedUser = storedUser
      ? JSON.parse(storedUser)
      : { user_ID: 0, user_name: "Guest", donor: {} };

    // Protect by ID unless admin
    // if (id && parseInt(id) !== parsedUser.user_ID && role !== "99") {
    //   navigate("/login");
    //   return;
    // }

    setUser(parsedUser);
  }, [id, navigate]);

  useEffect(() => {
    if (!user?.donor?.donor_ID) return;

    fetch(`http://localhost:8000/api/donations/user/${user.donor.donor_ID}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setDonations(data.donations);
      })
      .catch((err) => console.error("Donation fetch error:", err));
  }, [user]);

  useEffect(() => {
    fetch("http://localhost:8000/api/charities")
      .then((res) => res.json())
      .then((data) => {
        setCharities(data);
        setLoadingCharities(false);
      })
      .catch(() => setLoadingCharities(false));
  }, []);

  const getCharityName = (id) => {
    const c = charities.find((x) => x.charity_ID === id);
    return c ? c.charity_name : "Unknown";
  };
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  if (!user) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <>
      <div className="user-dashboard-container">
        {/* LEFT SIDEBAR */}
        <div className="dashboard-left">
          <div className="dashboard">
            <aside className="links">
              <ul>
                <li>
                  <i className="fa-solid fa-gauge"></i>
                  <Link to="/my_impact">My Impact</Link>
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
                  <button className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            </aside>

            <main className="dashboard-main">
              <h2>Welcome, {user.user_name}</h2>

              <div className="stats-container">
                <div className="stat-card">
                  <i className="fa-solid fa-earth-africa"></i>
                  <p className="stat-number">
                    {(donations.length * 1.5).toFixed(1)}kg
                  </p>
                  <p className="stat-text">CO₂ Saved</p>
                </div>

                <div className="stat-card">
                  <i className="fa-solid fa-shirt"></i>
                  <p className="stat-number">{donations.length}</p>
                  <p className="stat-text">Total Items Donated</p>
                </div>

                <div className="stat-card">
                  <i className="fa-solid fa-heart"></i>
                  <p className="stat-number">{donations.length}</p>
                  <p className="stat-text">People Helped</p>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* RIGHT — ANNOUNCEMENT ENTRY */}
        <div className="dashboard-right">
          <div className="new-donation">
            <h3>Kids Marketplace</h3>
            <p>
              Add a new kids product announcement to sell or donate clothing,
              shoes, and accessories.
            </p>
            {loadingCharities ? (
              <p>Loading charities...</p>
            ) : (
              <p>
                {charities.length} charities available for donation routing.
              </p>
            )}
            <button type="button" onClick={() => navigate("/add_announcement")}>
              Add Announcement
            </button>
          </div>
        </div>
      </div>

      {/* DONATION HISTORY */}
      <div className="donation-history full-width">
        <h3>Recent Donations</h3>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Size</th>
              <th>Image</th>
              <th>Date Submitted</th>
              <th>Charity</th>
              <th>Status</th>
              <th>Pickup Address</th>
            </tr>
          </thead>

          <tbody>
            {donations.length > 0 ? (
              donations.slice(0, 4).map((d) => {
                const item = d.items?.[0];
                const url = item?.item_image
                  ? `http://localhost:8000/storage/${item.item_image.replace("public/", "")}`
                  : null;

                return (
                  <tr key={d.donation_ID}>
                    <td>{item?.item_name ?? "N/A"}</td>
                    <td>{item?.item_size ?? "N/A"}</td>
                    <td>
                      {url ? (
                        <img
                          src={url}
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
                        "N/A"
                      )}
                    </td>

                    <td>{new Date(d.donation_date).toLocaleDateString()}</td>
                    <td>{getCharityName(d.charity_ID)}</td>
                    <td>{d.donation_status}</td>
                    <td>{d.pickup_address}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7">No donations yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </>
  );
}
