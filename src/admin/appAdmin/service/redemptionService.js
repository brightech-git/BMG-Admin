import schemeAppAxios from "../../api/schemeAxios";

export const getAllRedemptions = async() =>{
    try {
        const response = await schemeAppAxios.get('/redemption');
        return response.data;
    }
    catch(err){
        throw err;
    }
}

export const updateRedemption = async(sno) =>{

    try{
        const response = await schemeAppAxios.put(`/redemption/check/${sno}`);
        return response.data;
    }
    catch(err){
        throw err;
    }
}