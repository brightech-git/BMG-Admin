// hooks/useBannerSettings.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createBannerSetting,
    getBannerSettings,
    getBannerSettingsByKey,
    updateBannerSettings,
    deleteBannerSetting,
} from '../../../service/bannerSettingService';

// ─── GET ALL BANNER SETTINGS ─────────────────────────────
export const useGetBannerSettings = () => {
    return useQuery({
        queryKey: ['bannerSettings'],
        queryFn: getBannerSettings,
        staleTime: 5 * 60 * 1000, // 5 minutes
        onError: (err) => console.error("Failed to fetch banner settings:", err.message),
    });
};

// ─── GET BANNER SETTINGS BY KEY ──────────────────────────
export const useGetBannerSettingsByKey = (key) => {
    return useQuery({
        queryKey: ['bannerSettings', key],
        queryFn: () => getBannerSettingsByKey(key),
        enabled: !!key,
        staleTime: 5 * 60 * 1000,
        onError: (err) => console.error(`Failed to fetch banner setting for key ${key}:`, err.message),
    });
};

// ─── CREATE BANNER SETTING ───────────────────────────────
export const useCreateBannerSetting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['createBannerSetting'],
        mutationFn: createBannerSetting,
        onSuccess: () => {
            queryClient.invalidateQueries(['bannerSettings']);
        },
        onError: (err) => console.error("Failed to create banner setting:", err.message),
    });
};

// ─── UPDATE BANNER SETTING ───────────────────────────────
export const useUpdateBannerSetting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updateBannerSetting'],
        mutationFn: ({ id, formData }) => updateBannerSettings(id, formData),
        onSuccess: () => {
            queryClient.invalidateQueries(['bannerSettings']);
        },
        onError: (err) => console.error("Failed to update banner setting:", err.message),
    });
};

// ─── DELETE BANNER SETTING ───────────────────────────────
export const useDeleteBannerSetting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['deleteBannerSetting'],
        mutationFn: deleteBannerSetting,
        onSuccess: () => {
            queryClient.invalidateQueries(['bannerSettings']);
        },
        onError: (err) => console.error("Failed to delete banner setting:", err.message),
    });
};
