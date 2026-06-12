import axiosInstance from "../api/axiosInstance";



const req = async (fn) => {
    try { return (await fn()).data; }
    catch (err) { throw new Error(err.response?.data?.message || err.message); }
};

export const ModuleService = {
    create:  (data)     => req(() => axiosInstance.post(`/module`, data)),
    getAll:  ()         => req(() => axiosInstance.get(`/module`)),
    getAllList: () => req(()=> axiosInstance.get(`/module/list`)),
    update:  (id, data) => req(() => axiosInstance.put(`/module/${id}`, data)),
    delete:  (id)       => req(() => axiosInstance.delete(`/module/${id}`)),
};

export const SubModuleService = {
    create: (parentId, data) => req(() => axiosInstance.post(`/submodule/${parentId}`, data)),
    getAll: (parentId) => req(() => axiosInstance.get(`/submodule/${parentId}`)),
    update:  (id, data) => req(() => axiosInstance.put(`/submodule/${id}`, data)),
    delete:  (id)       => req(() => axiosInstance.delete(`/submodule/${id}`)),
};

export const ContentService = {
    create: (subModuleId, data) =>
        req(() =>{
            console.log(subModuleId, data,'payloadforcontent');
            return axiosInstance.post(`/content/submodule/${subModuleId}`, data)
        }    
        ),

    createUnderModule: (moduleId, data) =>
        req(() =>{
            console.log(moduleId, data, 'payloadforcontent');
            return axiosInstance.post(`/content/module/${moduleId}`, data)
        }
      
        ),

    getAllBySubModule: (subModuleId) =>
        req(() =>
            axiosInstance.get(`/content/submodule/${subModuleId}`)
        ),

    getAllByModule: (moduleId) =>
        req(() =>
            axiosInstance.get(`/content/module/${moduleId}`)
        ),

    update: (id, data) =>
        req(() =>
            axiosInstance.put(`/content/${id}`, data)
        ),

    delete: (id) =>
        req(() =>
            axiosInstance.delete(`/content/${id}`)
        ),
};

export const RolePermissionViewService = {
    getView: () => req(() => axiosInstance.get(`/module/list`)),
};
