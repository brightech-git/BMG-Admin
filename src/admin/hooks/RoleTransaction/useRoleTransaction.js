import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RoleTransactionService } from "../../service/RoleTransactionService";

export const useRoleTransaction = () => {
    const queryClient = useQueryClient();
    const inv = () => queryClient.invalidateQueries({ queryKey: ["roleTransactions"] });
    return {
        getAll:  useQuery({ queryKey: ["roleTransactions"], queryFn: RoleTransactionService.getAll }),
        create:  useMutation({ mutationFn: RoleTransactionService.create, onSuccess: inv }),
        update:  useMutation({ mutationFn: ({ id, data }) => RoleTransactionService.update(id, data), onSuccess: inv }),
        delete:  useMutation({ mutationFn: (id) => RoleTransactionService.delete(id), onSuccess: inv }),
    };
};
