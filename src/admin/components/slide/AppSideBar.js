import React, { useState, useEffect, useContext ,useMemo } from 'react';
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
import { Star, Gift, Award, User } from "lucide-react";

const menuItems = [
    {
        title: 'Dashboard',
        icon: <FaTachometerAlt className="staradmin-menu-icon" />,
        path: '/app/admin/dashboard',
    },
    {
        title: 'Scheme',
        icon: <FaClipboardList className="staradmin-menu-icon" />,
        submenu: [
            { title: 'Member Entrolled', path: '/app/admin/enrolledUsers/manage', key: '', values: [''] },
            // { title: 'Pending Orders', path: '/admin/order/status', key: 'PENDING', values: [''] },
            // { title: 'Placed', path: '/admin/order/status', key: 'PLACED', values: ['IN_PROCESSING', 'CANCELLED'] },
            // { title: 'Quality Checking', path: '/admin/order/status', key: 'IN_PROCESSING', values: ['PACKING', 'CANCELLED'] },
            // { title: 'Packing', path: '/admin/order/status', key: 'PACKING', values: ['PACKED', 'CANCELLED'] },
            // { title: 'Packed', path: '/admin/order/status', key: 'PACKED', values: ['SHIPPED', 'CANCELLED'] },
            // { title: 'Dispatch', path: '/admin/order/status', key: 'SHIPPED', values: ['SHIPPED', 'CANCELLED'] },
            // // { title: 'Shipped', path: '/admin/order/status/shipping', key: 'SHIPPED', values: ['SHIPPED', 'CANCELLED'] },
            // { title: 'In-Transit', path: '/admin/order/status', key: 'IN_TRANSIT', values: ['SHIPPED', 'CANCELLED'] },
            // { title: 'Delivered', path: '/admin/order/status', key: 'DELIVERED', values: ['SHIPPED', 'CANCELLED'] },
            // { title: 'Cancelled', path: '/admin/order/status', key: 'CANCELLED', values: ['SHIPPED', 'CANCELLED'] },
            // { title: 'Returned', path: '/admin/order/status', key: 'RETURNED', values: ['SHIPPED', 'CANCELLED'] },
            // { title: 'Refunded', path: '/admin/order/status', key: 'REFUNDED', values: ['SHIPPED', 'CANCELLED'] },
        ],
    },
    // {
    //     title: 'Images',
    //     icon: <FaBox className="staradmin-menu-icon" />,
    //     submenu: [
    //         { title: 'Tag image updator', path: '/admin/product/add' },
    //         { title: 'Tag image view', path: '/admin/product/manage' },
    //     ],
    // },
    {
        title: 'Banner',
        icon: <FaImage className="staradmin-menu-icon" />,
        submenu: [
            { title: 'Manage OnBoard', path: '/app/admin/onBoard/manage' },
            { title: 'Manage SliderBanners', path: '/app/admin/sliderbanner/manage' },
            { title: 'Manage SchemeBanners', path: '/app/admin/schemeBanner/manage' },

            // { title: 'Manage BudgetBanner', path: '/admin/budgetbanner/manage' },
            // { title: 'Manage CategoryBanner', path: '/admin/categorybanner/manage' },
            // { title: 'Manage FestivalBanner', path: '/admin/festivalbanner/manage' },
            // { title: 'Manage BreadCrumb', path: '/admin/breadcrumbbanner/manage' },
            // { title: 'Manage Gender', path: '/admin/genderbanner/manage' },
            // { title: 'Manage BestDesign', path: '/admin/bestbanner/manage' },
            // { title: 'Manage Featured', path: '/admin/manage/featurebanner' },
            // { title: 'Manage Latest', path: '/admin/latestbanner/manage' },
        ],
    },
    {
        title: 'Web Scheme Banners',
        icon: <FaImage className="staradmin-menu-icon" />,
        submenu: [
            { title: 'Manage Web Scheme Banners', path: '/app/admin/scheme/manage' },
           

            // { title: 'Manage BudgetBanner', path: '/admin/budgetbanner/manage' },
            // { title: 'Manage CategoryBanner', path: '/admin/categorybanner/manage' },
            // { title: 'Manage FestivalBanner', path: '/admin/festivalbanner/manage' },
            // { title: 'Manage BreadCrumb', path: '/admin/breadcrumbbanner/manage' },
            // { title: 'Manage Gender', path: '/admin/genderbanner/manage' },
            // { title: 'Manage BestDesign', path: '/admin/bestbanner/manage' },
            // { title: 'Manage Featured', path: '/admin/manage/featurebanner' },
            // { title: 'Manage Latest', path: '/admin/latestbanner/manage' },
        ],
    },
    // {
    //     title: 'Category',
    //     icon: <FaTag className="staradmin-menu-icon" />,
    //     submenu: [
    //         { title: 'Manage Header', path: '/admin/header/manage' },
    //         // { title: 'Add Category', path: '/admin/item-category/add' },
    //         { title: 'Manage Category', path: '/admin/item-category/manage' },
    //     ],
    // },
    // {
    //     title: 'Video',
    //     icon: <FaVideo className="staradmin-menu-icon" />,
    //     submenu: [
    //         { title: 'Add Video', path: '/admin/video/add' },
    //         { title: 'Manage Videos', path: '/admin/video/manage' },
    //     ],
    // },
    // {
    //     title: 'Rates',
    //     icon: <FaDollarSign className="staradmin-menu-icon" />,
    //     submenu: [
    //         { title: 'Add Rates', path: '/admin/rates/add' },
    //         { title: 'Manage Rates', path: '/admin/rates/manage' },
    //     ],
    // },
    {
        title: 'Notification',
        icon: <MdNotificationsActive className="staradmin-menu-icon" />,
        submenu: [
            { title: 'Send Notification', path: '/app/admin/notification/manage' },
        ],
    },
    {
        title: 'Redemption',
        icon: <Gift className="staradmin-menu-icon" />, // 🎁 Gift icon, clear for rewards
        submenu: [
            { title: 'Redemption Centre', path: '/app/admin/redemption/centre' },
        ],
    },
    {
        title: 'Users',
        icon: <User className="staradmin-menu-icon" />, // 🎁 Gift icon, clear for rewards
        submenu: [
            { title: 'Users Centre', path: '/app/admin/scheme/users' },
        ],
    }
    // {
    //     title: 'Address',
    //     icon: <FaMapMarkerAlt className="staradmin-menu-icon" />,
    //     submenu: [
    //         { title: 'Manage Address', path: '/admin/address/manage' },
    //     ],
    // },
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
    const location = useLocation();
    const hasSubmenu = item.submenu && item.submenu.length > 0;

    // Get current URL search parameters
    const searchParams = new URLSearchParams(location.search);
    const currentKey = searchParams.get('key');

    // Improved active state checking that considers query parameters
    const isActive = useMemo(() => {
        // For main menu items without submenu
        if (item.path && !hasSubmenu) {
            return location.pathname === item.path;
        }

        // For submenu items (check both path and key parameter)
        if (item.path && item.key !== undefined) {
            return location.pathname === item.path && currentKey === item.key;
        }

        return false;
    }, [location.pathname, location.search, item, hasSubmenu, currentKey]);

    // Check if parent menu has active child
    const hasActiveChild = useMemo(() => {
        if (!item.submenu) return false;

        return item.submenu.some(subItem => {
            if (subItem.path && subItem.key !== undefined) {
                return location.pathname === subItem.path && currentKey === subItem.key;
            }
            return location.pathname === subItem.path;
        });
    }, [location.pathname, location.search, item, currentKey]);

    // Parent is active if it has an active child
    const isParentActive = hasSubmenu && hasActiveChild;

    const handleClick = () => {
        if (hasSubmenu) {
            onToggle(item.title.toLowerCase());
        } else if (onClick) {
            onClick();
        }
    };

    // Helper function to create proper navigation for order items
    const getNavigationProps = (menuItem) => {
        if (menuItem.path === '/admin/order/status' && menuItem.key) {
            // For order status items, include the key parameter
            return {
                to: `${menuItem.path}?key=${menuItem.key}`,
                state: { key: menuItem.key, values: menuItem.values }
            };
        }
        return {
            to: menuItem.path,
            state: menuItem.key ? { key: menuItem.key, values: menuItem.values } : undefined
        };
    };

    return (
        <div className="staradmin-menu-item-wrapper">
            {hasSubmenu ? (
                <div
                    className={`staradmin-menu-item ${isParentActive ? 'active' : ''} ${hasSubmenu ? 'has-submenu' : ''}`}
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
                    {...getNavigationProps(item)}
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
                                key={`${subItem.path}-${subItem.key || ''}`}
                                {...getNavigationProps(subItem)}
                                className={({ isActive }) => {
                                    // Custom active check for order status items
                                    let active = isActive;
                                    if (subItem.path === '/admin/order/status' && subItem.key) {
                                        active = location.pathname === subItem.path &&
                                            currentKey === subItem.key;
                                    }
                                    return `staradmin-submenu-item ${active ? 'active' : ''}`;
                                }}
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

const AppSidebar = ({ isOpen, toggleSidebar }) => {
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
        const searchParams = new URLSearchParams(location.search);
        const currentKey = searchParams.get('key');

        const initialExpanded = {};
        menuItems.forEach((item) => {
            if (item.submenu) {
                initialExpanded[item.title.toLowerCase()] = item.submenu.some(
                    (subItem) => {
                        const pathMatches = subItem.path === location.pathname;
                        // For order items, also check the key parameter
                        if (subItem.path === '/admin/order/status' && subItem.key) {
                            return pathMatches && currentKey === subItem.key;
                        }
                        return pathMatches;
                    }
                );
            }
        });
        if (employeeMenu.submenu) {
            initialExpanded['employee'] = employeeMenu.submenu.some(
                (subItem) => subItem.path === location.pathname
            );
        }
        setExpanded(initialExpanded);
    }, [location.pathname, location.search]); // Add location.search as dependency

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

                            {/* <RoleBasedSection allowedRoles={['ROLE_ADMIN']}>
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
                            </RoleBasedSection> */}
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

export default AppSidebar;