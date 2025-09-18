import React, { useState, useEffect, useContext } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    FaBox,
    FaImage,
    FaTag,
    FaVideo,
    FaTachometerAlt,
    FaDollarSign,
    FaUserCircle,
    FaSignOutAlt,
    FaClipboardList,
    FaChevronRight
} from 'react-icons/fa';
import { MdNotificationsActive } from "react-icons/md";
import { FaMapMarkerAlt } from "react-icons/fa";
import { MdMenuOpen, MdOutlineMenu } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { MyContext } from '../../context/themeContext/themeContext';
import './Sidebar.css';
import { getPageTitle } from '../../../utils/pageTitle/getPageTitle';
import RoleBasedSection from '../common/RoleBasedSection';
import { useUserProfile } from '../../hooks/profile/useUserProfile';
import { useAuth } from '../../context/auth/authContext';
import { debounce } from 'lodash';

const menuItems = [
    {
        title: 'Dashboard',
        icon: <FaTachometerAlt className="staradmin-menu-icon" />,
        path: '/admin/dashboard',
    },
    {
        title: 'Orders',
        icon: <FaClipboardList className="staradmin-menu-icon" />,
        submenu: [
            { title: 'Today Orders', path: '/admin/order/today', key: '', values: [''] },
            { title: 'Pending', path: '/admin/order/status/pending', key: 'PAYMENT_PENDING', values: ['IN_PROCESSING', 'CANCELLED'] },
            { title: 'Quality Checking', path: '/admin/order/status/qc', key: 'PLACED', values: ['IN_PROCESSING', 'CANCELLED'] },
            { title: 'Packed', path: '/admin/order/status/packed', key: 'IN_PROCESSING', values: ['PACKED', 'CANCELLED'] },
            { title: 'Dispatch', path: '/admin/order/status/shipped', key: 'PACKED', values: ['SHIPPED', 'CANCELLED'] },
            { title: 'Shipped', path: '/admin/order/status/shipping', key: 'SHIPPED', values: ['SHIPPED', 'CANCELLED'] },
            { title: 'In-Transit', path: '/admin/order/status/in-transit', key: 'IN_TRANSIT', values: ['SHIPPED', 'CANCELLED'] },
            { title: 'Delivered', path: '/admin/order/status/delivered', key: 'DELIVERED', values: ['SHIPPED', 'CANCELLED'] },
            { title: 'Cancelled', path: '/admin/order/status/cancelled', key: 'CANCELLED', values: ['SHIPPED', 'CANCELLED'] },
            { title: 'Returned', path: '/admin/order/status/returned', key: 'RETURNED', values: ['SHIPPED', 'CANCELLED'] },
            { title: 'Refunded', path: '/admin/order/status/refunded', key: 'REFUNDED', values: ['SHIPPED', 'CANCELLED'] },
        ],
    },
    {
        title: 'Images',
        icon: <FaBox className="staradmin-menu-icon" />,
        submenu: [
            { title: 'Tag image updator', path: '/admin/product/add' },
            { title: 'Tag image view', path: '/admin/product/manage' },
        ],
    },
    {
        title: 'Banner',
        icon: <FaImage className="staradmin-menu-icon" />,
        submenu: [
            { title: 'Manage Banners', path: '/admin/banner/manage' },
            { title: 'Manage OccasionBanners', path: '/admin/occasionbanner/manage' },
            { title: 'Manage OfferBanners', path: '/admin/offerbanner/manage' },
            { title: 'Manage BudgetBanner', path: '/admin/budgetbanner/manage' },
            { title: 'Manage CategoryBanner', path: '/admin/categorybanner/manage' },
            { title: 'Manage FestivalBanner', path: '/admin/festivalbanner/manage' },
            { title: 'Manage BreadCrumb', path: '/admin/breadcrumbbanner/manage' },
        ],
    },
    {
        title: 'Category',
        icon: <FaTag className="staradmin-menu-icon" />,
        submenu: [
            { title: 'Manage Header', path: '/admin/header/manage' },
        ],
    },
    {
        title: 'Video',
        icon: <FaVideo className="staradmin-menu-icon" />,
        submenu: [
            { title: 'Add Video', path: '/admin/video/add' },
            { title: 'Manage Videos', path: '/admin/video/manage' },
        ],
    },
    {
        title: 'Rates',
        icon: <FaDollarSign className="staradmin-menu-icon" />,
        submenu: [
            { title: 'Add Rates', path: '/admin/rates/add' },
            { title: 'Manage Rates', path: '/admin/rates/manage' },
        ],
    },
    {
        title: 'Notification',
        icon: <MdNotificationsActive className="staradmin-menu-icon" />,
        submenu: [
            { title: 'Send Notification', path: '/admin/notification' },
        ],
    },
    {
        title: 'Address',
        icon: <FaMapMarkerAlt className="staradmin-menu-icon" />,
        submenu: [
            { title: 'Manage Address', path: '/admin/address/manage' },
        ],
    },
];

const employeeMenu = {
    title: 'Employee',
    icon: <FaBox className="staradmin-menu-icon" />,
    submenu: [
        { title: 'Add Employee', path: '/admin/employee/add' },
        { title: 'Manage Employees', path: '/admin/employee/manage' },
    ],
};

const StarAdminMenuItem = ({ item, isExpanded, onToggle, onClick, isOpen, currentPath }) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isActive = item.path === currentPath ||
        (hasSubmenu && item.submenu.some(subItem => subItem.path === currentPath));

    const handleClick = () => {
        if (hasSubmenu) {
            onToggle(item.title.toLowerCase());
        } else if (onClick) {
            onClick();
        }
    };

    return (
        <div className="staradmin-menu-item-wrapper">
            {hasSubmenu ? (
                <div
                    className={`staradmin-menu-item ${isActive ? 'active' : ''} ${hasSubmenu ? 'has-submenu' : ''}`}
                    onClick={handleClick}
                >
                    <div className="staradmin-menu-content">
                        <div className="staradmin-menu-icon-wrapper">
                            {item.icon}
                        </div>
                        <AnimatePresence>
                            {isOpen && (
                                <motion.span
                                    className="staradmin-menu-text"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {item.title}
                                </motion.span>
                            )}
                        </AnimatePresence>
                        {hasSubmenu && isOpen && (
                            <motion.div
                                className="staradmin-menu-arrow"
                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <FaChevronRight size={12} />
                            </motion.div>
                        )}
                    </div>
                </div>
            ) : (
                <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                        `staradmin-menu-item ${isActive ? 'active' : ''}`
                    }
                    onClick={onClick}
                >
                    <div className="staradmin-menu-content">
                        <div className="staradmin-menu-icon-wrapper">
                            {item.icon}
                        </div>
                        <AnimatePresence>
                            {isOpen && (
                                <motion.span
                                    className="staradmin-menu-text"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {item.title}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </NavLink>
            )}

            <AnimatePresence>
                {hasSubmenu && isExpanded && isOpen && (
                    <motion.div
                        className="staradmin-submenu"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        {item.submenu.map((subItem) => (
                            <NavLink
                                key={subItem.path}
                                to={subItem.path}
                                state={{ key: subItem.key, values: subItem.values }}
                                className={({ isActive }) =>
                                    `staradmin-submenu-item ${isActive ? 'active' : ''}`
                                }
                                onClick={onClick}
                            >
                                <div className="staradmin-submenu-indicator"></div>
                                <span className="staradmin-submenu-text">{subItem.title}</span>
                            </NavLink>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { themeMode } = useContext(MyContext);
    const { data: user, isLoading } = useUserProfile();
    const { logout } = useAuth();
    const [expanded, setExpanded] = useState({});
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [currentPageTitle, setCurrentPageTitle] = useState('Admin Dashboard');

    useEffect(() => {
        const handleResize = debounce(() => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
        }, 100);

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            handleResize.cancel();
        };
    }, []);

    useEffect(() => {
        const initialExpanded = {};
        menuItems.forEach((item) => {
            if (item.submenu) {
                initialExpanded[item.title.toLowerCase()] = item.submenu.some(
                    (subItem) => subItem.path === location.pathname
                );
            }
        });
        if (employeeMenu.submenu) {
            initialExpanded['employee'] = employeeMenu.submenu.some(
                (subItem) => subItem.path === location.pathname
            );
        }
        setExpanded(initialExpanded);
    }, [location.pathname]);

    useEffect(() => {
        const title = getPageTitle(location.pathname, menuItems);
        setCurrentPageTitle(title);
    }, [location.pathname]);

    const toggleSection = (section) => {
        setExpanded((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const handleLinkClick = () => {
        if (isMobile) {
            toggleSidebar();
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const handleMouseEnter = () => {
        if (!isMobile && !isOpen) {
            toggleSidebar();
        }
    };

    const handleMouseLeave = () => {
        if (!isMobile && isOpen) {
            toggleSidebar();
        }
    };

    const sidebarVariants = {
        open: {
            x: 0,
            width: isMobile ? '280px' : '260px',
            transition: {
                type: 'spring',
                damping: 25,
                stiffness: 300,
            },
        },
        closed: {
            x: isMobile ? '-100%' : 0,
            width: isMobile ? 0 : '70px',
            transition: {
                type: 'spring',
                damping: 25,
                stiffness: 300,
            },
        },
    };

    if (isLoading) {
        return (
            <div className="staradmin-sidebar-loading">
                <div className="staradmin-loading-spinner"></div>
            </div>
        );
    }

    return (
        <>
            <motion.aside
                className={`staradmin-sidebar ${isOpen ? 'open' : 'closed'} ${themeMode}`}
                initial="closed"
                animate={isOpen ? 'open' : 'closed'}
                variants={sidebarVariants}
                role="navigation"
                aria-label="Admin Navigation"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="staradmin-sidebar-content">
                    {/* <div className="staradmin-sidebar-header">
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    className="staradmin-page-indicator"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="staradmin-page-title">{currentPageTitle}</div>
                                    <div className="staradmin-page-subtitle">Management Panel</div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div> */}

                    <div className="staradmin-sidebar-nav">
                        <div className="staradmin-menu-scroll">
                            <div className="staradmin-menu-section">
                                {/* <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            className="staradmin-section-label"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            MAIN MENU
                                        </motion.div>
                                    )}
                                </AnimatePresence> */}

                                {menuItems.map((item) => (
                                    <StarAdminMenuItem
                                        key={item.title}
                                        item={item}
                                        isExpanded={expanded[item.title.toLowerCase()]}
                                        onToggle={toggleSection}
                                        onClick={handleLinkClick}
                                        isOpen={isOpen}
                                        currentPath={location.pathname}
                                    />
                                ))}
                            </div>

                            <RoleBasedSection allowedRoles={['ROLE_ADMIN']}>
                                <div className="staradmin-menu-section">
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                className="staradmin-section-label"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                ADMINISTRATION
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <StarAdminMenuItem
                                        item={employeeMenu}
                                        isExpanded={expanded['employee']}
                                        onToggle={toggleSection}
                                        onClick={handleLinkClick}
                                        isOpen={isOpen}
                                        currentPath={location.pathname}
                                    />
                                </div>
                            </RoleBasedSection>
                        </div>
                    </div>

                    <div className="staradmin-sidebar-footer">
                        <RoleBasedSection allowedRoles={['ROLE_ADMIN', 'ROLE_EMPLOYEE']}>
                            <div className="staradmin-user-profile">
                                <div className="staradmin-user-avatar">
                                    <FaUserCircle />
                                </div>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            className="staradmin-user-info"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="staradmin-user-name">
                                                {user?.username || 'Admin User'}
                                            </div>
                                            <div className="staradmin-user-role">
                                                {user?.role || 'Administrator'}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                className="staradmin-logout-button"
                                onClick={handleLogout}
                                aria-label="Logout"
                                title={!isOpen ? 'Logout' : ''}
                            >
                                <div className="staradmin-logout-icon">
                                    <FaSignOutAlt />
                                </div>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.span
                                            className="staradmin-logout-text"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            Sign Out
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        </RoleBasedSection>
                    </div>
                </div>
            </motion.aside>

            <AnimatePresence>
                {isOpen && isMobile && (
                    <motion.div
                        className="staradmin-sidebar-overlay"
                        onClick={toggleSidebar}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;