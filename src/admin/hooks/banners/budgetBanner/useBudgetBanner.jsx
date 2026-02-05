import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BudgetBannersService } from "../../../service/bannersSerivce";

export const useBudgetBanner = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) =>
            BudgetBannersService.createBudgetBanner(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetbanners'] }); // Refetch banners list
        },
    });
};

export const useUpdateBudgetBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) => {
        

            return BudgetBannersService.updateBudgetBanner(formData);
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorybanners'] }); // Refetch banners list after update
        },
    });
};

export const useDeleteBudgetBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) =>
            BudgetBannersService.deleteBudgetBanner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorybanners'] }); // Refetch banners list after deletion
        },
    });
};
