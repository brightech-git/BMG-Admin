import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBestDesigns, uploadBestDesign, updateBestDesign, deleteBestDesign } from "../../../service/bestDesignService";

// Fetch all best designs
export const useBestDesignsQuery = () => {
    return useQuery({
        queryKey: ["bestDesigns"],
        queryFn: () =>fetchBestDesigns(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Upload a new design
export const useUploadBestDesignMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ image, name }) => {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("image", image);

            // Debug: log FormData entries
            for (let [key, value] of formData.entries()) {
                console.log(key, value, "bestDesign upload");
            }

            return uploadBestDesign(formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bestDesigns"] });
        },
    });
};

// Update a design
export const useUpdateBestDesignMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, name, image }) => {
            const formData = new FormData();
            formData.append("id", id);
            if (name) formData.append("name", name);
            if (image instanceof File) formData.append("image", image);

            // Debug: log FormData
            for (let [key, value] of formData.entries()) {
                console.log(key, value, "bestDesign update");
            }

            return updateBestDesign(formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bestDesigns"] });
        },
    });
};

// Delete a design
export const useDeleteBestDesignMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => deleteBestDesign(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bestDesigns"] });
        },
    });
};
