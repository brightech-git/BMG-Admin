// src/service/authService.js
import axiosInstance from '../api/axiosInstance';

// ✅ Login user (Admin or Employee)
export const loginUser = async (credentials) => {
    const response = await axiosInstance.post(`/auth/user/login`, credentials);
    const { token, id, email, username, roles } = response.data;

    sessionStorage.setItem('auth_token', token);

    return { token, user: { id, email, username, roles } };
};

// ✅ Fetch user profile using token
export const fetchUserProfile = async () => {
    const response = await axiosInstance.get(`/user/profile`);
    return response.data;
};

// ✅ Logout helper
export const logoutUser = () => {
    sessionStorage.removeItem('auth_token');
};

