import axiosInstance from "../api/axiosInstance";


export const getMenuList = async () => {
    const response = await axiosInstance.get(`/menu/list`);
    return response.data;
};

export const uploadMenuItem = async (formData) => {
    const response = await axiosInstance.post(`/menu/upload`, formData );
    return response.data;
};

export const updateMenuItem = async ({id, payload}) => {

    try{
        const response = await axiosInstance.put(`/menu/update/${id}`, payload);
        return response.data;
    }
  
    catch(err){
        console.warn("Something Went Wrong" ,err?.message);
    }
    

};

export const deleteMenuItem = async (id) => {
    console.log(id,'deleteid')
    const response = await axiosInstance.delete(`/menu/delete`, {
        params: { id },
    });
    return response.data;
};



export const getHeaderNavKeyList = async () => {
    const response = await axiosInstance.get(`/menu/list`);
    return response.data;
};

export const uploadHeaderNavKey = async (formData) => {
    const response = await axiosInstance.post(`/menu/upload`, formData);
    return response.data;
};

export const updateHeaderNavKey = async ({ id, payload }) => {

    try {
        const response = await axiosInstance.put(`/menu/update/${id}`, payload);
        return response.data;
    }

    catch (err) {
        console.warn("Something Went Wrong", err?.message);
    }


};

export const deleteHeaderNavKey = async (id) => {
    console.log(id, 'deleteid')
    const response = await axiosInstance.delete(`/menu/delete`, {
        params: { id },
    });
    return response.data;
};