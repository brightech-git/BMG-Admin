import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllFooterEntries,
    createFooterEntry,
    updateFooterEntry,
    deleteFooterEntry,
} from "../../service/footerNavItemsService";

// ✅ Get all entries
export const useFooterEntries = () => {
    return useQuery({
        queryKey: ["footerEntries"],
        queryFn: getAllFooterEntries,
    });
};

// ✅ Create footer entry
export const useCreateFooterEntry = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createFooterEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["footerEntries"] });
        },
    });
};

// ✅ Update footer entry
export const useUpdateFooterEntry = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) => updateFooterEntry(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["footerEntries"] });
        },
    });
};

// ✅ Delete footer entry
export const useDeleteFooterEntry = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteFooterEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["footerEntries"] });
        },
    });
};
