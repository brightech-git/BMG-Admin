import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bannersService } from "../../../service/bannersSerivce";

export const useUploadBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) =>
            bannersService.createBanner(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] }); // Refetch banners list
        },
    });
};
// export const useUpdateBannerMutation = () => {
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: ({ id, image, title, subtitle, itemname }) =>

          
//             bannersService.updateBanner(
//                 id,
//                 image,
//                 title,
//                 subtitle,
//                 itemname,
           
//             ),
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['banners'] });
//         },
//     });
// };
export const useUpdateBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) =>
            bannersService.updateBanner(formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] });
        },
    });
};

export const useDeleteBannerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) =>
            bannersService.deleteBanner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banners'] }); // Refetch banners list after deletion
        },
    });
};
