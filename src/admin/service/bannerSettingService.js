import axiosInstance from "../api/axiosInstance";

const baseUrl = 'image-collector';

export const createBannerSetting = async(formData) => {
    try{
        const response = await axiosInstance.post(`/${baseUrl}/create`, formData);
        return response.data;
    
    }
    catch(err){
        throw new Error("Failed to create banner setting");
    }
}

// GET BANNER SETTINGS
export const getBannerSettings = async () => {
    try{
        const response = await axiosInstance.get(`${baseUrl}/list`);
        return response.data;
        
    }catch(err){
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
