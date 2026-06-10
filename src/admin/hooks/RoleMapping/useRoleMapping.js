import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RoleMappingService } from "../../service/RoleMapping";

export const useRoleMapping = () => {
    const queryClient = useQueryClient();

    const createRoleMapping = useMutation({
        mutationFn: RoleMappingService.createRole,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["roleMapping"],
            });
        },
    });

    const updateRoleMapping = useMutation({
        mutationFn: ({ id, data }) =>
            RoleMappingService.updateRole(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["roleMapping"],
            });
        },
    });

    const deleteRoleMapping = useMutation({
        mutationFn: (id) =>
            RoleMappingService.deleteRole(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["roleMapping"],
            });
        },
    });

    const getRoleMappings = useQuery({
        queryKey: ["roleMapping"],
        queryFn: RoleMappingService.getRoles,
    });

    return {
        createRoleMapping,
        updateRoleMapping,
        deleteRoleMapping,
        getRoleMappings,
    };
};