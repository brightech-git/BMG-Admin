import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ModuleService,
    SubModuleService,
    ContentService,
    RolePermissionViewService,
} from "../../service/RolePermission";

export const useModules = () => {
    const queryClient = useQueryClient();
    const inv = () => queryClient.invalidateQueries({ queryKey: ["modules"] });
    return {
        getAll:  useQuery({ queryKey: ["modules"],  queryFn: ModuleService.getAll }),
        getAllList: useQuery({ queryKey: ["modulesList"], queryFn: ModuleService.getAllList }),
        create:  useMutation({ mutationFn: ModuleService.create,                          onSuccess: inv }),
        update:  useMutation({ mutationFn: ({ id, data }) => ModuleService.update(id, data), onSuccess: inv }),
        delete:  useMutation({ mutationFn: (id) => ModuleService.delete(id),              onSuccess: inv }),
    };
};

export const useSubModules = (parentId) => {
    const queryClient = useQueryClient();
    const inv = () => queryClient.invalidateQueries({ queryKey: ["subModules"] });
    return {
        getAll: useQuery({queryKey: ["subModules", parentId],queryFn: () => SubModuleService.getAll(parentId),enabled: !!parentId,}),
        create:  useMutation({ mutationFn:(data) => SubModuleService.create(parentId, data),                          onSuccess: inv }),
        update:  useMutation({ mutationFn: ({ id, data }) => SubModuleService.update(id, data), onSuccess: inv }),
        delete:  useMutation({ mutationFn: (id) => SubModuleService.delete(id),              onSuccess: inv }),
    };
};

export const useContents = ({ moduleId, subModuleId }) => {
    const queryClient = useQueryClient();

    const inv = () =>
        queryClient.invalidateQueries({
            queryKey: ["contents", moduleId, subModuleId],
        });
    const del = () => queryClient.invalidateQueries({ queryKey: ["contents"] });

    return {
        getAll: useQuery({
            queryKey: ["contents", moduleId, subModuleId],
            queryFn: () => {
                if (subModuleId) {
                    return ContentService.getAllBySubModule(subModuleId);
                }
                return ContentService.getAllBySubModule(moduleId); // or module API if exists
            },
            enabled: !!(moduleId || subModuleId),
        }),

        getByModule: useQuery({
            queryKey: ["contents", "module", moduleId],
            queryFn: () => ContentService.getAllByModule(moduleId),
            enabled: !!moduleId,
        }),

        // ✅ CREATE UNDER MODULE
        createWithParent: useMutation({
            mutationFn: (data) =>
                ContentService.createUnderModule(moduleId, data),
            onSuccess: inv,
        }),

        // ✅ CREATE UNDER SUBMODULE
        createWithSub: useMutation({
            mutationFn: (data) =>
                ContentService.create(subModuleId, data),
            onSuccess: inv,
        }),

        update: useMutation({
            mutationFn: ({ id, data }) =>
                ContentService.update(id, data),
            onSuccess: inv,
        }),

        delete: useMutation({
            mutationFn: (id) =>
                ContentService.delete(id),
            onSuccess: del,
        }),
    };
};
export const useRolePermissionView = () =>
    useQuery({ queryKey: ["rolePermissionView"], queryFn: RolePermissionViewService.getView });
