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

        const authtoken = sessionStorage.getItem('auth_token'); // Moved inside so it's fresh
        const user = sessionStorage.getItem('user');

        console.log(JSON.parse(user),'userDetails');
      
        const userDetails = JSON.parse(user);


        if (authtoken) {
            config.headers.Authorization = `Bearer ${authtoken}`;
            config.headers['USERID'] = userDetails.id;

        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Handle unauthorized (redirect to login)
        }
        return Promise.reject(error);
    }
  );
export default axiosInstance;