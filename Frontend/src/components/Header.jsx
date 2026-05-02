import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  // Derive authentication state from user
  const isAuthenticated = !!user;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  // Function to navigate to appropriate dashboard based on role
  const handleDashboardNavigation = () => {
  if (user?.role === 'admin') {
    handleNavigation('/admin/dashboard');
  } else if (user?.role === 'technician') {
    handleNavigation('/technician/dashboard');
  } else {
    handleNavigation('/dashboard');
  }
  setIsUserMenuOpen(false);
};

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1A1A1A] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 cursor-pointer" onClick={() => handleNavigation('/')}>
            <span className="text-[#1961d5] text-2xl lg:text-3xl font-bold">IMAX</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 xl:space-x-12">
            <button 
              onClick={() => handleNavigation('/')} 
              className="text-gray-300 hover:text-[#1961d5] font-medium transition-colors duration-300 text-sm xl:text-base"
            >
              Home
            </button>
            <button 
              onClick={() => handleNavigation('/shop')} 
              className="text-gray-300 hover:text-[#1961d5] font-medium transition-colors duration-300 text-sm xl:text-base"
            >
              Shop
            </button>
            <button 
              onClick={() => handleNavigation('/about')} 
              className="text-gray-300 hover:text-[#1961d5] font-medium transition-colors duration-300 text-sm xl:text-base"
            >
              About
            </button>
            <button 
              onClick={() => handleNavigation('/support')} 
              className="text-gray-300 hover:text-[#1961d5] font-medium transition-colors duration-300 text-sm xl:text-base"
            >
              Contact
            </button>
            <button 
              onClick={() => handleNavigation('/feedback')} 
              className="text-gray-300 hover:text-[#1961d5] font-medium transition-colors duration-300 text-sm xl:text-base"
            >
              Feedbacks
            </button>
            <button 
              onClick={() => handleNavigation('/create-appointment ')} 
              className="text-gray-300 hover:text-[#1961d5] font-medium transition-colors duration-300 text-sm xl:text-base"
            >
              Appointment 
            </button>
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {/* Search Button */}
            <button 
              className="p-2 text-gray-300 hover:text-[#1961d5] transition-colors duration-300 hover:bg-gray-800 rounded-lg" 
              aria-label="Search"
            >
              <svg className="w-5 h-5 xl:w-6 xl:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>

            {/* Cart Button - Only show for authenticated users */}
            {isAuthenticated && (
              <button 
                onClick={() => handleNavigation('/cart')}
                className="relative p-2 text-[#1961d5] hover:bg-gray-800 rounded-lg transition-colors duration-300" 
                aria-label="Shopping cart"
              >
                <svg className="w-5 h-5 xl:w-6 xl:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z"></path>
                  <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z"></path>
                  <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"></path>
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#1961d5] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Authentication Buttons / User Menu */}
            {!isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => handleNavigation('/login')}
                  className="px-4 py-2 text-gray-300 hover:text-[#1961d5] font-medium transition-colors duration-300 text-sm xl:text-base"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => handleNavigation('/register')}
                  className="px-4 py-2 bg-[#1961d5] text-white hover:bg-[#1449a8] font-medium rounded-lg transition-colors duration-300 text-sm xl:text-base"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <div className="relative">
                <button 
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 p-2 text-gray-300 hover:text-[#1961d5] hover:bg-gray-800 rounded-lg transition-colors duration-300"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 bg-[#1961d5] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden xl:block text-sm font-medium">{user?.name}</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                </button>
                
                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#242424] border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                    <button 
                      onClick={handleDashboardNavigation}
                      className="block w-full text-left px-4 py-2 text-gray-300 hover:text-[#1961d5] hover:bg-gray-800 transition-colors duration-300"
                    >
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        Dashboard
                      </div>
                    </button>
                    
                    {/* Show My Orders only for regular users */}
                    {user?.role !== 'admin' && (
                      <button 
                        onClick={() => {
                          handleNavigation('/my-orders');
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-300 hover:text-[#1961d5] hover:bg-gray-800 transition-colors duration-300"
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                          </svg>
                          My Orders
                        </div>
                      </button>
                    )}

                    <hr className="border-gray-700 my-2" />
                    
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-300 hover:text-red-400 hover:bg-gray-800 transition-colors duration-300"
                    >
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Sign Out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile cart and menu button */}
          <div className="flex items-center space-x-3 lg:hidden">
            {isAuthenticated && (
              <button 
                onClick={() => handleNavigation('/cart')}
                className="relative p-2 text-[#1961d5] hover:bg-gray-800 rounded-lg transition-colors duration-300" 
                aria-label="Shopping cart"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z"></path>
                  <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z"></path>
                  <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"></path>
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#1961d5] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            
            <button 
              onClick={toggleMenu} 
              className="p-2 text-gray-300 hover:text-[#1961d5] hover:bg-gray-800 rounded-lg transition-colors duration-300" 
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="bg-[#242424] border-t border-gray-700">
          {/* Mobile Navigation Links */}
          <div className="px-4 py-3 space-y-1">
            <button 
              onClick={() => handleNavigation('/')}
              className="block w-full text-left px-3 py-3 text-gray-300 hover:text-[#1961d5] hover:bg-gray-800/50 rounded transition-colors duration-300 font-medium"
            >
              Home
            </button>
            <button 
              onClick={() => handleNavigation('/shop')}
              className="block w-full text-left px-3 py-3 text-gray-300 hover:text-[#1961d5] hover:bg-gray-800/50 rounded transition-colors duration-300 font-medium"
            >
              Shop
            </button>
            <button 
              onClick={() => handleNavigation('/about')}
              className="block w-full text-left px-3 py-3 text-gray-300 hover:text-[#1961d5] hover:bg-gray-800/50 rounded transition-colors duration-300 font-medium"
            >
              About
            </button>
            <button 
              onClick={() => handleNavigation('/contact')}
              className="block w-full text-left px-3 py-3 text-gray-300 hover:text-[#1961d5] hover:bg-gray-800/50 rounded transition-colors duration-300 font-medium"
            >
              Contact
            </button>
          </div>
          
          {/* Mobile Actions */}
          <div className="px-4 py-4 border-t border-gray-700">
            {!isAuthenticated ? (
              <div className="space-y-3">
                <button 
                  onClick={() => handleNavigation('/login')}
                  className="block w-full text-center px-4 py-3 text-gray-300 hover:text-[#1961d5] hover:bg-gray-800 rounded-lg transition-colors duration-300 font-medium"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => handleNavigation('/register')}
                  className="block w-full text-center px-4 py-3 bg-[#1961d5] text-white hover:bg-[#1449a8] rounded-lg transition-colors duration-300 font-medium"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 px-3 py-2 bg-gray-800/50 rounded-lg">
                  <div className="w-10 h-10 bg-[#1961d5] text-white rounded-full flex items-center justify-center font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="text-[#1961d5] font-medium">{user?.name}</div>
                    <div className="text-gray-400 text-sm">{user?.email}</div>
                  </div>
                </div>
                
                <button 
                  onClick={handleDashboardNavigation}
                  className="block w-full text-left px-3 py-2 text-gray-300 hover:text-[#1961d5] hover:bg-gray-800 rounded transition-colors duration-300"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                    Dashboard
                  </div>
                </button>
                
                {/* Show My Orders only for regular users */}
                {user?.role !== 'admin' && (
                  <button 
                    onClick={() => handleNavigation('/my-orders')}
                    className="block w-full text-left px-3 py-2 text-gray-300 hover:text-[#1961d5] hover:bg-gray-800 rounded transition-colors duration-300"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                      </svg>
                      My Orders
                    </div>
                  </button>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-gray-300 hover:text-red-400 hover:bg-gray-800 rounded transition-colors duration-300"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Sign Out
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for user menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
}