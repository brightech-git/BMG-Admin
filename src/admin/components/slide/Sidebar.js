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
import { Settings ,FilterIcon} from 'lucide-react';

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
            { title: 'Today Orders', path: '/admin/order/today'},
            { title: 'Pending Orders', path: '/admin/order/status/PENDING' },
            { title: 'Placed', path: '/admin/order/status/PLACED' },
            { title: 'Quality Checking', path: '/admin/order/status/IN_PROCESSING'},
            { title: 'Packing', path: '/admin/order/status/PACKING'},
            { title: 'Ready to Ship', path: '/admin/order/status/READY_TO_SHIP'},
            { title: 'Dispatch', path: '/admin/order/status/SHIPPED' },
            { title: 'In-Transit', path: '/admin/order/status/IN_TRANSIT' },
            { title: 'Out For Delivery', path: '/admin/order/status/OUT_FOR_DELIVERY' },
            { title: 'Delivered', path: '/admin/order/status/DELIVERED' },
            { title: 'Cancelled', path: '/admin/order/status/CANCELLED'},
            { title: 'Returned', path: '/admin/order/status/RETURNED' },
            { title: 'Refunded', path: '/admin/order/status/REFUNDED' },
        ],
    },
    {
        title: 'Refund Orders',
        icon: <FaClipboardList className="staradmin-menu-icon" />,
        submenu: [
            // { title: 'Today Orders', path: '/admin/order/today' },
            { title: 'Requested', path: '/admin/order/refund/status/REQUESTED' },
            { title: 'Approved', path: '/admin/order/refund/status/APPROVED' },
            { title: 'Rejected', path: '/admin/order/refund/status/REJECTED' },
            { title: 'Received', path: '/admin/order/refund/status/RECEIVED' },
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
            { title: 'Manage BreadCrumb', path: '/admin/breadcrumbbanner/manage' },
            
            // { title: 'Manage OccasionBanners', path: '/admin/occasionbanner/manage' },
            // { title: 'Manage OfferBanners', path: '/admin/offerbanner/manage' },
            // { title: 'Manage BudgetBanner', path: '/admin/budgetbanner/manage' },
            // { title: 'Manage CategoryBanner', path: '/admin/categorybanner/manage' },
            // { title: 'Manage FestivalBanner', path: '/admin/festivalbanner/manage' },
            // { title: 'Manage Gender', path: '/admin/genderbanner/manage' },
            // { title: 'Manage BestDesign', path: '/admin/bestbanner/manage' },
            // { title: 'Manage Featured', path: '/admin/manage/featurebanner' },
            // { title: 'Manage Latest', path: '/admin/latestbanner/manage' },
        ],
    },
    {
        title: 'Category',
        icon: <FaTag className="staradmin-menu-icon" />,
        submenu: [
            { title: 'Manage Header', path: '/admin/header/manage' },
            // { title: 'Add Category', path: '/admin/item-category/add' },
            { title: 'Manage Category', path: '/admin/item-category/manage' },
            { title: 'Manage Footer', path: '/admin/category/footer/manage' },
        ],
    },
    {
        title: 'Settings',
        icon: <Settings className="staradmin-menu-icon" />,
        submenu: [
            { title: 'Add BannerSetting', path: '/admin/banner/setting/add' },
            { title: 'Add FilterSetting', path: '/admin/filter/setting/add' },
            { title: 'Manage BannerSettings', path: '/admin/banner/setting/manage' },
            { title: 'Manage FitlerSettings', path: '/admin/filter/setting/manage' },
        ],
    },
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
    {
        title: 'Filter',
        icon: <FilterIcon className="staradmin-menu-icon" />,
        submenu: [
            { title: 'Manage Filter', path: '/admin/filter/manage' },
            { title: 'Add Filter', path: '/admin/filter/add' },
        ],
    },
];

// const employeeMenu = {
//     title: 'Employee',
//     icon: <FaBox className="staradmin-menu-icon" />,
//     submenu: [
//         { title: 'Add Employee', path: '/admin/employee/add' },
//         { title: 'Manage Employees', path: '/admin/employee/manage' },
//     ],
// };

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
                                    className="flex-1 text-sm white-space-nowrap font-semibold"
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
                                    className="flex-1 text-sm white-space-nowrap font-semibold"
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
                        className="overflow-hidden p-2 border-l-2 ml-6 mb-2"
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
                                <span className="flex-1 font-semibold ">{subItem.title}</span>
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
        // if (employeeMenu.submenu) {
        //     initialExpanded['employee'] = employeeMenu.submenu.some(
        //         (subItem) => subItem.path === location.pathname
        //     );
        // }
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
                    <div className="staradmin-sidebar-header">
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    className="staradmin-page-indicator"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="text-sm font-semibold font-[var(--font-primary)] text-[var(--primary-color)] line-1.2 ">{currentPageTitle}</div>
                                    <div className="text-sm font-semibold font-[var(--font-primary)] text-[var(--primary-color)] line-1.2 ">Management Panel</div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="staradmin-sidebar-nav">
                        <div className="staradmin-menu-scroll">
                            <div className="staradmin-menu-section">
                                <AnimatePresence>
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
                                </AnimatePresence>

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

                    <div className="staradmin-sidebar-footer" >
                        <RoleBasedSection allowedRoles={['ROLE_ADMIN', 'ROLE_EMPLOYEE']}>
                            <div className="staradmin-user-profile" onClick={()=>navigate('/admin/manage/employee')}>
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