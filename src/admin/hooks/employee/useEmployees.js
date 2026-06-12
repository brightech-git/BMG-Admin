import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { EmployeeService } from "../../service/employeeService"

export const useEmployees = () => {
    const queryClient = useQueryClient();

    const getAllQuery = useQuery({
        queryKey: ["employees"],
        queryFn: EmployeeService.getAll,
    });

    const createMutation = useMutation({
        mutationFn: EmployeeService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["employees"],
            });
        },
    });

    const loginMutation = useMutation({
        mutationFn: EmployeeService.login,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) =>
            EmployeeService.update(id, data),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["employees"],
            });
        },
    });

    return {
        getAll: getAllQuery,
        refresh:getAllQuery.refetch,
        getLoading :getAllQuery.isLoading,
        getError:getAllQuery.isError,

        create: createMutation.mutate,
        createAsync: createMutation.mutateAsync,
        creating: createMutation.isPending,
        createSuccess:createMutation.isSuccess,
        createError :createMutation.isError,

        login: loginMutation.mutate,
        loginAsync: loginMutation.mutateAsync,
        loggingIn: loginMutation.isPending,

        update: updateMutation.mutate,
        updateAsync: updateMutation.mutateAsync,
        updating: updateMutation.isPending,
        updateError:updateMutation.isError,

    };
};