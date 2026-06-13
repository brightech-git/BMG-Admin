import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { MdDarkMode, MdOutlineLightMode, MdOutlineMenu, MdMenuOpen } from 'react-icons/md';
import { MyContext } from '../../context/themeContext/themeContext';
import logo from '../../assets/logo/logo.jpg';
import './NewAdminHeader.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth/authContext';
import { debounce } from 'lodash';
import "./AppSwitchButton.css";


const NewAdminHeader = ({ toggleSidebar, isSidebarOpen }) => {
  const { themeMode, setThemeMode } = useContext(MyContext);
  const [scrolled, setScrolled] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const navigate = useNavigate();
  const location =useLocation();
  const { logout , user } = useAuth();

  console.log(user,'user')

  
  const profileRef = useRef(null);

  const isChitApp = location.pathname.startsWith("/app/admin");
  const buttonText = isChitApp ? "Switch to E-com App" : "Switch to Chit App";
  // Window resize handler
  useEffect(() => {
    const handleResize = debounce(() => {
      setWindowWidth(window.innerWidth);
    }, 100);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      handleResize.cancel();
    };
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = debounce(() => setScrolled(window.scrollY > 20), 100);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      handleScroll.cancel();
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
        setActiveButton(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleButtonClick = (buttonName) => {
    setActiveButton(activeButton === buttonName ? null : buttonName);
  };

  const toggleTheme = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header
      className={`staradmin-header ${scrolled ? 'scrolled' : ''} ${themeMode}`}
      role="banner"
      aria-label="Admin Header"
    >
      <div className="staradmin-header-container">
        {/* Left: Logo & Sidebar Toggle */}
        <div className="staradmin-header-left">
          <button
            className="staradmin-menu-toggle"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSidebar()}
          >
            {isSidebarOpen ? <MdMenuOpen size={20} /> : <MdOutlineMenu size={20} />}
          </button>
          <div className="staradmin-brand">
            <img src={logo} alt="BMG Jewellers Logo" className="staradmin-logo-image" />
            {windowWidth > 576 && (
              <span className="staradmin-company-name">BMG Jewellers <span >  pvt ltd</span></span>
            )}
          </div>
        </div>

        {/* Right: Action Controls */}
        <div className="staradmin-header-right">
        
            {/* Theme Toggle */}
            {/* <button
              className={`staradmin-action-btn ${activeButton === 'theme' ? 'active' : ''}`}
              onClick={() => {
                toggleTheme();
                handleButtonClick('theme');
              }}
              aria-label={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
              tabIndex={0}
            >
              {themeMode === 'light' ? <MdDarkMode size={18} /> : <MdOutlineLightMode size={18} />}
            </button> */}
            {/* <div className="admin-actions-groups">
              <button
                className="admin-action-btn"
                onClick={() => {
                  if (isChitApp) {
                    navigate("/admin");      // 👉 Move to E-com Admin
                  } else {
                    navigate("/app/admin");  // 👉 Move to Chit App
                  }
                }}
                tabIndex={0}
              >
                {buttonText}
              </button>
       
          </div> */}

          {/* User Profile Section */}
          <div className="staradmin-profile-section" ref={profileRef}>
            <button
              className={`staradmin-profile-btn ${activeButton === 'profile' ? 'active' : ''}`}
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                handleButtonClick('profile');
              }}
              aria-label="User profile"
              tabIndex={0}
            >
              <div className="staradmin-profile-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt="User Avatar" />
                ) : (
                  <FaUserCircle size={18} />
                )}
              </div>
              {windowWidth > 768 && (
                <span className="staradmin-profile-name">{user.name || 'Admin'}</span>
              )}
            </button>
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  className="staradmin-dropdown"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  <button
                    className="staradmin-dropdown-item"
                    onClick={handleLogout}
                    aria-label="Logout"
                  >
                    <FaSignOutAlt size={14} />
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NewAdminHeader;