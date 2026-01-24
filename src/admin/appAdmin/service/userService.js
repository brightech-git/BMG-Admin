import schemeAppAxios from "../../api/schemeAxios";

export const getAllUsers = async() =>{
    try {
        const response = await schemeAppAxios.get('/users');
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