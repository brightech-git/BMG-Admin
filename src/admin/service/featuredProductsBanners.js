import axiosInstance from "../api/axiosInstance";

const baseUrl = 'feature_product';

export const getPost = async () => {
    try {
        const response = await axiosInstance.get(`${baseUrl}/list`);
        if (response.status === 200) {
            return response.data;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    } catch (e) {
        console.error('Error fetching posts:', e);
        throw e; // Re-throw the error to let the caller handle it
    }
};

export const createPost = async (formData) => {
    try {
        const response = await axiosInstance.post(`${baseUrl}/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.status === 200) {
            return response.data;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    } catch (e) {
        console.error('Error creating post:', e);
        throw e; // Re-throw the error to let the caller handle it
    }
};

export const updatePost = async (formData) => {
    try {
        const response = await axiosInstance.put(`${baseUrl}/update`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.status === 200) {
            return response.data;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    } catch (e) {
        console.error('Error updating post:', e);
        throw e; // Re-throw the error to let the caller handle it
    }
};

export const deletePost = async (id) => {
    try {
        const response = await axiosInstance.delete(`${baseUrl}/delete`, {
            params: { id }, // Send id as query parameter
        });
        if (response.status === 200) {
            return response.data;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    } catch (e) {
        console.error('Error deleting post:', e);
        throw e; // Re-throw the error to let the caller handle it
    }
};