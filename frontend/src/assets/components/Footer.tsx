import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Leaf } from "@solar-icons/react";
import "../../css/footer.css";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
          <Link to="/terms_conditions"> Terms and Conditions </Link>/
          <Link to="/privacy_policy"> Privacy Policy </Link>/
          <Link to="/accessibility"> Accessibility </Link>/
          <Link to="/cookie_policy"> Cookie Policy </Link>/ &copy;{" "}
          {new Date().getFullYear()}LetUsDonateUK <br></br>All rights reserved.
        </p>
        <div className="footer-logo">
          <Leaf size={24} weight="BoldDuotone" />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
