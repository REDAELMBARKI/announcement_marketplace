import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
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
      const res = await axios.post(route('login').toString(), { email, password });

      const data = res.data;
      console.log("Login response:", res.status, data);
      


      if (res.status === 200  && (data.status === "success" || data.success === true)) {

        const token = data?.data?.token || data?.token || null;
        const user = data?.data?.user || data?.user;


        // For Debug- log user object to verify charity_ID
        console.log("Logged in user object:", user);

        if (token) {
          localStorage.setItem("token", token);
        }
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", String(user.role_id));
        localStorage.setItem("admin", String(user.role_id === 12));

        const role = String(user.role_id);

        if (role === "12") {
          navigate("/admin_dashboard");
        } else if (role === "11") {
          if (!user.charity_ID) {
            console.warn(
              "No charity_ID found for this user. Charity dashboard will not load.",
            );
            setError(
              "Login failed: Your account does not have an associated charity.",
            );
            return;
          }
          navigate("/charity_dashboard");
        } else if (role === "10") {
          navigate("/user_dashboard");
        } else {
          console.log("Unknown role_id:", role);
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
