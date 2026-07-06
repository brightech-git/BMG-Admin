import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HeaderTreeService, FooterTreeService } from "../../service/NavigationTreeService";

// Generic set of hooks for a nested navigation tree resource (header / footer).
const createNavigationTreeHooks = (service, queryKey) => {
    const useGetAll = () =>
        useQuery({
            queryKey: [queryKey],
            queryFn: service.getAll,
            staleTime: 1000 * 60 * 5,
        });

    const useCreate = () => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: service.create,
            onSuccess: () => queryClient.invalidateQueries([queryKey]),
        });
    };

    const useUpdate = () => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: ({ id, data }) => service.update(id, data),
            onSuccess: () => queryClient.invalidateQueries([queryKey]),
        });
    };

    const useDelete = () => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: service.deleteById,
            onSuccess: () => queryClient.invalidateQueries([queryKey]),
        });
    };

    return { useGetAll, useCreate, useUpdate, useDelete };
};

const headerHooks = createNavigationTreeHooks(HeaderTreeService, "header");
const footerHooks = createNavigationTreeHooks(FooterTreeService, "footer");

export const useGetAllHeaders = headerHooks.useGetAll;
export const useCreateHeader = headerHooks.useCreate;
export const useUpdateHeader = headerHooks.useUpdate;
export const useDeleteHeader = headerHooks.useDelete;

export const useGetAllFooters = footerHooks.useGetAll;
export const useCreateFooter = footerHooks.useCreate;
export const useUpdateFooter = footerHooks.useUpdate;
export const useDeleteFooter = footerHooks.useDelete;
