// src/utils/getStatusRoute.js
import { STATUS_ROUTES } from "./statusRoutes";

export const getStatusRoute = (status) => {
    if (!status) return null;
    const safeStatus = status.toLowerCase().replace(/_/g, '-'); // convert "IN_PROCESSING" → "in-processing"
    return STATUS_ROUTES.find(route => route.path.toLowerCase().endsWith(safeStatus)) || null;
};
