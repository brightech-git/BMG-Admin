import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BudgetBannersService } from "../../../service/bannersSerivce";

export const useCreateBanners = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) =>
            BudgetBannersService.createBudgetBanner(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetbanners'] }); // Refetch banners list
        },
    });
};

export const useUpdateBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id,formData) => {
        

            return BudgetBannersService.updateBudgetBanner(id,formData);
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorybanners'] }); // Refetch banners list after update
        },
    });
};

export const useDeleteBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) =>
            BudgetBannersService.deleteBudgetBanner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorybanners'] }); // Refetch banners list after deletion
        },
    });
};
