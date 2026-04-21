import { BrowserRouter as Router } from "react-router-dom";
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
