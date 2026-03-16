import axios from 'axios';

const schemeAppAxios = axios.create({
    baseURL: 'https://scheme.bmgjewellers.com/api/v1'
    //baseURL: 'http://localhost:8083/api/v1'
});

export default schemeAppAxios;
