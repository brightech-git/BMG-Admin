import axios from "axios";

const base_url = 'https://scheme.bmgjeweller.com/api/v1/schemes';

export const getAllSliders = async () => {
    const response = await axios.get(`https://scheme.bmgjewellers.com/api/v1/schemes/all`);
    return response.data;
};


// ✅ Upload a new slider
export const uploadSlider = async (formData) => {
    const response = await axios.post(`${base_url}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

// ✅ Update slider
export const updateSlider = async (schemeId, formData) => {
    const params = new URLSearchParams();
    params.append("schemeId", schemeId);

    const response = await axios.put(`https://scheme.bmgjewellers.com/api/v1/schemes/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        params: { schemeId }, // Also include sliderId as query param if backend requires
    });
    return response.data;
};

// ✅ Delete slider
export const deleteSlider = async (sliderId) => {
    const response = await axios.delete(`${base_url}/delete`, {
        params: { sliderId },
    });
    return response.data;
};
