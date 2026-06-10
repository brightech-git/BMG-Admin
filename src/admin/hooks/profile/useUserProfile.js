import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getProfile,
    getUserById,
    getAllUsers,
    updateUserById,
    deleteUserById
} from '../../service/profileService';

// ✅ Get current user's profile
export const useUserProfile = () => {
    return useQuery({
        queryKey: ['userProfile'],
        queryFn: getProfile
    });
};

// ✅ Get user by ID (admin)
export const useUserById = (id) => {
    return useQuery({
        queryKey: ['userById', id],
        queryFn: () => getUserById(id),
        enabled: !!id // Run only if ID is provided
    });
};

// // ✅ Get all users (admin)
// export const useAllUsers = () => {
//     return useQuery({
//         queryKey: ['allUsers'],
//         queryFn: getAllUsers
//     });
// };

// ✅ Update a user (admin)
export const useUpdateUserById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updatedData }) => updateUserById({ id, updatedData }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allUsers'] });
            queryClient.invalidateQueries({ queryKey: ['userById'] });
        }
    });
};

// // ✅ Delete a user (admin)
// export const useDeleteUserById = () => {
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: deleteUserById,
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['allUsers'] });
//         }
//     });
// };
