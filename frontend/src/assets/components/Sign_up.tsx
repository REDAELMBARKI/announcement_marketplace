import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import route from "../../utils/route";
import "../../css/sign_up_login.css";

function DonorSignUp() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Password validation- not chnaged
    if (formData.password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(route('signup').toString(), {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      const data = res.data;

      if (data.status === "success") {
        setMessage("Signup successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1000);
      }
    } catch (err: any) {
      const data = err.response?.data;
      setMessage(data?.message || data?.errors?.email?.[0] || "Signup failed");
    }
  };

  return (
    <div className="middle">
      <div className="return_home">
        <Link to="/">Return</Link>
      </div>

      <h2>Create Account</h2>
      <p>Quickly Create An Account</p>

      <form onSubmit={handleSubmit}>
        <div className="input-box">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <i className="fa-solid fa-user"></i>
        </div>

        <div className="input-box">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <i className="fa-solid fa-envelope"></i>
        </div>

        <div className="input-box">
          <input
            type="password"
            name="password"
            placeholder="Password (6+ characters)"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <i className="fa-solid fa-key"></i>
        </div>

        <div className="input-box">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <i className="fa-solid fa-lock"></i>
        </div>

        {message && <p>{message}</p>}

        <div className="signup_link">
          <Link className="print" to="/login">
            Already have an account?
          </Link>
        </div>

        <div className="sub-btn">
          <button type="submit" className="btn">
            Register
          </button>
        </div>
      </form>
    </div>
  );
}

export default DonorSignUp;
