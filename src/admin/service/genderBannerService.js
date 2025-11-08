import axiosInstance from "../api/axiosInstance"

const baseUrl = "gender_images";

const genderBannerMange = {

     getGenderBanners : async() =>{
        const response = await axiosInstance.get(`${baseUrl}/list`);
        return response.data; 
    },

    uploadGenderImages : async(formData) =>{
        const response = await axiosInstance.post(`${baseUrl}/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    updateGenderImages : async(formData) =>{
        const response = await axiosInstance.put(`${baseUrl}/update`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    deleteGenderImages : async(id) =>{
        const response = await axiosInstance.delete(`${baseUrl}/delete`, { params: { id } });
        return response.data;
    }

    
    
} 
export default genderBannerMange;