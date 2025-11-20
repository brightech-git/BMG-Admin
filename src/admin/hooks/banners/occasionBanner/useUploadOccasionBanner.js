import { useMutation, useQueryClient } from "@tanstack/react-query";
import { occasionBannersService } from "../../../service/bannersSerivce";

export const useUploadOccasionBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) =>
            occasionBannersService.createOccasionBanner(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['occasionbanners'] }); // Refetch banners list
        },
    });
};

export const useUpdateOccasionBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) => {
            return occasionBannersService.updateOccasionBanner(formData);
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
