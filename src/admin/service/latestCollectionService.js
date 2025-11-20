import axiosInstance from "../api/axiosInstance";

const baseUrl = "latest_collection";

const LatestBanner = {
    getLatestBanners: async () => {
        const response = await axiosInstance.get(`${baseUrl}/list`);
        return response.data; // only return data
    },

    uploadLatestBanner: async (formData) => {

        console.log(formData);

        for (let pair of formData.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }
        const response = await axiosInstance.post(`${baseUrl}/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    updateLatestBanner: async (formData) => {
        for (let pair of formData.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }
        const response = await axiosInstance.put(`${baseUrl}/update`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    deleteLatestBanner: async (id) => {
        const response = await axiosInstance.delete(`${baseUrl}/delete`, { params: { id } });
        return response.data;
    },
};

export default LatestBanner;
