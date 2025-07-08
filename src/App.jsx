import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useLocation,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import MessagingPage from "./pages/MessagingPage";
import Dashboard from "./pages/Dashboard";
import "./index.css";
import "./App.css";


const Navbar = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  if (isLandingPage) return null;

  return (
    <nav className="bg-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Branding */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/logo.jpeg"
              alt="Unicom Hub Logo"
              className="w-10 h-10 rounded-full"
            />
            <span className="text-white text-xl font-bold">UniCom Hub</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/messaging"
              className="text-gray-100 hover:text-white px-3 py-2 rounded-md"
            >
              Messaging
            </Link>
            <Link
              to="/dashboard"
              className="text-gray-100 hover:text-white px-3 py-2 rounded-md"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};


const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/messaging" element={<MessagingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
