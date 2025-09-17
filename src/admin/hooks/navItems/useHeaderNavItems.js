// src/hooks/useMenu.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getMenuList,
    uploadMenuItem,
    updateMenuItem,
    deleteMenuItem,
} from "../../service/HeaderNavItems";

export const useMenu = () => {
    return useQuery({
        queryKey: ["menu"],
        queryFn: getMenuList,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
};

export const useUploadMenuItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: uploadMenuItem,
        onSuccess: () => {
            queryClient.invalidateQueries(["menu"]);
        },
    });
};

export const useUpdateMenuItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateMenuItem,
        onSuccess: () => {
            queryClient.invalidateQueries(["menu"]);
        },
    });
};

export const useDeleteMenuItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteMenuItem,
        onSuccess: () => {
            queryClient.invalidateQueries(["menu"]);
        },
    });
};
