import axiosInstance from "../api/axiosInstance";

export const getProducts = async (filters = {}) => {
  console.log("api Filters:", filters);
  const response = await axiosInstance.get("/product/items/filter",{
    params: filters
  });
  console.log("api response:", response.data);
  return response.data;
};

/* GET ALL FILTER SETTINGS */
export const getAllFilterSettings = async () => {
  try {
    const response = await axiosInstance.get("/filter/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching filter settings:", error);
    throw error;
  }
};


/* GET ACTIVE FILTER SETTINGS */
export const getActiveFilterSettings = async () => {
  try {
    const response = await axiosInstance.get("/filter/active");
    return response.data;
  } catch (error) {
    console.error("Error fetching active filter settings:", error);
    throw error;
  }
};


/* CREATE */
export const createFilterSetting = async (data) => {
  try {
    const response = await axiosInstance.post("/filter/create", data);
    return response.data;
  } catch (error) {
    console.error("Error creating filter setting:", error);
    throw error;
  }
};


/* UPDATE */
export const updateFilterSetting = async ({ id, data }) => {
  try {
    const response = await axiosInstance.put(`/filter/update/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating filter setting:", error);
    throw error;
  }
};


/* DELETE */
export const deleteFilterSetting = async (id) => {
  try {
    const response = await axiosInstance.delete(`/filter/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting filter setting:", error);
    throw error;
  }
};