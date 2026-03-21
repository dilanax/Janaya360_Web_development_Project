import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <nav className="bg-gradient-to-r from-amber-700 via-orange-600 to-red-700 text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity"
          >
            Janaya360
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                  ${isActive(link.path)
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-medium text-white border-2 border-white/50 rounded-lg hover:border-white hover:bg-white/10 transition-all duration-300"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 text-sm font-medium bg-white text-amber-700 rounded-lg hover:bg-amber-100 transition-all duration-300 font-semibold"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {!isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-2 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`
                  block px-4 py-2 rounded-lg text-base font-medium transition-all duration-300
                  ${isActive(link.path)
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Auth Buttons */}
            <div className="pt-4 space-y-2">
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center px-4 py-2 text-sm font-medium text-white border-2 border-white/50 rounded-lg hover:border-white hover:bg-white/10 transition-all duration-300"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center px-4 py-2 text-sm font-medium bg-white text-amber-700 rounded-lg hover:bg-amber-100 transition-all duration-300 font-semibold"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;