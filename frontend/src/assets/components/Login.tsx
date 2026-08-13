import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import route from "../../utils/route";
import "../../css/sign_up_login.css";

// This is the login component for users to access their accounts
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post(route('login').toString(), { email, password });

      const data = res.data;
      


      if (res.status === 200  && (data.status === "success" || data.success === true)) {

        const token = data?.data?.token || data?.token || null;
        const user = data?.data?.user || data?.user;


        if (token) {
          localStorage.setItem("token", token);
        }
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", String(user.role_id));
        localStorage.setItem("role_name", user.role);
        localStorage.setItem("claims", JSON.stringify(user.claims || []));
        localStorage.setItem("admin", String(user.role === 'admin'));

        // Notify other components (like Header) about login
        window.dispatchEvent(new Event('auth-change'));

        const roleName = (user.role || "donor").toLowerCase();

        if (roleName === "admin") {
          navigate("/");
        } else if (roleName === "charity_staff") {
          navigate("/charity_dashboard");
        } else if (roleName === "donor") {
          navigate("/user_dashboard");
        } else {
          setError("Login failed: Unknown role assigned to account");
        }
      } else {
        // show server error message
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Error connecting to server");
    }
  };

  return (
    <div className="middle">
      <div className="return_home">
        <Link to="/">Return</Link>
      </div>
      <h2>Welcome Back</h2>
      <p>Sign in to your account</p>

      <form onSubmit={handleSubmit}>
        <div className="input-box">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <i className="fa-solid fa-envelope"></i>
        </div>

        <div className="input-box">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <i className="fa-solid fa-lock"></i>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="signup_link">
          <Link to="/sign_up">Don't have an account?</Link>
        </div>

        <div className="sub-btn">
          <button type="submit" className="btn">
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
