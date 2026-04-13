import { BrowserRouter as Router } from "react-router-dom";
import Layout from "./Layout.jsx";
// Main application component that sets up routing and layout
export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
