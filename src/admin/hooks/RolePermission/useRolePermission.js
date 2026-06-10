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
        create:  useMutation({ mutationFn: ModuleService.create,                          onSuccess: inv }),
        update:  useMutation({ mutationFn: ({ id, data }) => ModuleService.update(id, data), onSuccess: inv }),
        delete:  useMutation({ mutationFn: (id) => ModuleService.delete(id),              onSuccess: inv }),
    };
};

export const useSubModules = () => {
    const queryClient = useQueryClient();
    const inv = () => queryClient.invalidateQueries({ queryKey: ["subModules"] });
    return {
        getAll:  useQuery({ queryKey: ["subModules"],  queryFn: SubModuleService.getAll }),
        create:  useMutation({ mutationFn: SubModuleService.create,                          onSuccess: inv }),
        update:  useMutation({ mutationFn: ({ id, data }) => SubModuleService.update(id, data), onSuccess: inv }),
        delete:  useMutation({ mutationFn: (id) => SubModuleService.delete(id),              onSuccess: inv }),
    };
};

export const useContents = () => {
    const queryClient = useQueryClient();
    const inv = () => queryClient.invalidateQueries({ queryKey: ["contents"] });
    return {
        getAll:  useQuery({ queryKey: ["contents"],  queryFn: ContentService.getAll }),
        create:  useMutation({ mutationFn: ContentService.create,                          onSuccess: inv }),
        update:  useMutation({ mutationFn: ({ id, data }) => ContentService.update(id, data), onSuccess: inv }),
        delete:  useMutation({ mutationFn: (id) => ContentService.delete(id),              onSuccess: inv }),
    };
};

export const useRolePermissionView = () =>
    useQuery({ queryKey: ["rolePermissionView"], queryFn: RolePermissionViewService.getView });
