import React, { useEffect, useState } from "react";
import { Leaf } from "@solar-icons/react";
import "../../css/header.css";

export default function Header_alt({ size = "large" }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
  const handleScroll = () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    setScrolled(scrollY > 10);
  };

  window.addEventListener('scroll', handleScroll);
  document.addEventListener('scroll', handleScroll);

  return () => {
    window.removeEventListener('scroll', handleScroll);
    document.removeEventListener('scroll', handleScroll);
  };
}, []);

  const headerClass = `header ${size === "small" ? "header-small" : "header-large"} ${scrolled ? "scrolled" : ""}`;

  return (
    <header className={headerClass}>
      <div className="navbar">
        <div className="logo">
          <h1 style={{ display: 'flex', alignItems: 'center' }}>
            <a>LetUsDonate.uk</a> <Leaf size={28} weight="BoldDuotone" style={{ marginLeft: '8px' }} />
          </h1>
          <div className="header_content">
            <h2>Sell or donate — connect by phone</h2>
            <h3>
              LetUsDonateUK helps you list anything you want to sell or give away. Interested people call you
              directly so you can agree pickup, price, or handover in minutes.
            </h3>
          </div>
        </div>
      </div>
    </header>
  );
}