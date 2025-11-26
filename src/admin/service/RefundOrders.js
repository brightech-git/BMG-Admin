import axiosInstance from "../api/axiosInstance";

// Fetch all refund orders
export const fectRefundOrders = async () => {
    try {
        const response = await axiosInstance.get('/refunds');
        return response.data;
    } catch (err) {
        console.warn("Error fetching refund orders:", err);
        throw err;
    }
};

// Fetch refund order by ID
export const fetchrefundOrdersById = async (id) => {
    try {
        const response = await axiosInstance.get(`/refunds/${id}`);
        return response.data;
    } catch (err) {
        console.warn(`Error fetching refund order ${id}:`, err);
        throw err;
    }
};

// Update refund order by ID
export const updateRefundOrdersById = async (id, updateData) => {
    try {
        const response = await axiosInstance.put(`/refunds/${id}`, updateData);
        return response.data;
    } catch (err) {
        console.warn(`Error updating refund order ${id}:`, err);
        throw err;
    }
};

// Delete refund order by ID
export const deleteRefundOrdersById = async (id) => {
    try {
        const response = await axiosInstance.delete(`/refunds/${id}`);
        return response.data;
    } catch (err) {
        console.warn(`Error deleting refund order ${id}:`, err);
        throw err;
    }
};
