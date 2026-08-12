import { Routes, Route, useLocation } from "react-router-dom";
import React, { useEffect, Suspense, lazy } from "react";
import axios from "axios";

// Headers & Footer
import Header from "./assets/components/Header.tsx";
import Header_alt from "./assets/components/Header_alt.tsx";
import Footer from "./assets/components/Footer.tsx";
import RoleCheck from "./assets/components/Common/RoleCheck";

// lazy-load all page components
const Home = lazy(() => import("./assets/components/Home"));
const Sign_up = lazy(() => import("./assets/components/Sign_up"));
const Login = lazy(() => import("./assets/components/Login"));
const FAQ = lazy(() => import("./assets/components/FAQ"));
const Our_Partners = lazy(() => import("./assets/components/Our_Partners"));
const FAQChatBot = lazy(() => import("./assets/components/FAQChatBot"));
const Marketplace = lazy(() => import("./assets/components/Marketplace"));
const Product_Details = lazy(() => import("./assets/components/Product_Details"));
const ConversationsList = lazy(() => import("./assets/components/ConversationsList"));
const ChatPage = lazy(() => import("./assets/components/ChatPage"));

// Admin
const Admin_Dashboard = lazy(
  () => import("./assets/components/Admin/Admin_Dashboard"),
);
const Add_Charity = lazy(
  () => import("./assets/components/Admin/Add_Charity"),
);
const Data_Reports = lazy(
  () => import("./assets/components/Admin/Data_Reports"),
);
const View_Users = lazy(
  () => import("./assets/components/Admin/View_Users"),
);
const Admin_Inventory = lazy(
  () => import("./assets/components/Admin/Admin_Inventory"),
);
const Admin_Donations = lazy(
  () => import("./assets/components/Admin/Admin_Donations"),
);
const Manage_Charity = lazy(
  () => import("./assets/components/Admin/Manage_Charity"),
);

// Charity
const Charity_Dashboard = lazy(
  () => import("./assets/components/Charity/Charity_Dashboard"),
);
const Approve_Donations = lazy(
  () => import("./assets/components/Charity/Approve_Donations"),
);
const Distribution_Records = lazy(
  () => import("./assets/components/Charity/Distribution_Records"),
);
const View_Donations = lazy(
  () => import("./assets/components/Charity/View_Donations"),
);
const View_Inventory = lazy(
  () => import("./assets/components/Charity/View_Inventory"),
);

// User
const User_Dashboard = lazy(
  () => import("./assets/components/User/User_Dashboard"),
);
const My_Donations = lazy(
  () => import("./assets/components/User/My_Donations"),
);
const My_Impact = lazy(() => import("./assets/components/User/My_Impact"));
const My_Profile = lazy(
  () => import("./assets/components/User/My_Profile"),
);
const My_Announcements = lazy(
  () => import("./assets/components/User/My_Announcements"),
);
const Add_Announcement = lazy(
  () => import("./assets/components/User/Add_Announcement"),
);

// Footer content pages
const Terms_Conditions = lazy(
  () => import("./assets/components/Footer_Content/Terms_Conditions"),
);
const Privacy_Policy = lazy(
  () => import("./assets/components/Footer_Content/Privacy_Policy"),
);
const Cookie_Policy = lazy(
  () => import("./assets/components/Footer_Content/Cookie_Policy"),
);
const Accessibility = lazy(
  () => import("./assets/components/Footer_Content/Accessibility"),
);


// Not found page
const NotFound = lazy(() => import("./404.jsx"));

export default function Layout() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  // Configure axios with token
  useEffect(() => {
    const updateAxiosToken = () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        delete axios.defaults.headers.common['Authorization'];
      }
    };

    updateAxiosToken();
    window.addEventListener('auth-change', updateAxiosToken);

    const authInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // If token is expired or invalid, log out user
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
          window.dispatchEvent(new Event('auth-change'));
        }
        return Promise.reject(error);
      }
    );

    return () => {
       axios.interceptors.response.eject(authInterceptor);
       window.removeEventListener('auth-change', updateAxiosToken);
     };
   }, []);

  console.log("Current path:", location);
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

  const isHomePage = path === "/" || path === "";

  return (
    <>
      {/* Header */}
      {!hideHeaderFooter &&
        (useAltHeader ? <Header_alt size="small" /> : <Header transparentOnHero={isHomePage} />)}

      {/* Suspense wrapper for lazy-loaded routes */}
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Main pages */}
          <Route path="/" element={<Home />} />
          <Route path="/sign_up" element={<Sign_up />} />
          <Route path="/login" element={<Login />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/faq_chatbot" element={<FAQChatBot />} />
          <Route path="/announcements" element={<Marketplace />} />
          <Route path="/announcements/:announcementSlug" element={<Product_Details />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:conversationSlug" element={<ChatPage />} />
          <Route path="/our_partners" element={<Our_Partners />} />

          {/* Admin */}
          <Route path="/admin_dashboard" element={<RoleCheck allowedRoles={['admin']}><Admin_Dashboard /></RoleCheck>} />
          <Route path="/add_charity" element={<RoleCheck allowedRoles={['admin']}><Add_Charity /></RoleCheck>} />
          <Route path="/data_reports" element={<RoleCheck allowedRoles={['admin']}><Data_Reports /></RoleCheck>} />
          <Route path="/view_users" element={<RoleCheck allowedRoles={['admin']}><View_Users /></RoleCheck>} />
          <Route path="/admin_inventory" element={<RoleCheck allowedRoles={['admin']}><Admin_Inventory /></RoleCheck>} />
          <Route path="/admin_donations" element={<RoleCheck allowedRoles={['admin']}><Admin_Donations /></RoleCheck>} />
          <Route path="/manage_charity" element={<RoleCheck allowedRoles={['admin']}><Manage_Charity /></RoleCheck>} />

          {/* Charity */}
          <Route path="/charity_dashboard" element={<RoleCheck allowedRoles={['admin', 'charity_staff']}><Charity_Dashboard /></RoleCheck>} />
          <Route path="/view_inventory" element={<RoleCheck allowedRoles={['admin', 'charity_staff']}><View_Inventory /></RoleCheck>} />
          <Route path="/view_donations" element={<RoleCheck allowedRoles={['admin', 'charity_staff']}><View_Donations /></RoleCheck>} />
          <Route
            path="/distribution_records"
            element={<RoleCheck allowedRoles={['admin', 'charity_staff']}><Distribution_Records /></RoleCheck>}
          />
          <Route path="/approve_donations" element={<RoleCheck allowedRoles={['admin', 'charity_staff']}><Approve_Donations /></RoleCheck>} />

          {/* User */}
          <Route path="/user_dashboard" element={<RoleCheck allowedRoles={['admin', 'donor']}><User_Dashboard /></RoleCheck>} />
          <Route path="/my_donations" element={<RoleCheck allowedRoles={['admin', 'donor']}><My_Donations /></RoleCheck>} />
          <Route path="/my_impact" element={<RoleCheck allowedRoles={['admin', 'donor']}><My_Impact /></RoleCheck>} />
          <Route path="/my_profile" element={<RoleCheck allowedRoles={['admin', 'donor', 'charity_staff']}><My_Profile /></RoleCheck>} />
          <Route path="/my_announcements" element={<RoleCheck allowedRoles={['admin', 'donor']}><My_Announcements /></RoleCheck>} />
          <Route path="/add_announcement" element={<RoleCheck allowedRoles={['admin', 'donor']}><Add_Announcement /></RoleCheck>} />
          <Route path="/users/:userSlug/announcements/:announcementSlug" element={<Add_Announcement />} />

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
