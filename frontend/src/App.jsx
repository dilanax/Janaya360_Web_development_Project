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
import Profile from './pages/Profile';
import AdminDashboard from './pages/admindashboard';
import './App.css';

// We create a wrapper component so we can use the useLocation hook
const AppContent = () => {
  const location = useLocation();
  
  // Check if the current URL is an admin page
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname === '/users';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Magic trick: Only show the public Navbar if we are NOT on the admin dashboard! */}
      {!isAdminRoute && <Navbar />}
      
      <div className="flex-1">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/politicians" element={<Politicians />} />
          <Route path="/promises" element={<Promises />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/news" element={<News />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />

          {/* --- SECURE ADMIN ROUTES --- */}
          {/* Notice how we use /admin- prefix so they don't collide with your public pages */}
          {/* SECURE ADMIN ROUTES */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* Make sure this line exists! */}
          <Route path="/admin-promises" element={<AdminDashboard />} />
          <Route path="/admin-news" element={<AdminDashboard />} />
          <Route path="/users" element={<AdminDashboard />} />
          
          {/* Setup future admin routes so they are ready to go */}
          <Route path="/admin-politicians" element={<AdminDashboard />} />
          <Route path="/admin-feedback" element={<AdminDashboard />} />
        </Routes>
      </div>
      
      <Toaster position="top-right" />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;