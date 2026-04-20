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

const NotificationsRoute = () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('userInfo') || 'null');
    return storedUser?.role === 'admin' ? <AdminDashboard /> : <Notifications />;
  } catch {
    return <Notifications />;
  }
};

const AppContent = () => {
  const location = useLocation();

  const isAdminRoute = 
    location.pathname.startsWith('/admin-') || 
    location.pathname.startsWith('/admin') ||
    location.pathname === '/users';

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminRoute && <Navbar />}

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/politicians" element={<Politicians />} />
          <Route path="/promises" element={<Promises />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/news" element={<News />} />
          <Route path="/notifications" element={<NotificationsRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/promise/:id" element={<PromiseDetail />} />
          <Route path="/promise/:id/feedback" element={<Feedback />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-promises" element={<AdminDashboard />} />
          <Route path="/admin-news" element={<AdminDashboard />} />
          <Route path="/admin-politicians" element={<AdminDashboard />} />
          <Route path="/admin-feedback" element={<AdminDashboard />} />
          <Route path="/admin-notifications" element={<AdminDashboard />} />
          <Route path="/users" element={<AdminDashboard />} />
        </Routes>
      </div>

      {!isAdminRoute && <ChatBot />}

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