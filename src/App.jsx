import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import Listings from "./pages/Listings";
import ListingDetails from "./pages/ListingDetails";
import Auctions from "./pages/Auctions";
import LiveControl from "./pages/LiveControl";
import AuctionDetails from "./pages/AuctionDetails";
import Banners from "./pages/Banners";
import AddTruck from "./pages/AddTruck";
import AddModel from "./pages/AddModel";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";
import FinancialTransactions from "./pages/FinancialTransactions";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div dir="rtl" className="min-h-screen flex bg-yellow-100 text-dark">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingDetails />} />
          <Route path="/auctions" element={<Auctions />} />
          <Route path="/live" element={<LiveControl />} />
          <Route path="/auctions/live/:id" element={<LiveControl />} />
          <Route path="/auctions/scheduled/:id" element={<AuctionDetails />} />
          <Route path="/auctions/ended/:id" element={<AuctionDetails />} />
          <Route path="/banners" element={<Banners />} />
          <Route path="/add-truck" element={<AddTruck />} />
          <Route path="/add-model" element={<AddModel />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/financial-transactions" element={<FinancialTransactions />} />
        </Routes>
      </main>
    </div>
  );
}
