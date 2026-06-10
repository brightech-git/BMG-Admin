import axiosInstance from "../api/axiosInstance";

export const RoleMasterService = {
    createRole: async (data) => {
        try {
            const res = await axiosInstance.post("/roles", data);
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message);
        }
    },

    getRoles: async () => {
        try {
            const res = await axiosInstance.get("/roles");
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message);
        }
    },

    getRoleById: async (id) => {
        try {
            const res = await axiosInstance.get(`/roles/${id}`);
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message);
        }
    },

    updateRole: async (id, data) => {
        try {
            const res = await axiosInstance.put(`/roles/${id}`, data);
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message);
        }
    },

    deleteRole: async (id) => {
        try {
            const res = await axiosInstance.delete(`/roles/${id}`);
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message);
        }
    }
};