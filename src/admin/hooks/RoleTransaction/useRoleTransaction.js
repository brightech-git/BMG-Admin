import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RoleTransactionService } from "../../service/RoleTransactionService";

export const useRoleTransaction = (roleId) => {
    const queryClient = useQueryClient();
    const inv = () => queryClient.invalidateQueries({ queryKey: ["roleTransactions"] });

    return {
        getAll:              useQuery({ queryKey: ["roleTransactions"],                          queryFn: RoleTransactionService.getAll }),
        getByRoleId:         useQuery({ queryKey: ["roleTransactions", "role", roleId],          queryFn: () => RoleTransactionService.getByRoleId(roleId), enabled: !!roleId }),
        getActive:           useQuery({ queryKey: ["roleTransactions", "active"],                queryFn: RoleTransactionService.getActive }),
        getByRoleIdAndActive:useQuery({ queryKey: ["roleTransactions", "role", roleId, "active"],queryFn: () => RoleTransactionService.getByRoleIdAndActive(roleId), enabled: !!roleId }),
        save:       useMutation({ mutationFn: (data)         => RoleTransactionService.save(data),         onSuccess: inv }),
        create:     useMutation({ mutationFn: (data)         => RoleTransactionService.saveBulk(data),     onSuccess: inv }),
        delete:     useMutation({ mutationFn: (sno)          => RoleTransactionService.delete(sno),        onSuccess: inv }),
        toggle:     useMutation({ mutationFn: (sno)          => RoleTransactionService.toggle(sno),        onSuccess: inv }),
    };
};
