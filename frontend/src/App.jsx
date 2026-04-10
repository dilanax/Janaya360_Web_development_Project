import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Politicians from './components/Politicians';
import Promises from './components/Promises';
import Feedback from './components/Feedback';
import News from './components/News';
import Notifications from './components/Notifications';
import Login from './pages/Login';
import Register from './pages/Register';
import PromiseDetail from './components/PromiseDetail';
import ChatBot from './components/ChatBot'; // The New FAB Component
import Profile from './pages/Profile';
import AdminDashboard from './pages/admindashboard';
import './App.css';

// We create a wrapper component so we can use the useLocation hook
const AppContent = () => {
  const location = useLocation();
  
  // Logic to detect if we are in the Admin section
  const isAdminRoute = 
    location.pathname.startsWith('/admin-') || 
    location.pathname.startsWith('/admin') || 
    location.pathname === '/users';

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Navbar: Hidden on Admin pages */}
      {!isAdminRoute && <Navbar />}
      
      <div className="flex-1">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/politicians" element={<Politicians />} />
          <Route path="/promises" element={<Promises />} />
          <Route path="/feedback" element={<Feedback />} /> // ✅ Public
          <Route path="/news" element={<News />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/promise/:id" element={<PromiseDetail />} />
          <Route path="/profile" element={<Profile />} />

          {/* --- SECURE ADMIN ROUTES --- */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-promises" element={<AdminDashboard />} />
          <Route path="/admin-news" element={<AdminDashboard />} />
          <Route path="/users" element={<AdminDashboard />} />
          <Route path="/admin-politicians" element={<AdminDashboard />} />
          <Route path="/admin-feedback" element={<AdminDashboard />} />
        </Routes>
      </div>

      {/* 2. ChatBot FAB: Only show on Public pages for a clean Admin UX */}
      {!isAdminRoute && <ChatBot />}
      
      {/* 3. Global Toaster for notifications */}
      <Toaster position="top-right" />
    </div>
  );
};
function NotificationsRoute() {
  try {
    const storedUser = JSON.parse(localStorage.getItem('userInfo') || 'null');
    return storedUser?.role === 'admin' ? <AdminDashboard /> : <Notifications />;
  } catch {
    return <Notifications />;
  }
}


function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/politicians" element={<Politicians />} />
          <Route path="/promises" element={<Promises />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/news" element={<News />} />
          <Route path="/notifications" element={<NotificationsRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-news" element={<AdminDashboard />} />
          <Route path="/users" element={<AdminDashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;