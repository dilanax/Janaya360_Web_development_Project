import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import NotificationDropdown from "./NotificationDropdown";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Left Side - Logo */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-indigo-400">Justice Link</h1>
        </div>

        {/* Right Side - Notification & User */}
        <div className="flex items-center gap-6">
          
          {/* Notification Dropdown Component */}
          <NotificationDropdown />

          {/* User Profile with Hover Logout */}
          <div
            className="relative"
            onMouseEnter={() => setShowLogout(true)}
            onMouseLeave={() => setShowLogout(false)}
          >
            {/* User Display */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              {/* User Name */}
              <span className="text-gray-200 font-medium text-sm hidden sm:block">
                {user?.name || "User"}
              </span>

              {/* Chevron Icon */}
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  showLogout ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>

            {/* Logout Button - Appears on Hover */}
            {showLogout && (
              <div className="absolute right-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden animate-slideUp z-50">
                {/* User Info in Dropdown */}
                <div className="px-4 py-3 border-b border-gray-700 bg-gray-900">
                  <p className="text-xs text-gray-500">Logged in as</p>
                  <p className="text-sm font-semibold text-gray-200">{user?.name || "User"}</p>
                  <p className="text-xs text-gray-400">{user?.email || "email@example.com"}</p>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
