import adminInstance from "../../api/adminInstance";
import axios from "axios";
const BASE_URL = '/schemeslider'
// ✅ Get all sliders

export const getAllSliders = async () => {
    const response = await axios.get('https://scheme.bmgjewellers.com/api/v1/schemeslider/all');
    return response.data;
};


// ✅ Upload a new slider
export const uploadSlider = async (formData) => {
    const response = await axios.post(`https://scheme.bmgjewellers.com/api/v1/schemeslider/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

// ✅ Update slider
export const updateSlider = async (sliderId, formData) => {
    const params = new URLSearchParams();
    params.append("sliderId", sliderId);

    const response = await axios.put(`https://scheme.bmgjewellers.com/api/v1/schemeslider/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        params: { sliderId }, // Also include sliderId as query param if backend requires
    });
    return response.data;
};

// ✅ Delete slider
export const deleteSlider = async (sliderId) => {
    const response = await axios.delete('https://scheme.bmgjewellers.com/api/v1/schemeslider/delete', {
        params: { sliderId },
    });
    return response.data;
};
