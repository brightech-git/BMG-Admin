import axiosInstance from "../api/axiosInstance";

export const RoleMasterService = {
    createRole: async (data) => {
        try {
            console.log("data to send", data);
            const res = await axiosInstance.post("/rolemaster", data);
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message);
        }
    },

    getRoles: async () => {
        try {
            const res = await axiosInstance.get("/rolemaster");
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message);
        }
    },

    getRoleById: async (id) => {
        try {
            const res = await axiosInstance.get(`/rolemaster/${id}`);
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message);
        }
    },

    updateRole: async (id, data) => {
        try {
            const res = await axiosInstance.put(`/rolemaster/${id}`, data);
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message);
        }
    },

    deleteRole: async (id) => {
        try {
            const res = await axiosInstance.delete(`/rolemaster/${id}`);
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message);
        }
    }
};