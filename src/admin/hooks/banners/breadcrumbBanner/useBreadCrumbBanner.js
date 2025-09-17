import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BreadCrumbBannersService } from "../../../service/bannersSerivce";

export const useBreadCrumbUploadMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ image, title, subtitle, itemname, subItemName ,pages ,occasion ,gender}) =>
            BreadCrumbBannersService.createBreadCrumbBanner(image, title, subtitle, itemname, subItemName ,pages ,occasion ,gender),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorybanners'] }); // Refetch banners list
        },
    });
};

export const useBreadCrumbUpdateMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, title, subtitle, itemName, subItemName, pages, occasion, gender, image }) => {
            const formData = new FormData();
            formData.append('id', id);
            if (title) formData.append('title', title);
            if (subtitle) formData.append('subtitle', subtitle);
            if (itemName) formData.append('itemName', itemName);
            if (subItemName) formData.append('subItemName', subItemName);
            if (pages) formData.append('pages', pages);
            if (occasion) formData.append('occasion', occasion);
            if (gender) formData.append('gender', gender);

            if (image instanceof File) {
                formData.append('newImage', image); // ✅ backend expects this name
            }

            // Debug log
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            return BreadCrumbBannersService.updateBreadCrumbBanner(formData);
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
