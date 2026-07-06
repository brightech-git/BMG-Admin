// src/api/axiosInstance.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL ;

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 500000,
});

// ✅ Dynamically attach token from localStorage on every request
axiosInstance.interceptors.request.use(
    (config) => {
        const authToken = sessionStorage.getItem('auth_token');

        let userDetails = null;
        try {
            userDetails = JSON.parse(sessionStorage.getItem('user'));
        } catch {
            userDetails = null;
        }

        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }

        if (userDetails?.id) {
            config.headers['USERID'] = userDetails.id;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Handle unauthorized (redirect to login)
        }
        return Promise.reject(error);
    }
  );
export default axiosInstance;