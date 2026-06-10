import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, createUser, deleteUserById } from '../../service/UserMasterService';


export const useUsers = () => {
    const queryClient = useQueryClient();

    const {
        data: employees = [], 
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['users'],
        queryFn: getAllUsers,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteUserById,
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
        },
        onError: (error) => {
            console.error('Delete error:', error);
        },
    });

    return {
        employees,
        isLoading,
        isError,
        refetch,
        deleteEmployee: deleteMutation.mutate,
        isDeleting: deleteMutation.isLoading,
    };
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
 
    return useMutation({
        mutationFn: createUser,
        onSuccess : ()=>{
            queryClient.invalidateQueries(['users']);
        },
        onError : () =>{
            queryClient.invalidateQueries(['users'])
        }
    });
};