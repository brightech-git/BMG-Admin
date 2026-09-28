import axiosInstance from "../api/axiosInstance";

export async function comboService(payload){

    console.log("combo payload", payload)
    const res = await axiosInstance.post("/combos",payload)
    return res;

}

export async function updateCombo({id,payload}){
    try{
        const res = await axiosInstance.put(`/combo/${id}` , payload)
    }
    catch(err){

    }
}


export async function allComboProducts(){
    try{
        const response = await axiosInstance.get("/combos");
        console.log(response , "combo")
        return response.data;
    }
    catch(err){
            console.log(err);
            throw new Error(err);

    }
}