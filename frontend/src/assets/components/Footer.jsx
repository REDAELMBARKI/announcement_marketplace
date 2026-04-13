import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../css/footer.css";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
          <Link to="/terms_conditions"> Terms and Conditions </Link>/
          <Link to="/privacy_policy"> Privacy Policy </Link>/
          <Link to="accessibility"> Accessibility </Link>/
          <Link to="/cookie_policy"> Cookie Policy </Link>/ &copy;{" "}
          {new Date().getFullYear()}LetUsDonateUK <br></br>All rights reserved.
        </p>
        <div className="footer-logo">
          <i className="fa-solid fa-leaf"></i>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
