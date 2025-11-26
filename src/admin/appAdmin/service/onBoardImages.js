import axios from "axios";
const baseUrl ='https://scheme.bmgjewellers.com/api/v1/schemebanner'

export const getAllSliders = async () => {
    const response = await axios.get(`${baseUrl}/all`);
    return response.data;
};


// ✅ Upload a new slider
export const uploadSlider = async (formData) => {
    const response = await axios.post(`${baseUrl}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

// ✅ Update slider
export const updateSlider = async (bannerId, formData) => {
    const params = new URLSearchParams();
    params.append("bannerId", bannerId);

    const response = await axios.put(`${baseUrl}/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        params: { bannerId }, // Also include sliderId as query param if backend requires
    });
    return response.data;
};

// ✅ Delete slider
export const deleteSlider = async (sliderId) => {
    const response = await axios.delete(`${baseUrl}/delete`, {
        params: { sliderId },
    });
    return response.data;
};
