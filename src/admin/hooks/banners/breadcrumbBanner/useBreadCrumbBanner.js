import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BreadCrumbBannersService } from "../../../service/bannersSerivce";

export const useBreadCrumbUploadMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) =>
            BreadCrumbBannersService.createBreadCrumbBanner(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorybanners'] }); // Refetch banners list
        },
    });
};

export const useBreadCrumbUpdateMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        
        mutationFn: ({ payload, editId }) => {
            return BreadCrumbBannersService.updateBreadCrumbBanner(payload, editId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorybanners'] });
        },
    });
};


export const useDeleteBreadCrumbBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) =>
            BreadCrumbBannersService.deleteBreadCrumbBanner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorybanners'] }); // Refetch banners list after deletion
        },
    });
};
