import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(() => {
    const savedUser = localStorage.getItem('userInfo');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/politicians', label: 'Politicians' },
    { path: '/promises', label: 'Promises' },
    { path: '/feedback', label: 'Feedback' },
    { path: '/news', label: 'News' },
    { path: '/notifications', label: 'Notifications' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return location.pathname === path;
  };

  useEffect(() => {
    const syncAuthState = () => {
      const savedUser = localStorage.getItem('userInfo');
      setUserInfo(savedUser ? JSON.parse(savedUser) : null);
    };

    window.addEventListener('authChange', syncAuthState);
    window.addEventListener('storage', syncAuthState);

    return () => {
      window.removeEventListener('authChange', syncAuthState);
      window.removeEventListener('storage', syncAuthState);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    setIsMenuOpen(false);
    window.dispatchEvent(new Event('authChange'));
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight transition-all duration-300 text-gray-900"
          >
            <span>Janaya</span>
            <span className="text-blue-600">360</span>
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                  ${isActive(link.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            {userInfo ? (
              <>
                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  {userInfo.name}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all duration-300 font-semibold shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="h-6 w-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {!isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
          </button>
        </div>

        <div
          className={`
            lg:hidden overflow-hidden transition-all duration-500
            ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="px-2 pt-2 pb-4 space-y-1 rounded-lg mt-2 bg-white">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`
                  block px-4 py-2 rounded-lg text-base font-medium transition-all duration-300
                  ${isActive(link.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 space-y-2">
              {userInfo ? (
                <>
                  <div className="block w-full text-center px-4 py-2 text-sm font-medium text-gray-700">
                    {userInfo.name}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full text-center px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all duration-300 font-semibold"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
