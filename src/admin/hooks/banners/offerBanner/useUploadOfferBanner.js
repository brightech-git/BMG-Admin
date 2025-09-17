import { useMutation, useQueryClient } from "@tanstack/react-query";
import { offerBannersService } from "../../../service/bannersSerivce";

export const useUploadOfferBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ image, title, subtitle, itemname, sub_item_name }) =>
            offerBannersService.createOfferBanner(image, title, subtitle, itemname, sub_item_name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['offerbanners'] }); // Refetch banners list
        },
    });
};

export const useUpdateOfferBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ image, id, title, subtitle, item_name, sub_item_name }) => {
            const formData = new FormData();
            formData.append('id', id);
            formData.append('title', title);
            formData.append('subtitle', subtitle);
            formData.append('item_name', item_name);
            formData.append('sub_item_name', sub_item_name);

            if (image instanceof File) {
                formData.append('image', image);
            }

            return offerBannersService.updateOfferBanner(id,formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['offerbanners'] });
        },
    });
};


export const useDeleteOfferBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) =>
            offerBannersService.deleteOfferBanner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['offerbanners'] }); // Refetch banners list after deletion
        },
    });
};
