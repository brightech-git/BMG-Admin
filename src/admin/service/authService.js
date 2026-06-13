// src/service/authService.js
import axiosInstance from '../api/axiosInstance';

// ✅ Login user (Admin or Employee)
export const loginUser = async (credentials) => {
    const response = await axiosInstance.post(`/employee/login`, credentials);

    console.log('response.data',response.data)
    const { path , userDetails} = response.data.data;

    sessionStorage.setItem('auth_token', userDetails.token);

    return { path , user: userDetails};
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

