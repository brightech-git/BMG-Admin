import axiosInstance from "../api/axiosInstance";

const req = async (fn) => {
    try { return (await fn()).data; }
    catch (err) { throw new Error(err.response?.data?.message || err.message); }
};

export const RoleTransactionService = {
    save:               (data)        => req(() => axiosInstance.post('/roletran', data)),
    saveBulk: (data) => req(() => { console.log(data, 'roletran'); return axiosInstance.post('/roletran/insert', data) } ),
    getAll:             ()            => req(() => axiosInstance.get('/roletran')),
    getByRoleId:        (roleId)      => req(() => axiosInstance.get(`/roletran/role/${roleId}`)),
    getActive:          ()            => req(() => axiosInstance.get('/roletran/active')),
    getByRoleIdAndActive:(roleId)     => req(() => axiosInstance.get(`/roletran/role/${roleId}/active`)),
    delete:             (sno)         => req(() => axiosInstance.delete(`/roletran/${sno}`)),
    toggle:             (sno)         => req(() => axiosInstance.put(`/roletran/${sno}/toggle`)),
};
