import axiosInstance from "../api/axiosInstance";

export const getProducts = async (filters = {}) => {
  console.log("api Filters:", filters);
  const response = await axiosInstance.get("/product/items/filter",{
    params: filters
  });
  console.log("api response:", response.data);
  return response.data;
};

const BASE_URL = "/ecom/filters";

/* GET ALL FILTER SETTINGS */
export const getAllFilterContent = async ({filter}) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}`,{
      params:filter
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching filter settings:", error);
    throw error;
  }
};



/* CREATE */
export const createFilterContent = async (data) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating filter setting:", error);
    throw error;
  }
};


/* UPDATE */
export const updateFilterContent = async ({ id, data }) => {
  try {
    console.log(data,'payloadData')
    const response = await axiosInstance.put(`${BASE_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating filter setting:", error);
    throw error;
  }
};


/* DELETE */
export const deleteFilterContent = async (id) => {
  try {
    console.log(id,'deleteId')
    const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting filter setting:", error);
    throw error;
  }
};