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
            // const formData = new FormData();

            // formData.append('id', id); // int
            // formData.append('title', title); // String
            // formData.append('subtitle', subtitle); // String
            // formData.append('min_price', String(min_price || 0)); // BigDecimal-compatible string
            // formData.append('max_price', String(max_price || 0)); // BigDecimal-compatible string

            // if (image instanceof File) {
            //     formData.append('image', image);
            // }

            // // Debug: log FormData before sending
            // for (let [key, value] of formData.entries()) {
            //     console.log(key, value , 'budget');
            // }

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
