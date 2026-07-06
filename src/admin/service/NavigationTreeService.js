import axiosInstance from "../api/axiosInstance";

// Generic CRUD service for a nested navigation tree resource
// (root node + recursive subLayers), e.g. /header or /footer.
export const createNavigationTreeService = (basePath) => ({
    getAll: async () => {
        const response = await axiosInstance.get(basePath);
        return response.data;
    },

    getById: async (id) => {
        const response = await axiosInstance.get(`${basePath}/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await axiosInstance.post(basePath, data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await axiosInstance.put(`${basePath}/${id}`, data);
        return response.data;
    },

    deleteById: async (id) => {
        const response = await axiosInstance.delete(`${basePath}/${id}`);
        return response.data;
    },
});

export const HeaderTreeService = createNavigationTreeService("/header");
export const FooterTreeService = createNavigationTreeService("/footer");
