import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Register from "./pages/Register";
import Login from "./pages/Login"
import OTPRequest from "./pages/OTPRequest";
import OTPVerify from "./pages/OTPVerify";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Home from "./pages/Home";
import News from "./pages/News";
function AppContent() {
  const { user } = useContext(AuthContext);


function AppContent() {
  const { user } = useContext(AuthContext);

  return (
    <>
      {/* Show Navbar only on authenticated pages */}
      {user && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/news" element={<News />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp-request" element={<OTPRequest />} />
        <Route path="/verify-otp" element={<OTPVerify />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Login />} />
      </Routes>
    </>
  );
}

  return (
    <>
      {/* Show Navbar only on authenticated pages */}
      {user && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp-request" element={<OTPRequest />} />
        <Route path="/verify-otp" element={<OTPVerify />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Login />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
