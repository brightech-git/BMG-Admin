import axiosInstance from "../api/axiosInstance";

export const getProducts = async (filters = {}) => {
  console.log("api Filters:", filters);
  const response = await axiosInstance.get("/product/items/filter",{
    params: filters
  });
  console.log("api response:", response.data);
  return response.data;
};
