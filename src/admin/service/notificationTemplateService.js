import axiosInstance from "../api/axiosInstance";

// CREATE TEMPLATE (multipart/form-data)
export const createNotificationTemplate = async (formData) => {
    const response = await axiosInstance.post(
        "/notificationTemplates/create",
        formData,
        {
            headers: { "Content-Type": "multipart/form-data" },
        }
    );
    return response.data;
};

// GET ALL TEMPLATES
export const getAllNotificationTemplates = async () => {
    const response = await axiosInstance.get("/notificationTemplates/all");
    return response.data;
};

// GET TEMPLATE BY ID
export const getNotificationTemplateById = async (id) => {
    const response = await axiosInstance.get(`/notificationTemplates/${id}`);
    return response.data;
};
// GET TEMPLATE BY TEMPKEY
export const getNotificationTemplateByTempKey = async (tempKey) => {
    const response = await axiosInstance.get(`/notificationTemplates/by-temp-key/${tempKey}`);
    return response.data;
};


// UPDATE TEMPLATE (PATCH-LIKE)
export const updateNotificationTemplate = async (id, formData) => {
    const response = await axiosInstance.put(
        `/notificationTemplates/update/${id}`,
        formData,
        {
            headers: { "Content-Type": "multipart/form-data" },
        }
    );
    return response.data;
};

// DELETE TEMPLATE
export const deleteNotificationTemplate = async (id) => {
    try{
        const response = await axiosInstance.delete(`/notificationTemplates/delete/${id}`);
        return response.data;
    }
   catch(err){
        throw new Error(err.response.data.message || "Failed to delete template")
   }
};
