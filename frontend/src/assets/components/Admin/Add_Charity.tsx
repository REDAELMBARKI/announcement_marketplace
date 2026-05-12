import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../../../css/records.css";
import api from "../../../services/api";

// This component allows admin to add a new charity along with its staff account
export function Add_Charity() {
  const [formData, setFormData] = useState({
    charity_name: "",
    charity_address: "",
    charity_email: "",
    contact_person: "",
    staff_username: "",
    staff_email: "",
    staff_password: "",
  });

  const navigate = useNavigate();

  // useEffect(() => {
  //   const admin = localStorage.getItem("admin");

  //   if (!admin) {
  //     navigate("/"); // redirect to home page if ur not admin
  //   }
  // }, [navigate]);

  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    // validating length of password
    if (formData.staff_password.length < 6) {
      setStatus({
        type: "error",
        message: "Password must be at least 6 characters long.",
      });
      return;
    }

    try {
      const response = await api.post("/admin/charities", formData);

      if (response.data.status === "success") {
        setStatus({ type: "success", message: response.data.message });
        setFormData({
          charity_name: "",
          charity_address: "",
          charity_email: "",
          contact_person: "",
          staff_username: "",
          staff_email: "",
          staff_password: "",
        });
      } else {
        setStatus({ type: "error", message: response.data.message });
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Network error. Please try again.";
      setStatus({ type: "error", message: message });
    }
    setTimeout(() => setStatus(null), 4000);
  };

  return (
    <main className="dashboard-main">
      <div className="records-container">
        <div className="header-left">
          <h2>Add Charity</h2>
        </div>

        <div className="return-right">
          <ul>
            <li>
              <Link to="/admin_dashboard">Return</Link>
            </li>
            <li>
              <Link to="/manage_charity">Manage Charities</Link>
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
            Charity Name:
            <input
              type="text"
              name="charity_name"
              value={formData.charity_name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Charity Address:
            <input
              type="text"
              name="charity_address"
              value={formData.charity_address}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Charity Email:
            <input
              type="email"
              name="charity_email"
              value={formData.charity_email}
              onChange={handleChange}
              required
            />
            
          </label>

          <label>
            Contact Person:
            <input
              type="text"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Staff Username:
            <input
              type="text"
              name="staff_username"
              value={formData.staff_username}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Staff Email:
            <input
              type="email"
              name="staff_email"
              value={formData.staff_email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Staff Password:
            <input
              type="password"
              name="staff_password"
              value={formData.staff_password}
              onChange={handleChange}
              placeholder="Password (6+ characters)"
              required
            />
          </label>

          <button type="submit" className="donation-button">
            Add Charity
          </button>
        </form>
      </div>
    </main>
  );
}

export default Add_Charity;
