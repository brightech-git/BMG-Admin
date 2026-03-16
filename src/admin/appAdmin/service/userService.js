import axios from "axios";
import schemeAppAxios from "../../api/schemeAxios";
const Base_URL = 'https://scheme.bmgjewellers.com/v1/api';
export const getAllUsers = async() =>{
    try {
        const response = await schemeAppAxios.get('/users');
        return response.data;
    }
    catch(err){
        throw err;
    }
};

export const getAllUsersFilter = async(param) =>{
    try {
        const response = await axios.get(`${Base_URL}/account/scheme-user-details`,{params:param});
        return response.data;
    }
    catch(err){
        throw err;
    }
};


 /*--------------Members Enrolled ----------------*/

export const getAllMemberEnrolled= async () => {
    try {
        const response = await schemeAppAxios.get('/users/matched');
        return response.data;
    }
    catch (err) {
        throw err;
    }
};