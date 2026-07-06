
import {
    FaTachometerAlt,
    FaClipboardList,
    FaImage,
    FaTag,
    FaMapMarkerAlt,
    FaUserCircle,
    FaSignOutAlt,
    FaMask
} from 'react-icons/fa';
import { MdNotificationsActive } from 'react-icons/md';
import { Settings, Filter } from 'lucide-react';

// ── Menu tree ────────────────────────────────────────────────────────────────
export const MENU_CONFIG = [
    // ── Direct link (Tier 1, no children) ───────────────────────────────────
    {
        id: 'dashboard',
        title: 'Dashboard',
        icon: <FaTachometerAlt />,
        path: '/admin',
    },

    // ── Tier 1 → Tier 2 ─────────────────────────────────────────────────────
    {
        id: 'orders',
        title: 'Orders',
        icon: <FaClipboardList />,
        // No `path` here — this node is a group, not a page
        children: [
            { id: 'order-today', title: 'Today Orders', path: '/admin/order/today' },
            { id: 'order-pending', title: 'Pending', path: '/admin/order/status/PENDING' },
            { id: 'order-placed', title: 'Placed', path: '/admin/order/status/PLACED' },
            { id: 'order-processing', title: 'Quality Checking', path: '/admin/order/status/IN_PROCESSING' },
            { id: 'order-packing', title: 'Packing', path: '/admin/order/status/PACKING' },
            { id: 'order-ready', title: 'Ready to Ship', path: '/admin/order/status/READY_TO_SHIP' },
            { id: 'order-shipped', title: 'Dispatch', path: '/admin/order/status/SHIPPED' },
            { id: 'order-transit', title: 'In-Transit', path: '/admin/order/status/IN_TRANSIT' },
            { id: 'order-out', title: 'Out for Delivery', path: '/admin/order/status/OUT_FOR_DELIVERY' },
            { id: 'order-delivered', title: 'Delivered', path: '/admin/order/status/DELIVERED' },
            { id: 'order-cancelled', title: 'Cancelled', path: '/admin/order/status/CANCELLED' },
            { id: 'order-returned', title: 'Returned', path: '/admin/order/status/RETURNED' },
            { id: 'order-refunded', title: 'Refunded', path: '/admin/order/status/REFUNDED' },
            // { id:'order-track',title:'Order Track', path: '/admin/track/order/:id'}
        ],
    },

    {
        id: 'refund-orders',
        title: 'Refund Orders',
        icon: <FaClipboardList />,
        children: [
            { id: 'refund-requested', title: 'Requested', path: '/admin/order/refund/status/REQUESTED' },
            { id: 'refund-approved', title: 'Approved', path: '/admin/order/refund/status/APPROVED' },
            { id: 'refund-rejected', title: 'Rejected', path: '/admin/order/refund/status/REJECTED' },
            { id: 'refund-received', title: 'Received', path: '/admin/order/refund/status/RECEIVED' },
        ],
    },

    {
        id: 'images',
        title: 'Images',
        icon: <FaImage />,
        children: [
            { id: 'image-add', title: 'Tag Image Updater', path: '/admin/product/add' },
            { id: 'image-manage', title: 'Tag Image View', path: '/admin/product/manage' },
        ],
    },

    {
        id: 'banner',
        title: 'Banner',
        icon: <FaImage />,
        children: [
            { id: 'banner-add', title: 'Add Banners', path: '/admin/banner/add' },
            { id: 'banner-manage', title: 'Manage Banners', path: '/admin/banner/manage' },
            { id: 'breadcrumb-add', title: 'Add BreadCrumb', path: '/admin/breadcrumbbanner/add' },
            { id: 'breadcrumb-manage', title: 'Manage BreadCrumb', path: '/admin/breadcrumbbanner/manage' },
        ],
    },

    {
        id: 'category',
        title: 'Category',
        icon: <FaTag />,
        children: [

            // { id: 'header-add', title: 'Add Header', path: '/admin/header/add' },
            // { id: 'header-manage', title: 'Manage Header', path: '/admin/header/manage' },
            // { id: 'footer-add', title: 'Add Footer', path: '/admin/category/footer/add' },
            // { id: 'footer-manage', title: 'Manage Footer', path: '/admin/category/footer/manage' },
            { id: 'header-manage', title: 'Manage Header', path: '/admin/header/tree/manage' },
            { id: 'footer-manage', title: 'Manage Footer', path: '/admin/footer/tree/manage' },
        ],
    },

    // ── Tier 1 → Tier 2 → Tier 3 ────────────────────────────────────────────
    {
        id: 'settings',
        title: 'Settings',
        icon: <Settings />,
        children: [
            // Tier-2 group with its own Tier-3 leaves
            {
                id: 'settings-banner',
                title: 'Banner Settings',
                // no path — this is a Tier-2 group
                children: [
                    { id: 'banner-setting-add', title: 'Add Banner Setting', path: '/admin/banner/setting/add' },
                    { id: 'banner-setting-manage', title: 'Manage Banner Settings', path: '/admin/banner/setting/manage' },
                ],
            },
            {
                id: 'settings-filter',
                title: 'Filter Settings',
                children: [
                    { id: 'filter-setting-add', title: 'Add Filter Setting', path: '/admin/filter/setting/add' },
                    { id: 'filter-setting-manage', title: 'Manage Filter Settings', path: '/admin/filter/setting/manage' },
                ],
            },
            // {
            //     id: 'settings-header',
            //     title: 'Header Key',
            //     children: [
            //         { id: 'header-key-add', title: 'Add Header Key', path: '/admin/header/setting/add' },
            //         { id: 'header-key-manage', title: 'Manage Header Keys', path: '/admin/header/setting/manage' },
            //     ],
            // },
        ],
    },

    {
        id: 'notification',
        title: 'Notification',
        icon: <MdNotificationsActive />,
        children: [
            { id: 'notification-send', title: 'Send Notification', path: '/admin/notification' },
        ],
    },

    {
        id: 'address',
        title: 'Address',
        icon: <FaMapMarkerAlt />,
        children: [
            { id: 'address-manage', title: 'Manage Address', path: '/admin/address/manage' },
        ],
    },

    {
        id: 'filter',
        title: 'Filter',
        icon: <Filter />,
        children: [
            { id: 'filter-manage', title: 'Manage Filter Content', path: '/admin/filter/manage' },
            { id: 'filter-add', title: 'Add Filter Content', path: '/admin/filter/add' },
        ],
    },

    // ── Role-restricted section (ROLE_ADMIN only) ────────────────────────────
    // {
    //     id: 'employee',
    //     title: 'Employee',
    //     icon: <FaUserCircle />,   
    //     children: [
    //         { id: 'employee-add', title: 'Add Employee', path: '/admin/employee/add' },
    //         { id: 'employee-manage', title: 'Manage Employees', path: '/admin/employee/manage' },
    //     ],
    // },

    {
        id: 'role-master',
        title: 'Role Master',
        icon: <FaMask />,
        children: [
            { id: 'user-master', title: 'User Master', path: '/admin/master/user' },
            { id: 'role-master', title: 'Role Master', path: '/admin/master/role' },
            { id: 'role-mapping', title: 'Role Mapping', path: '/admin/role/mapping' },
            { id: 'role-permission', title: 'Role Permission', path: '/admin/role/permission' },
            { id: 'role-transaction', title: 'Role transaction', path: '/admin/role/transaction' },
        ],
    },
];



export function flattenMenu(items = MENU_CONFIG, ancestors = []) {
    const flat = [];

    for (const item of items) {
        const crumb = { id: item.id, title: item.title, path: item.path };

        if (item.children && item.children.length > 0) {
            // Recurse — pass this node as an ancestor
            flat.push(...flattenMenu(item.children, [...ancestors, crumb]));

            // If the parent also has its own path, include it as a leaf too
            if (item.path) {
                flat.push({
                    id: item.id,
                    title: item.title,
                    path: item.path,
                    ancestors,
                });
            }
        } else if (item.path) {
            flat.push({
                id: item.id,
                title: item.title,
                path: item.path,
                ancestors,
            });
        }
    }

    return flat;
}

export function getPageTitle(pathname) {
    const entry = flattenMenu().find((item) => item.path === pathname);
    return entry?.title ?? 'Admin Panel';
}


export function getBreadcrumbs(pathname) {
    const entry = flattenMenu().find((item) => item.path === pathname);
    if (!entry) return [];
    return [...entry.ancestors, { id: entry.id, title: entry.title, path: entry.path }];
}

function hasAccess(path, allowed = []) {
    return allowed.some((rule) => {
        if (rule.endsWith('/*')) {
            return path.startsWith(rule.replace('/*', ''));
        }
        return rule === path;
    });
}

export function filterMenuByIds(userIds = [], items = MENU_CONFIG) {
    // Dashboard is always visible
    const ids = userIds.includes('dashboard')
        ? userIds
        : ['dashboard', ...userIds];

    return items
        .map((item) => {
            if (item.children) {
                const filteredChildren = filterMenuByIds(ids, item.children);

                // A group node is allowed if any of its children are allowed
                if (filteredChildren.length === 0) return null;

                return { ...item, children: filteredChildren };
            }

            // Leaf node — check by ID
            if (!item.id) return null;

            return ids.includes(item.id) ? item : null;
        })
        .filter(Boolean);
}

export function getTableRows(items = MENU_CONFIG, tier = 1, parentTitle = null) {
    const rows = [];

    for (const item of items) {
        rows.push({
            id: item.id,
            name: item.title,
            path: item.path ?? '—',
            tier,
            parentTitle: parentTitle ?? '—',
        });

        if (item.children) {
            rows.push(...getTableRows(item.children, tier + 1, item.title));
        }
    }

    return rows;
}

export function buildPathToIdMap(items = MENU_CONFIG, map = {}) {
    for (const node of items) {
        if (node.path && node.id) {
            map[node.path] = node.id;
        }
        if (node.children) {
            buildPathToIdMap(node.children, map);
        }
    }
    return map;
}