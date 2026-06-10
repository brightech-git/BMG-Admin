import React, { useState, useEffect, useContext, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle, FaSignOutAlt, FaChevronRight } from 'react-icons/fa';
import { debounce } from 'lodash';

import { MyContext } from '../../context/themeContext/themeContext';
import { useUserProfile } from '../../hooks/profile/useUserProfile';
import { useAuth } from '../../context/auth/authContext';
import RoleBasedSection from '../common/RoleBasedSection';

import { MENU_CONFIG, filterMenuByPath, getPageTitle } from './menuConfig';

// ─────────────────────────────────────────────────────────────────────────────
// Recursive menu item — handles Tier 1, Tier 2, Tier 3 … any depth
// ─────────────────────────────────────────────────────────────────────────────
const MenuItem = ({
    item,
    depth = 0,          // 0 = Tier-1, 1 = Tier-2, 2 = Tier-3 …
    isOpen,             // sidebar open/collapsed
    expandedMap,
    onToggle,
    onLinkClick,
}) => {
    const location = useLocation();
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = !!expandedMap[item.id];

    // Is this node or any descendant the current route?
    const isAncestorActive = useMemo(() => {
        if (!hasChildren) return false;

        const checkActive = (nodes) =>
            nodes.some((n) =>
                n.path === location.pathname ||
                (n.children && checkActive(n.children))
            );

        return checkActive(item.children);
    }, [location.pathname, hasChildren, item.id]);

    // Indentation per depth level when sidebar is open
    const indent = isOpen ? depth * 12 : 0;

    // ── Group / parent node ─────────────────────────────────────────────────
    if (hasChildren) {
        return (
            <div>
                <button
                    onClick={() => onToggle(item.id)}
                    style={{ paddingLeft: `${12 + indent}px` }}
                    className={`
                        w-full flex items-center gap-3 py-2.5 pr-3 rounded-lg text-left
                        transition-colors duration-150 group
                        ${isAncestorActive
                            ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                        : 'text-[var(--primary-text-color)] hover:bg-gray-100'
                        }
                    `}
                >
                    {/* Icon — only shown at Tier-1 */}
                    {depth === 0 && item.icon && (
                        <span className={`shrink-0 text-base ${isAncestorActive ? 'text-[var(--primary-hover-color)]' : 'text-[var(--primary-text-color)]'}`}>
                            {item.icon}
                        </span>
                    )}

                    {/* Dot indicator for Tier-2+ */}
                    {depth > 0 && (
                        <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${isAncestorActive ? 'bg-orange-500' : 'bg-gray-300'}`} />
                    )}

                    <AnimatePresence>
                        {isOpen && (
                            <motion.span
                                className="flex-1 text-sm font-semibold truncate text-[var(--primary-text-color)]"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8 }}
                                transition={{ duration: 0.15 }}
                            >
                                {item.title}
                            </motion.span>
                        )}
                    </AnimatePresence>

                    {isOpen && (
                        <motion.span
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="shrink-0 text-xs text-[var(--primary-text-color)]"
                        >
                            <FaChevronRight size={10} />
                        </motion.span>
                    )}
                </button>

                {/* Children — animated collapse */}
                <AnimatePresence initial={false}>
                    {isExpanded && isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            {/* Left accent border for Tier-2 groups */}
                            <div className={depth === 0 ? 'ml-5 pl-3 border-l border-gray-200 dark:border-gray-700' : ''}>
                                {item.children.map((child) => (
                                    <MenuItem
                                        key={child.id}
                                        item={child}
                                        depth={depth + 1}
                                        isOpen={isOpen}
                                        expandedMap={expandedMap}
                                        onToggle={onToggle}
                                        onLinkClick={onLinkClick}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // ── Leaf / direct link ──────────────────────────────────────────────────
    return (
        <NavLink
            to={item.path}
            onClick={onLinkClick}
            style={{ paddingLeft: `${12 + indent}px` }}
            className={({ isActive }) => `
                flex items-center gap-3 py-2.5 pr-3 rounded-lg
                transition-colors duration-150 group no-underline
                ${isActive
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-200 dark:shadow-orange-900'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }
            `}
        >
            {/* Icon at Tier-1, dot at deeper tiers */}
            {depth === 0 && item.icon ? (
                <span className="shrink-0 text-base">{item.icon}</span>
            ) : (
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-current opacity-60" />
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.span
                        className="flex-1 text-sm  font-semibold truncate"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.15 }}
                    >
                        {item.title}
                    </motion.span>
                )}
            </AnimatePresence>

            {/* Badge */}
            {isOpen && item.badge != null && (
                <span className="shrink-0 text-xs bg-orange-100 text-orange-600 rounded-full px-1.5 py-0.5 font-semibold">
                    {item.badge}
                </span>
            )}
        </NavLink>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────────────────────
const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { themeMode } = useContext(MyContext);
    const { data: user, isLoading } = useUserProfile();
    const { logout } = useAuth();

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [expandedMap, setExpandedMap] = useState({});
    const [pageTitle, setPageTitle] = useState('Admin Dashboard');

    const isDark = themeMode === 'dark';

    // ── Responsive detection ────────────────────────────────────────────────
    useEffect(() => {
        const onResize = debounce(() => setIsMobile(window.innerWidth <= 768), 100);
        window.addEventListener('resize', onResize);
        return () => { window.removeEventListener('resize', onResize); onResize.cancel(); };
    }, []);

    // ── Auto-expand ancestors of the active route ───────────────────────────
    useEffect(() => {
        const userPaths = user?.allowedPaths ?? [
            '/admin/dashboard',
            '/admin/order/today',
            '/admin/banner/manage',
        ];
        console.log(userPaths,'userPaths')

        const visibleMenu = filterMenuByPath(userPaths);

        console.log(visibleMenu,'visibleMenu')

        const findAncestorIds = (nodes, targetPath, trail = []) => {
            for (const node of nodes) {
                if (node.path === targetPath) return trail;

                if (node.children) {
                    const result = findAncestorIds(
                        node.children,
                        targetPath,
                        [...trail, node.id]
                    );
                    if (result) return result;
                }
            }
            return null;
        };

        const ancestors = findAncestorIds(visibleMenu, location.pathname) ?? [];

        setExpandedMap((prev) => {
            const next = { ...prev };
            ancestors.forEach((id) => {
                next[id] = true;
            });
            return next;
        });
    }, [location.pathname, user]);

    // ── Page title ──────────────────────────────────────────────────────────
    useEffect(() => {
        setPageTitle(getPageTitle(location.pathname));
    }, [location.pathname]);

    // ── Toggle a single node ────────────────────────────────────────────────
    const toggleNode = (id) => {
        setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleLinkClick = () => {
        if (isMobile) toggleSidebar();
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    // ── Role-filtered menu ──────────────────────────────────────────────────
    const visibleMenu = useMemo(
        () => filterMenuByPath(user?.allowedPaths ?? [
            '/admin/dashboard',
            '/admin/order/*',
            '/admin/banner/manage',
            '/admin/*'
        ]),
        [user?.allowedPaths]
    );

    // ── Sidebar animation ───────────────────────────────────────────────────
    const sidebarVariants = {
        open: {
            x: 0,
            width: isMobile ? '280px' : '260px',
            transition: { type: 'spring', damping: 25, stiffness: 300 },
        },
        closed: {
            x: isMobile ? '-100%' : 0,
            width: isMobile ? 0 : '70px',
            transition: { type: 'spring', damping: 25, stiffness: 300 },
        },
    };

    if (isLoading) {
        return (
            <div className={`flex items-center justify-center h-screen w-[70px] ${isDark ? 'bg-gray-900' : 'bg-white'} border-r ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <>
            <motion.aside
                className={`
                    fixed left-0 top-[60px] h-[92%] z-40 flex flex-col
                    border-r overflow-hidden  bg-[var(--white-color)]
                `}
                initial="closed"
                animate={isOpen ? 'open' : 'closed'}
                variants={sidebarVariants}
                onMouseEnter={() => { if (!isMobile && !isOpen) toggleSidebar(); }}
                onMouseLeave={() => { if (!isMobile && isOpen) toggleSidebar(); }}
                role="navigation"
                aria-label="Admin Navigation"
            >
                {/* ── Header ─────────────────────────────────────────────── */}
                <div className={`shrink-0 p-2 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                    <AnimatePresence>
                        {isOpen ? (
                            <motion.div
                                key="open-header"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <p className="text-xs font-bold uppercase tracking-widest text-orange-500 truncate m-0">
                                    {pageTitle}
                                </p>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'} m-0`}>
                                    Management Panel
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="closed-header"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex justify-center"
                            >
                                <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                                    A
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Scrollable nav ─────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-0.5 ">
                    {/* Section label */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.8 }}
                                exit={{ opacity: 0 }}
                                className={`px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--primary-text-color)]`}
                            >
                                Main Menu
                            </motion.p>
                        )}
                    </AnimatePresence>

                    {visibleMenu.map((item) => (
                        <MenuItem
                            key={item.id}
                            item={item}
                            depth={0}
                            isOpen={isOpen}
                            expandedMap={expandedMap}
                            onToggle={toggleNode}
                            onLinkClick={handleLinkClick}
                        />
                    ))}
                </div>

                {/* ── Footer: user + logout ───────────────────────────────── */}
                <div className={`shrink-0 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'} p-2 space-y-1`}>
                    {/* User profile */}
                    <button
                        onClick={() => navigate('/admin/manage/employee')}
                        className={`
                            w-full flex items-center gap-2 p-2 rounded-lg
                            transition-colors text-left
                            ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}
                        `}
                    >
                        <span className="shrink-0 text-xl text-orange-400">
                            <FaUserCircle />
                        </span>
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -8 }}
                                    transition={{ duration: 0.15 }}
                                    className="flex-1 min-w-0"
                                >
                                    <p className="text-sm font-semibold truncate m-0">{user?.username ?? 'Admin User'}</p>
                                    <p className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-gray-400'} m-0`}>
                                        {user?.role ?? 'Administrator'}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        aria-label="Sign out"
                        className={`
                            w-full flex items-center gap-3 px-2 py-2 rounded-lg
                            transition-colors text-left
                            ${isDark
                                ? 'text-gray-400 hover:bg-red-900/20 hover:text-red-400'
                                : 'text-gray-500 hover:bg-red-50 hover:text-red-500'
                            }
                        `}
                    >
                        <span className="shrink-0 text-base"><FaSignOutAlt /></span>
                        <AnimatePresence>
                            {isOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -8 }}
                                    transition={{ duration: 0.15 }}
                                    className="text-sm font-semibold"
                                >
                                    Sign Out
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </motion.aside>

            {/* Mobile overlay */}
            <AnimatePresence>
                {isOpen && isMobile && (
                    <motion.div
                        className="fixed inset-0 z-30 bg-black/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleSidebar}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;