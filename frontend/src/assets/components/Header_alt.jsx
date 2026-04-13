import React from "react";
import "../../css/header.css";

export default function Header_alt({ size = "large" }) {
  // Determine classes based on size
  const headerClass = `header ${size === "small" ? "header-small" : "header-large"}`;

  return (
    <header className={headerClass}>
      <div className="navbar">
        <div className="logo">
          <h1>
            <a>LetUsDonate.uk</a> <i className="fa-solid fa-leaf"></i>
          </h1>
          <div className="header_content">
            <h2>Donating Clothes the Easy Way</h2>
            <h3>
              We connect with donors to make clothing donation <br /> more
              efficient, transparent, and impactful.
            </h3>
          </div>
        </div>
      </div>
    </header>
  );
}
