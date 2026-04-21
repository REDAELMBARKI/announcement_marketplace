import { Routes, Route, useLocation } from "react-router-dom";
import React, { useEffect, Suspense, lazy } from "react";

// Headers & Footer
import Header from "./assets/components/Header.jsx";
import Header_alt from "./assets/components/Header_alt.jsx";
import Footer from "./assets/components/Footer.jsx";

// lazy-load all page components
const Home = lazy(() => import("./assets/components/Home.jsx"));
const Sign_up = lazy(() => import("./assets/components/Sign_up.jsx"));
const Login = lazy(() => import("./assets/components/Login.jsx"));
const FAQ = lazy(() => import("./assets/components/FAQ.jsx"));
const Our_Partners = lazy(() => import("./assets/components/Our_Partners.jsx"));
const FAQChatBot = lazy(() => import("./assets/components/FAQChatBot.jsx"));
const Marketplace = lazy(() => import("./assets/components/Marketplace.jsx"));
const Product_Details = lazy(() => import("./assets/components/Product_Details.jsx"));

// Admin
const Admin_Dashboard = lazy(
  () => import("./assets/components/Admin/Admin_Dashboard.jsx"),
);
const Add_Charity = lazy(
  () => import("./assets/components/Admin/Add_Charity.jsx"),
);
const Data_Reports = lazy(
  () => import("./assets/components/Admin/Data_Reports.jsx"),
);
const View_Users = lazy(
  () => import("./assets/components/Admin/View_Users.jsx"),
);
const Admin_Inventory = lazy(
  () => import("./assets/components/Admin/Admin_Inventory.jsx"),
);
const Admin_Donations = lazy(
  () => import("./assets/components/Admin/Admin_Donations.jsx"),
);
const Manage_Charity = lazy(
  () => import("./assets/components/Admin/Manage_Charity.jsx"),
);

// Charity
const Charity_Dashboard = lazy(
  () => import("./assets/components/Charity/Charity_Dashboard.jsx"),
);
const Approve_Donations = lazy(
  () => import("./assets/components/Charity/Approve_Donations.jsx"),
);
const Distribution_Records = lazy(
  () => import("./assets/components/Charity/Distribution_Records.jsx"),
);
const View_Donations = lazy(
  () => import("./assets/components/Charity/View_Donations.jsx"),
);
const View_Inventory = lazy(
  () => import("./assets/components/Charity/View_Inventory.jsx"),
);

// User
const User_Dashboard = lazy(
  () => import("./assets/components/User/User_Dashboard.jsx"),
);
const My_Donations = lazy(
  () => import("./assets/components/User/My_Donations.jsx"),
);
const My_Impact = lazy(() => import("./assets/components/User/My_Impact.jsx"));
const My_Profile = lazy(
  () => import("./assets/components/User/My_Profile.jsx"),
);
const My_Announcements = lazy(
  () => import("./assets/components/User/My_Announcements.jsx"),
);
const Add_Announcement = lazy(
  () => import("./assets/components/User/Add_Announcement.jsx"),
);

// Footer content pages
const Terms_Conditions = lazy(
  () => import("./assets/components/Footer_Content/Terms_Conditions.jsx"),
);
const Privacy_Policy = lazy(
  () => import("./assets/components/Footer_Content/Privacy_Policy.jsx"),
);
const Cookie_Policy = lazy(
  () => import("./assets/components/Footer_Content/Cookie_Policy.jsx"),
);
const Accessibility = lazy(
  () => import("./assets/components/Footer_Content/Accessibility.jsx"),
);

// Not found page
const NotFound = lazy(() => import("./404.jsx"));

export default function Layout() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();
  console.log("Current path:", location); // this giving me / even if m in a path liek this /add_chari
  // Paths without a header/footer
  const noHeaderFooterPaths = ["/login", "/sign_up"];

  // Paths that use the alternative header
  const altHeaderPaths = [
    "/user_dashboard",
    "/my_donations",
    "/my_impact",
    "/charity_dashboard",
    "/view_inventory",
    "/view_donations",
    "/distribution_records",
    "/approve_donations",
    "/admin_dashboard",
    "/view_users",
    "/data_reports",
    "/my_profile",
    "/add_announcement",
    "/add_charity",
    "/admin_inventory",
    "/admin_donations",
    "/manage_charity",
    "/my_announcements",
  ];

  const hideHeaderFooter = noHeaderFooterPaths.includes(path);
  const useAltHeader = altHeaderPaths.includes(path);

  useEffect(() => {
    console.log("Current path:", path);
  }, [path]);

  return (
    <>
      {/* Header */}
      {!hideHeaderFooter &&
        (useAltHeader ? <Header_alt size="small" /> : <Header />)}

      {/* Suspense wrapper for lazy-loaded routes */}
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Main pages */}
          <Route path="/" element={<Home />} />
          <Route path="/sign_up" element={<Sign_up />} />
          <Route path="/login" element={<Login />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/faq_chatbot" element={<FAQChatBot />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:id" element={<Product_Details />} />
          <Route path="/our_partners" element={<Our_Partners />} />

          {/* Admin */}
          <Route path="/admin_dashboard" element={<Admin_Dashboard />} />
          <Route path="/add_charity" element={<Add_Charity />} />
          <Route path="/data_reports" element={<Data_Reports />} />
          <Route path="/view_users" element={<View_Users />} />
          <Route path="/admin_inventory" element={<Admin_Inventory />} />
          <Route path="/admin_donations" element={<Admin_Donations />} />
          <Route path="/manage_charity" element={<Manage_Charity />} />

          {/* Charity */}
          <Route path="/charity_dashboard" element={<Charity_Dashboard />} />
          <Route path="/view_inventory" element={<View_Inventory />} />
          <Route path="/view_donations" element={<View_Donations />} />
          <Route
            path="/distribution_records"
            element={<Distribution_Records />}
          />
          <Route path="/approve_donations" element={<Approve_Donations />} />

          {/* User */}
          <Route path="/user_dashboard" element={<User_Dashboard />} />
          <Route path="/my_donations" element={<My_Donations />} />
          <Route path="/my_impact" element={<My_Impact />} />
          <Route path="/my_profile" element={<My_Profile />} />
          <Route path="/my_announcements" element={<My_Announcements />} />
          <Route path="/add_announcement" element={<Add_Announcement />} />

          {/* Footer items */}
          <Route path="/terms_conditions" element={<Terms_Conditions />} />
          <Route path="/privacy_policy" element={<Privacy_Policy />} />
          <Route path="/cookie_policy" element={<Cookie_Policy />} />
          <Route path="/accessibility" element={<Accessibility />} />

          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {/* Footer */}
      {!hideHeaderFooter && <Footer />}
    </>
  );
}
