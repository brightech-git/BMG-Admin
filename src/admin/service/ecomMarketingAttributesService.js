import axiosInstance from "../api/axiosInstance";

const BASE_URL = "/ecom-marketing-attributes";

export const EcomMarketingAttributesService = {
    // 🟢 Get all
    async getAll() {
        const res = await axiosInstance.get(`${BASE_URL}/all`);
        return res.data;
    },

    // 🟢 Get by ID
    async getById(id) {
        const res = await axiosInstance.get(`${BASE_URL}/${id}`);
        return res.data;
    },

    // 🟢 Create
    async create(payload) {
        const res = await axiosInstance.post(`${BASE_URL}/upload`, payload);
        return res.data;
    },

    // 🟢 Update
    async update(id, payload) {
        const res = await axiosInstance.put(`${BASE_URL}/${id}`, payload);
        return res.data;
    },

    // 🟢 Delete
    async remove(id) {
        const res = await axiosInstance.delete(`${BASE_URL}/${id}`);
        return res.data;
    },
};
