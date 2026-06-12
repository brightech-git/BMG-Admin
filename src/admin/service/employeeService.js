import axiosInstance from "../api/axiosInstance";

export const EmployeeService = {
    create: async (data) => {
        try {
            console.log("data to send", data)
            const res = await axiosInstance.post(
                "/employee/create",
                data
            );
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    login: async (data) => {
        try {
            const res = await axiosInstance.post(
                "/employee/login",
                data
            );
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getAll: async () => {
        try {
            const res = await axiosInstance.get("/employee");
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    update: async (id, data) => {
        try {
            const res = await axiosInstance.put(
                `/employee/${id}`,
                data
            );
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};