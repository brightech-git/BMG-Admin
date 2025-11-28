import axiosInstance from "../api/axiosInstance";

const API_BASE = 'footer-container'

export const getAllFooterEntries = async () => {
    const response = await axiosInstance.get(`${API_BASE}/all`);
    return response.data.entries; // returns the array of footer entries
};

export const createFooterEntry = async (data) => {
    // data should be a FormData object
    const response = await axiosInstance.post(`${API_BASE}/create`, data);
    return response.data;
};

export const updateFooterEntry = async (id, payload) => {
    const params = new URLSearchParams();

    params.append("id", id);
    for (const [key, value] of payload.entries()) {
        params.append(key, value);
    }

    return await axiosInstance.put(`/footer-container/update?${params.toString()}`);
};

export const deleteFooterEntry = async (id) => {
    const params = new URLSearchParams({ id });
    const response = await axiosInstance.delete(`${API_BASE}/delete?${params.toString()}`);
    return response.data;
};