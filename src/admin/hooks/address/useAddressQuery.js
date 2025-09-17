import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import addressService from '../../service/addressService';

export const useAddressQuery = () => {
    const queryClient = useQueryClient();

    // Fetch all addresses
    const useGetAllAddresses = () =>
        useQuery({
            queryKey: ['addresses'],
            queryFn: addressService.getAllAddresses,
            staleTime: 5 * 60 * 1000, // 5 minutes
        });

    // Fetch address by ID
    const useGetAddressById = (id) =>
        useQuery({
            queryKey: ['address', id],
            queryFn: () => addressService.getAddressById(id),
            enabled: !!id,
            staleTime: 5 * 60 * 1000,
        });

    // Add new address
    const useAddAddress = () =>
        useMutation({
            mutationFn:({address})=> addressService.addAddress(address),
            onSuccess: () => {
                queryClient.invalidateQueries(['addresses']);
            },
        });

    // Update address
    const useUpdateAddress = () =>
        useMutation({
            mutationFn: ({ id, updatedAddress }) => addressService.updateAddress(id, updatedAddress),
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries(['addresses']);
                queryClient.invalidateQueries(['address', variables.id]);
            },
        });

    // Delete address
    const useDeleteAddress = () =>
        useMutation({
            mutationFn:({id}) =>addressService.deleteAddress(id),
            onSuccess: () => {
                queryClient.invalidateQueries(['addresses']);
            },
        });

    return {
        useGetAllAddresses,
        useGetAddressById,
        useAddAddress,
        useUpdateAddress,
        useDeleteAddress,
    };
};