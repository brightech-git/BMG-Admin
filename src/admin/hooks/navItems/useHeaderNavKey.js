// src/hooks/useMenu.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getHeaderKeys,
    createHeaderKey,
    updateHeaderKey,
    deleteHeaderKey,
} from "../../service/HeaderNavItems";

export const useHeaderKeys = (filters) => {
    return useQuery({
        queryKey: ["headerKeys", filters],
        queryFn: () => getHeaderKeys(filters),
        staleTime: 1000 * 60 * 5,
    });
};

export const useCreateHeaderKey = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createHeaderKey,
        onSuccess: () => {
            queryClient.invalidateQueries(["headerKeys"]);
        },
    });
};

export const useUpdateHeaderKey = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateHeaderKey,
        onSuccess: () => {
            queryClient.invalidateQueries(["headerKeys"]);
        },
    });
};

export const useDeleteHeaderKey = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteHeaderKey,
        onSuccess: () => {
            queryClient.invalidateQueries(["headerKeys"]);
        },
    });
};
