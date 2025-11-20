import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FestivalBannersService } from "../../../service/bannersSerivce";

export const useUploadFestivalBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) =>
            FestivalBannersService.createFestivalBanner(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['festivalbanners'] }); // Refetch banners list
        },
    });
};

export const useUpdateFEstivalBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) =>
            FestivalBannersService.updateFestivalBanner(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['festivalbanners'] }); // Refetch banners list after update
        },
    });
};

export const useDeleteFestivalBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) =>
            FestivalBannersService.deleteFestivalBanner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['festivalbanners'] }); // Refetch banners list after deletion
        },
    });
};
