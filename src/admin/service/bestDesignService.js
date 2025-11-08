import axiosInstance from "../api/axiosInstance";
const baseUrl = 'best_design'

export const fetchBestDesigns = async () => {
    const { data } = await axiosInstance.get(`${baseUrl}/list`);
    return data;
};

export const uploadBestDesign = async (formData) => {

    const { data } = await axiosInstance.post(`${baseUrl}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
};

export const deleteBestDesign = async (id) => {
    const { data } = await axiosInstance.delete(`${baseUrl}/delete`, {
        params: { id },
    });
    return data;
};

export const updateBestDesign = async (formData) => {

    const { data } = await axiosInstance.put(`${baseUrl}/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
};
