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
      <div className="navbar !px-4 !py-4 sm:!px-6 md:!px-10">
        <div className="logo">
          <h1 className="!flex !items-center !gap-2 !text-3xl sm:!text-5xl" style={{ display: 'flex', alignItems: 'center' }}>
            <a>Announcements Marketplace</a> <Leaf size={28} weight="BoldDuotone" style={{ marginLeft: '0' }} />
          </h1>
          <div className="header_content !max-w-4xl">
            <h2 className="!text-xl sm:!text-2xl">Sell or donate — connect by phone</h2>
            <h3 className="!text-sm sm:!text-base">
              Announcements Marketplace helps you list anything you want to sell or give away. Interested people call you
              directly so you can agree pickup, price, or handover in minutes.
            </h3>
          </div>
        </div>
      </div>
    </header>
  );
}