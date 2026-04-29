import axiosInstance from "../api/axiosInstance";


export const getHeaderKeys= async (filters) => {
    console.log(filters,'keyFilters');
    const response = await axiosInstance.get(`/menu/headerKey/all`,{
        params:filters
    } );
    return response.data;
};

export const createHeaderKey = async (formData) => {

        console.log(formData,'createHeaderKey');
    const response = await axiosInstance.post(`/menu/headerKey/upload`, formData );
    return response.data;
};

export const updateHeaderKey = async ({id, payload}) => {

    try{
        const response = await axiosInstance.put(`/menu/headerKey/update/${id}`, payload);
        return response.data;
    }
  
    catch(err){
        console.warn("Something Went Wrong" ,err?.message);
    }
    

};

export const deleteHeaderKey = async (id) => {
    const response = await axiosInstance.delete(`/menu/headerKey/delete/${id}`);
    return response.data;
};



export const getMenuList = async () => {
    const response = await axiosInstance.get(`/menu/list`);
    return response.data;
};

export const uploadMenuItem = async (formData) => {
    const response = await axiosInstance.post(`/menu/upload`, formData);
    return response.data;
};

export const updateMenuItem = async ({ id, payload }) => {

    try {
        const response = await axiosInstance.put(`/menu/update/${id}`, payload);
        return response.data;
    }

    catch (err) {
        console.warn("Something Went Wrong", err?.message);
    }


};

export const deleteMenuItem = async (id) => {
    console.log(id, 'deleteid')
    const response = await axiosInstance.delete(`/menu/delete/${id}`);
    return response.data;
};