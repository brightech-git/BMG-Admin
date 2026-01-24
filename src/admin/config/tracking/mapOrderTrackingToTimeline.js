// mapOrderTrackingToTimeline.ts
import dayjs from "dayjs";
import { TRACKING_STATUS_CONFIG } from "./trackingStatusConfig";

export const mapOrderTrackingToTimeline = (data) => {
    if (!data?.history?.length) return [];

    // sort history by time (just in case)
    const sortedHistory = [...data.history].sort(
        (a, b) => new Date(a.updated_at) - new Date(b.updated_at)
    );

    console.log(dayjs('2026-01-23T18:29:16.393+05:30') ,'storedTracking')

    return sortedHistory.map((item) => {
        const config = TRACKING_STATUS_CONFIG[item.status];

        return {
            key: item.status,
            title: config?.title || item.status,
            date: dayjs(item.updated_at).format("DD MMM YYYY, hh:mm A"),
            description: item.remarks,
            icon: config?.icon,
            completed: true, // history = already completed
            order: config?.order ?? 999,
        };
    });
};
