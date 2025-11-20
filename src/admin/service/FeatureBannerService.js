import axiosInstance from "../api/axiosInstance";

const baseUrl = "feature_product";

const FeatureBanner = {
    getFeaturedBanners: async () => {
        const response = await axiosInstance.get(`${baseUrl}/list`);
        return response.data; // only return data
    },

    uploadFeaturedBanner: async (formData) => {

        console.log(formData);

        for (let pair of formData.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }
        const response = await axiosInstance.post(`${baseUrl}/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    updateFeaturedBanner: async (formData) => {
        for(const[key , values] of formData.entries())
            console.log(key,values);
        const response = await axiosInstance.put(`${baseUrl}/update`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    deleteFeaturedBanner: async (id) => {
        const response = await axiosInstance.delete(`${baseUrl}/delete`, { params: { id } });
        return response.data;
    },
};

export default FeatureBanner;
