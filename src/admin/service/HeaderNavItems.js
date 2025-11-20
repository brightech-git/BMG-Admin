import axiosInstance from "../api/axiosInstance";


export const getMenuList = async () => {
    const response = await axiosInstance.get(`/menu/list`);
    return response.data;
};

export const uploadMenuItem = async (formData) => {
    const response = await axiosInstance.post(`/menu/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const updateMenuItem = async (formData) => {

    for(const [ key,values] of formData.entries()){
        console.log(`${key}` ,values);
    }
    const response = await axiosInstance.put('/menu/update', formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const deleteMenuItem = async (id) => {
    console.log(id,'deleteid')
    const response = await axiosInstance.delete(`/menu/delete`, {
        params: { id },
    });
    return response.data;
};