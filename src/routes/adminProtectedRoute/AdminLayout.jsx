// AdminLayout.jsx

import { Outlet, Navigate, useLocation, matchPath } from 'react-router-dom';
import { buildPathToIdMap, MENU_CONFIG } from '../../admin/components/slide/menuConfig';

// Built once at module load — not on every render
const PATH_TO_ID = buildPathToIdMap(MENU_CONFIG);

// Dynamic routes — protected but not in sidebar
const HIDDEN_ROUTES = [
    { pattern: '/admin/track/order/:orderId', id: 'order-track' }, // accessible to anyone with order access
];

export default function AdminLayout({ path }) {
    const location = useLocation();

    const allowedIds = Array.isArray(path) ? path : [];
    const effectiveIds = allowedIds.includes('dashboard')
        ? allowedIds
        : ['dashboard', ...allowedIds];

    // 1. Try exact match (sidebar routes)
    let menuId = PATH_TO_ID[location.pathname];

    // 2. If no exact match, try dynamic patterns
    if (!menuId) {
        const matched = HIDDEN_ROUTES.find(({ pattern }) =>
            matchPath(pattern, location.pathname)
        );
        menuId = matched?.id ?? null;
    }

    // 3. URL not in MENU_CONFIG or HIDDEN_ROUTES → redirect
    if (!menuId) {
        return <Navigate to="/admin" replace />;
    }

    // 4. ID not in user's allowed list → redirect
    if (!effectiveIds.includes(menuId)) {
        return <Navigate to="/admin" replace />;
    }

    return <Outlet />;
}