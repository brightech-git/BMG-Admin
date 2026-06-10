import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RoleMasterService } from "../../service/RoleMasterService";

export const useRoleMaster = () => {
    const queryClient = useQueryClient();

    const createRole = useMutation({
        mutationFn: RoleMasterService.createRole,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roleMaster"] });
        },
    });

    const updateRole = useMutation({
        mutationFn: ({ id, data }) =>
            RoleMasterService.updateRole(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roleMaster"] });
        },
    });

    const deleteRole = useMutation({
        mutationFn: (id) => RoleMasterService.deleteRole(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roleMaster"] });
        },
    });

    const getRoles = useQuery({
        queryKey: ["roleMaster"],
        queryFn: RoleMasterService.getRoles,
    });

    return {
        createRole,
        updateRole,
        deleteRole,
        getRoles,
    };
};