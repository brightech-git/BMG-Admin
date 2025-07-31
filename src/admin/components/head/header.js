import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHome,
  FaBell,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaEnvelope,
  FaGlobe,
  FaSearch,
} from 'react-icons/fa';
import {
  MdDarkMode,
  MdOutlineLightMode,
  MdOutlineMenu,
  MdMenuOpen,
} from 'react-icons/md';
import { MyContext } from '../../context/themeContext/themeContext';
import logo from '../../assets/logo/logo.jpg';
import './NewAdminHeader.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth/authContext';
import { useUserProfile } from '../../hooks/profile/useUserProfile';
import { debounce } from 'lodash';

const NewAdminHeader = ({ toggleSidebar, isSidebarOpen }) => {
  const { themeMode, setThemeMode } = useContext(MyContext);
  const [scrolled, setScrolled] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showSearch, setShowSearch] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [activeButton, setActiveButton] = useState(null);

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const { data: user, isLoading } = useUserProfile();

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const languageRef = useRef(null);
  const emailRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Window resize handler
  useEffect(() => {
    const handleResize = debounce(() => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 768) {
        setShowSearch(false);
      }
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
        setActiveButton(null);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
        setActiveButton(null);
      }
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
        setActiveButton(null);
      }
      if (emailRef.current && !emailRef.current.contains(event.target)) {
        setIsEmailOpen(false);
        setActiveButton(null);
      }
     
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [windowWidth]);

  // Date and time update
  useEffect(() => {
    const updateDateTime = () => {
      const date = new Date();
      const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      const formattedDateTime = date.toLocaleDateString('en-US', options);
      setCurrentDateTime(formattedDateTime);
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleButtonClick = (buttonName) => {
    setActiveButton(activeButton === buttonName ? null : buttonName);
  };

  const toggleTheme = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLanguageOpen(false);
    setActiveButton(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleHomeClick = () => {
    const confirmed = window.confirm("Do you want to go to the home page?");
    if (confirmed) {
      navigate('/');
    }
  };

  return (
    <header
      className={`staradmin-header ${scrolled ? 'scrolled' : ''} ${themeMode}`}
      role="banner"
      aria-label="Admin Header"
    >
      <div className="staradmin-header-container">
        {/* Left: Logo & Company Info */}
        <div className="staradmin-header-left">
          {windowWidth < 768 && (
            <button
              className={`staradmin-menu-toggle ${isSidebarOpen ? 'active' : ''}`}
              onClick={toggleSidebar}
              aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggleSidebar()}
            >
              {isSidebarOpen ? <MdMenuOpen /> : <MdOutlineMenu />}
            </button>
          )}
          <div className="staradmin-brand">
            <div className="staradmin-logo-wrapper">
              <img src={logo} alt="BMG Jewelers Logo" className="staradmin-logo-image" />
            </div>
            {windowWidth > 576 && (
              <div className="staradmin-brand-text">
                <h1 className="staradmin-company-name">BMG Jewelers</h1>
                {windowWidth > 768 && (
                  <span className="staradmin-company-subtitle">pvt ltd</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center: Welcome Message & Date-Time */}
        <div className="staradmin-header-center">
          {windowWidth > 992 && (
            <div className="staradmin-welcome-section">
              <h2 className="staradmin-welcome-text">
                Good Morning, <span className="staradmin-username">{user?.username || 'Admin'}</span>
              </h2>
              <p className="staradmin-welcome-subtitle">Your dashboard summary this week</p>
            </div>
          )}
          
          {windowWidth > 768 && windowWidth <= 992 && (
            <div className="staradmin-datetime-compact">
              <div className="staradmin-datetime-display">
                <span className="staradmin-datetime-text">{currentDateTime}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Action Controls */}
        <div className="staradmin-header-right">
          <div className="staradmin-actions-group">
            {/* Home Dropdown */}
            <div className="staradmin-action-item" ref={dropdownRef}>
              <button
                className={`staradmin-action-btn ${activeButton === 'home' ? 'active' : ''}`}
                onClick={() => {
                  setIsOpen((prev) => !prev);
                  handleButtonClick('home');
                }}
                aria-label="Go to Home"
                tabIndex={0}
              >
                <FaHome />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    className="staradmin-dropdown"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  >
                    <div className="staradmin-dropdown-arrow"></div>
                    <button
                      onClick={handleHomeClick}
                      tabIndex={0}
                      className="staradmin-dropdown-item"
                    >
                      <FaHome className="staradmin-dropdown-icon" />
                      Go to Home
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button
              className={`staradmin-action-btn ${activeButton === 'theme' ? 'active' : ''}`}
              onClick={() => {
                toggleTheme();
                handleButtonClick('theme');
              }}
              aria-label={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
              tabIndex={0}
            >
              {themeMode === 'light' ? <MdDarkMode /> : <MdOutlineLightMode />}
            </button>

            {/* Language Dropdown */}
            <div className="staradmin-action-item" ref={languageRef}>
              <button
                className={`staradmin-action-btn ${activeButton === 'language' ? 'active' : ''}`}
                onClick={() => {
                  setIsLanguageOpen(!isLanguageOpen);
                  handleButtonClick('language');
                }}
                aria-label="Change language"
                tabIndex={0}
              >
                <FaGlobe />
              </button>
              <AnimatePresence>
                {isLanguageOpen && (
                  <motion.div
                    className="staradmin-dropdown"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  >
                    <div className="staradmin-dropdown-arrow"></div>
                    <button
                      onClick={() => changeLanguage('en')}
                      tabIndex={0}
                      className="staradmin-dropdown-item"
                    >
                      🇺🇸 English
                    </button>
                    <button
                      onClick={() => changeLanguage('ta')}
                      tabIndex={0}
                      className="staradmin-dropdown-item"
                    >
                      🇮🇳 Tamil
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {windowWidth > 480 && (
              <>
                {/* Email Dropdown */}
                <div className="staradmin-action-item" ref={emailRef}>
                  <button
                    className={`staradmin-action-btn ${activeButton === 'email' ? 'active' : ''}`}
                    onClick={() => {
                      setIsEmailOpen(!isEmailOpen);
                      handleButtonClick('email');
                    }}
                    aria-label="Messages"
                    tabIndex={0}
                  >
                    <FaEnvelope />
                  </button>
                  <AnimatePresence>
                    {isEmailOpen && (
                      <motion.div
                        className="staradmin-dropdown staradmin-dropdown-wide"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                      >
                        <div className="staradmin-dropdown-arrow"></div>
                        <div className="staradmin-dropdown-header">
                          <span>Messages</span>
                        </div>
                        <div className="staradmin-dropdown-content">
                          <div className="staradmin-empty-state">
                            <FaEnvelope className="staradmin-empty-icon" />
                            <div>
                              <strong>Coming Soon</strong>
                              <p>Messages feature under development</p>
                            </div>
                          </div>
                        </div>
                        <div className="staradmin-dropdown-footer">
                          <button className="staradmin-footer-btn">View all messages</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Notifications Dropdown */}
                <div className="staradmin-action-item" ref={notificationsRef}>
                  <button
                    className={`staradmin-action-btn ${activeButton === 'notifications' ? 'active' : ''}`}
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen);
                      handleButtonClick('notifications');
                    }}
                    aria-label="Notifications"
                    tabIndex={0}
                  >
                    <FaBell />
                    <span className="staradmin-notification-badge">5</span>
                  </button>
                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <motion.div
                        className="staradmin-dropdown staradmin-dropdown-wide"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                      >
                        <div className="staradmin-dropdown-arrow"></div>
                        <div className="staradmin-dropdown-header">
                          <span>Notifications</span>
                          <button className="staradmin-settings-btn" aria-label="Notification settings">
                            <FaCog />
                          </button>
                        </div>
                        <div className="staradmin-dropdown-content">
                          <div className="staradmin-empty-state">
                            <FaBell className="staradmin-empty-icon" />
                            <div>
                              <strong>Coming Soon</strong>
                              <p>Notifications feature under development</p>
                            </div>
                          </div>
                        </div>
                        <div className="staradmin-dropdown-footer">
                          <button className="staradmin-footer-btn">View all notifications</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

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
                  <FaUserCircle />
                )}
              </div>
              {windowWidth > 768 && (
                <div className="staradmin-profile-info">
                  <span className="staradmin-profile-name">{user?.username || 'Admin User'}</span>
                  <span className="staradmin-profile-role">Administrator</span>
                </div>
              )}
            </button>
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  className="staradmin-dropdown staradmin-profile-dropdown"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  <div className="staradmin-dropdown-arrow"></div>
                  <div className="staradmin-profile-header">
                    <div className="staradmin-profile-avatar-large">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="User Avatar" />
                      ) : (
                        <FaUserCircle />
                      )}
                    </div>
                    <div className="staradmin-profile-details">
                      <h4>{user?.username || 'Admin User'}</h4>
                      <p>Administrator</p>
                    </div>
                  </div>
                  <div className="staradmin-dropdown-divider"></div>
                  <button
                    className="staradmin-dropdown-item"
                    onClick={() => {
                      navigate('/admin/profile');
                      setIsProfileOpen(false);
                      setActiveButton(null);
                    }}
                    tabIndex={0}
                  >
                    <FaUserCircle className="staradmin-dropdown-icon" />
                    My Profile
                  </button>
                  <div className="staradmin-dropdown-divider"></div>
                  <button
                    className="staradmin-dropdown-item staradmin-logout-item"
                    onClick={handleLogout}
                    tabIndex={0}
                  >
                    <FaSignOutAlt className="staradmin-dropdown-icon" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Mobile DateTime Bar */}
      {windowWidth <= 768 && (
        <div className="staradmin-mobile-datetime">
          <span className="staradmin-mobile-datetime-text">{currentDateTime}</span>
        </div>
      )}
    </header>
  );
};

export default NewAdminHeader;