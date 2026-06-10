import axiosInstance from "../api/axiosInstance";

const base = "/role/permission";

const req = async (fn) => {
    try { return (await fn()).data; }
    catch (err) { throw new Error(err.response?.data?.message || err.message); }
};

export const ModuleService = {
    create:  (data)     => req(() => axiosInstance.post(`${base}/module`, data)),
    getAll:  ()         => req(() => axiosInstance.get(`${base}/module`)),
    update:  (id, data) => req(() => axiosInstance.put(`${base}/module/${id}`, data)),
    delete:  (id)       => req(() => axiosInstance.delete(`${base}/module/${id}`)),
};

export const SubModuleService = {
    create:  (data)     => req(() => axiosInstance.post(`${base}/sub-module`, data)),
    getAll:  ()         => req(() => axiosInstance.get(`${base}/sub-module`)),
    update:  (id, data) => req(() => axiosInstance.put(`${base}/sub-module/${id}`, data)),
    delete:  (id)       => req(() => axiosInstance.delete(`${base}/sub-module/${id}`)),
};

export const ContentService = {
    create:  (data)     => req(() => axiosInstance.post(`${base}/content`, data)),
    getAll:  ()         => req(() => axiosInstance.get(`${base}/content`)),
    update:  (id, data) => req(() => axiosInstance.put(`${base}/content/${id}`, data)),
    delete:  (id)       => req(() => axiosInstance.delete(`${base}/content/${id}`)),
};

export const RolePermissionViewService = {
    getView: () => req(() => axiosInstance.get(`${base}/view`)),
};
