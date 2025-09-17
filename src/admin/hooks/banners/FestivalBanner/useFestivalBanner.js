import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FestivalBannersService } from "../../../service/bannersSerivce";

export const useUploadFestivalBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ image, title, subtitle, itemname, sub_item_name }) =>
            FestivalBannersService.createFestivalBanner(image, title, subtitle, itemname, sub_item_name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['festivalbanners'] }); // Refetch banners list
        },
    });
};

export const useUpdateFEstivalBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ image, id, title, subtitle, item_name, sub_item_name }) =>
            FestivalBannersService.updateFestivalBanner(image, id, title, subtitle, item_name, sub_item_name),
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
