
import axiosInstance from "../api/axiosInstance";

const baseUrl = 'image-collector';

export const createBannerSetting = async(formData) => {
    try{

        console.log(formData ,'formData')
        const response = await axiosInstance.post(`${baseUrl}/create`, formData);
        return response.data;
    
    }
    catch(err){
        console.error("Error creating banner setting:", err);
        throw new Error("Failed to create banner setting");
    }
}

// GET BANNER SETTINGS
export const getBannerSettings = async (image_key) => {
    try {
        // Build params object conditionally
        const params = {};
        if (image_key) params.image_key = image_key;

        const response = await axiosInstance.get(`/${baseUrl}/list`, { params });
        return response.data;
    } catch (err) {
        throw new Error("Failed to fetch banner settings");
    }
};
export const getBannerSettingsByKey = async (imageKey) => {
    try {
        const response = await axiosInstance.get(`/${baseUrl}/${imageKey}`);
        return response.data;

    } catch (err) {
        throw new Error("Failed to fetch banner settings");
    }
};

// UPDATE BANNER SETTINGS
export const updateBannerSettings = async (id ,formData) => {
    try{
        const response = await axiosInstance.put(`/${baseUrl}/update`, formData ,{
            params: {id}
        });
        return response.data;
    }catch(err){
        throw new Error("Failed to update banner settings");
    }
};


export const deleteBannerSetting = async(id) => {
    try{
        const response = await axiosInstance.delete(`/${baseUrl}/delete`,{
            params: {id}
        });
        return response.data;
    }catch(err){
        throw new Error("Failed to delete banner setting");
    }
}
