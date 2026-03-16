// src/api/adminInstance.js
import axios from 'axios';

const BASE_URL ='https://scheme.bmgjewellers.com/api/v1';



const adminInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 500000,
});

// ✅ Dynamically attach token from localStorage on every request
adminInstance.interceptors.request.use(
    (config) => {

        const authtoken = sessionStorage.getItem('auth_token'); // Moved inside so it's fresh
        if (authtoken) {
            config.headers.Authorization = `Bearer ${authtoken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

adminInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            
        }
        return Promise.reject(error);
    }
);
export default adminInstance;