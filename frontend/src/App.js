import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import TutorDashboard from "./pages/TutorDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import Search from "./pages/Search";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/tutor" element={<TutorDashboard />} />
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/search" element={<Search />} />
          <Route path="*" element={<h1>404 - Not Found</h1>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
