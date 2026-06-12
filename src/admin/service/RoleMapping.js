import axiosInstance from "../api/axiosInstance";

export const RoleMappingService = {
    createRole: async (data) => {
        try {
            const res = await axiosInstance.post("/rolemapping", data);
            return res.data;
        } catch (err) {
            throw new Error(
                err.response?.data?.message || err.message
            );
        }
    },

    getRoles: async () => {
        try {
            const res = await axiosInstance.get("/rolemapping");
            return res.data;
        } catch (err) {
            throw new Error(
                err.response?.data?.message || err.message
            );
        }
    },

    updateRole: async (id, data) => {
        try {
            console.log(id, data, "service");
            const res = await axiosInstance.put(
                `/rolemapping/${id}`,
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
                `/rolemapping/${id}`
            );
            return res.data;
        } catch (err) {
            throw new Error(
                err.response?.data?.message || err.message
            );
        }
    },
};