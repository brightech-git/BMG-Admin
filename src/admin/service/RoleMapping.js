import axiosInstance from "../api/axiosInstance";

export const RoleMappingService = {
    createRole: async (data) => {
        try {
            const res = await axiosInstance.post("/role/mapping", data);
            return res.data;
        } catch (err) {
            throw new Error(
                err.response?.data?.message || err.message
            );
        }
    },

    getRoles: async () => {
        try {
            const res = await axiosInstance.get("/role/mapping");
            return res.data;
        } catch (err) {
            throw new Error(
                err.response?.data?.message || err.message
            );
        }
    },

    updateRole: async (id, data) => {
        try {
            const res = await axiosInstance.put(
                `/role/mapping/${id}`,
                data
            );
            return res.data;
        } catch (err) {
            throw new Error(
                err.response?.data?.message || err.message
            );
        }
    },

    deleteRole: async (id) => {
        try {
            const res = await axiosInstance.delete(
                `/role/mapping/${id}`
            );
            return res.data;
        } catch (err) {
            throw new Error(
                err.response?.data?.message || err.message
            );
        }
    },
};