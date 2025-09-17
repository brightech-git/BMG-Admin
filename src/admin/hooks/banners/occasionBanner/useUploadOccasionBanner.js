import { useMutation, useQueryClient } from "@tanstack/react-query";
import { occasionBannersService } from "../../../service/bannersSerivce";

export const useUploadOccasionBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ image, title,subtitle,occasion,gender }) =>
            occasionBannersService.createOccasionBanner(image, title, subtitle,occasion,gender),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['occasionbanners'] }); // Refetch banners list
        },
    });
};

export const useUpdateOccasionBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ image, id, title, subtitle, occasion, gender }) => {
            // Build FormData dynamically
            const formData = new FormData();
            formData.append('id', id);
            formData.append('title', title);
            formData.append('subtitle', subtitle);
            formData.append('occasion', occasion);
            formData.append('gender', gender);

            // Only append image if it's a File (means it's a new upload)
            if (image instanceof File) {
                formData.append('image', image);
            }

            return occasionBannersService.updateOccasionBanner( formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['occasionbanners'] });
        },
    });
};

export const useDeleteOccasionBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) =>
            occasionBannersService.deleteOccasionBanner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['occasionbanners'] }); // Refetch banners list after deletion
        },
    });
};
