import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../css/records.css";

export default function My_Profile() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Load user
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    const parsed = JSON.parse(stored);
    setUser(parsed);

    fetch(`http://localhost:8000/api/user/${parsed.user_ID}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setFormData({
            name: data.user.name,
            email: data.user.email,
            password: "",
          });
        }
      })
      .catch((err) => console.error("Profile fetch error:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const bodyData = {
      name: formData.name,
      email: formData.email,
    };

    if (formData.password.trim()) {
      bodyData.password = formData.password;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/api/user/${user.user_ID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(bodyData),
        },
      );

      const data = await res.json();

      if (data.status === "success") {
        const updatedUser = {
          ...user,
          user_name: formData.name,
          user_email: formData.email,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        setStatus({
          type: "success",
          message: "Profile updated successfully!",
        });

        setFormData((prev) => ({ ...prev, password: "" }));
      } else {
        setStatus({ type: "error", message: data.message });
      }
    } catch {
      setStatus({ type: "error", message: "Network error." });
    }

    setTimeout(() => setStatus(null), 4000);
  };

  if (!user) return <p>Loading profile...</p>;

  return (
    <main className="dashboard-main">
      <div className="records-container">
        <div className="header-left">
          <h2>My Profile</h2>
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

      {status && (
        <div className={`form-message ${status.type}`}>{status.message}</div>
      )}

      <div className="table-container profile-form-container">
        <form onSubmit={handleSubmit} className="profile-form">
          <label>
            Name:
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </label>

          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </label>

          <label>
            Password:
            <input
              type="password"
              name="password"
              placeholder="Leave blank to keep current password"
              value={formData.password}
              onChange={handleChange}
            />
          </label>

          <button type="submit" className="donation-button">
            Save Changes
          </button>
        </form>
      </div>
    </main>
  );
}
