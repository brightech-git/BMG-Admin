import schemeAppAxios from "../../api/schemeAxios";

export const getAllSchemes = async() =>{
    try{
        const response = await schemeAppAxios.get('/schemedesc/all');
        return response.data;
    }
    catch(error){
        console.log(error);
    }
}

export const getSchemeById = async(id) =>{
    try{
        const response = await schemeAppAxios.get(`/schemes/${id}`);
        return response.data;
    }
    catch(error){
        console.log(error);
    }
}

export const createScheme = async(data) =>{

    try{
        const response = await schemeAppAxios.post('/schemedesc/create', data);
        return response.data;
    }
    catch(error){
        console.log(error);
    }
}
export const updateScheme = async (formData) => {
  // ✅ Correct way to inspect FormData
  formData.forEach((value, key) => {
    console.log(key, value);
  });

  const response = await schemeAppAxios.put(
    "/schemedesc/update",
    formData // ✅ body
  );

  return response.data;
};


export const deleteScheme = async(id) =>{
    try{
        const response = await schemeAppAxios.delete(`/schemedesc/delete`,
            {params:id=id }
        );
        return response.data;
    }
    catch(error){
        console.log(error);
    }
}   