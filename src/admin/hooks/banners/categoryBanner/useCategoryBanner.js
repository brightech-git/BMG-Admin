import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoryBannersService } from "../../../service/bannersSerivce";

export const useCategoryUploadMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ image, title, subtitle, itemName, subItemName }) =>
            CategoryBannersService.createCategoryBanner(image, title, subtitle, itemName, subItemName),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorybanners'] }); // Refetch banners list
        },
    });
};

export const useCategoryUpdateMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ image, id, title, subtitle, itemName, subItemName }) =>
            CategoryBannersService.updateCategoryBanner(image, id, title, subtitle, itemName, subItemName),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorybanners'] }); // Refetch banners list after update
        },
    });
};

export const useDeleteCategoryBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) =>
            CategoryBannersService.deleteCategoryBanner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorybanners'] }); // Refetch banners list after deletion
        },
    });
};
