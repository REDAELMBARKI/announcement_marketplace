import React from "react";
import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>404 - Page Not Found!</h2>
      <br></br>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link to="/">Go back to Home</Link>
    </div>
  );
}

export default NotFound;
