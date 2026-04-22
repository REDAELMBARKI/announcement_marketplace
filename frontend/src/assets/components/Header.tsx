import React from "react";
import { Link } from "react-router-dom";
import "../../css/header.css";

function Header() {
  return (
    <header className="header">
      <div className="top_navbar">
        <div className="brand">
          <Link to="/" className="brand_logo">
            LetUsDonate.uk <i className="fa-solid fa-leaf" aria-hidden="true"></i>
          </Link>
        </div>

        <nav className="main_links" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/our_partners">Our Partners</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/faq_chatbot">FAQ Chatbot</Link>
          <Link to="/sign_up">Join Us</Link>
        </nav>

        <div className="nav_actions">
          <Link to="/login" className="login_btn">
            Log In
          </Link>
          <Link to="/add_announcement" className="post_btn">
            Publish Announcement
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
