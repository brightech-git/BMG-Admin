import axiosInstance from "../api/axiosInstance";

const addressService = {
    // Save new address
    addAddress: async (address) => {
        try {
            const response = await axiosInstance.post('/origin-address/add', address);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || 'Failed to add address');
        }
    },

    // Get address by ID
    getAddressById: async (id) => {
        try {
            const response = await axiosInstance.get(`/origin-address/get/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || 'Failed to fetch address');
        }
    },

    // Get all addresses
    getAllAddresses: async () => {
        try {
            const response = await axiosInstance.get('/origin-address/list');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || 'Failed to fetch addresses');
        }
    },

    // Update address
    updateAddress: async (id, updatedAddress) => {
        try {
            const response = await axiosInstance.put(`/origin-address/update/${id}`, updatedAddress);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || 'Failed to update address');
        }
    },

    // Delete address
    deleteAddress: async (id) => {
        try {
            const response = await axiosInstance.delete(`/origin-address/delete/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data || 'Failed to delete address');
        }
    },
};

export default addressService;