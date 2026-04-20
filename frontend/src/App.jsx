import { BrowserRouter as Router } from "react-router-dom";

// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Marketplace from "./pages/Marketplace";
// import ProductDetails from "./pages/ProductDetails";
// import MyProducts from "./pages/MyProducts";
// import EditProduct from "./pages/EditProduct";


import Layout from "./Layout.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
// Main application component that sets up routing and layout
export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout />
      </Router>
    </ThemeProvider>
  );
}



