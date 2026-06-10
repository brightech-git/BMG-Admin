import axiosInstance from "../api/axiosInstance";

const req = async (fn) => {
    try { return (await fn()).data; }
    catch (err) { throw new Error(err.response?.data?.message || err.message); }
};

export const RoleTransactionService = {
    create:  (data)     => req(() => axiosInstance.post('/role/transaction', data)),
    getAll:  ()         => req(() => axiosInstance.get('/role/transaction')),
    update:  (id, data) => req(() => axiosInstance.put(`/role/transaction/${id}`, data)),
    delete:  (id)       => req(() => axiosInstance.delete(`/role/transaction/${id}`)),
};
