// AdminLayout.jsx

import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { buildPathToIdMap, MENU_CONFIG } from '../../admin/components/slide/menuConfig';


// Built once at module load — not on every render
const PATH_TO_ID = buildPathToIdMap(MENU_CONFIG);

export default function AdminLayout({ path }) {
    const location = useLocation();

    const allowedIds = path ?? [];

    console.log(allowedIds,'allowedIds');

    const effectiveIds = allowedIds.includes('dashboard')
        ? allowedIds
        : ['dashboard', ...allowedIds];

    console.log(effectiveIds,'effectiveIds');    

    // Translate current URL → menu ID
    const menuId = PATH_TO_ID[location.pathname];

    // URL not in MENU_CONFIG at all → redirect
    if (!menuId) {
        return <Navigate to="/admin" replace />;
    }

    // ID not in user's allowed list → redirect
    if (!effectiveIds.includes(menuId)) {
        return <Navigate to="/admin" replace />;
    }

    return <Outlet />;
}