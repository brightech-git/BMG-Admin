import axiosInstance from "../api/axiosInstance";

export const itemService = {
    // Fetch item names or subitems if itemId is provided
    getItemNames: async (itemId = null) => {
        try {
            const response = await axiosInstance.get("/product/finditemname", {
                params: itemId ? { itemId } : {},
            });
            return response.data;
        } catch (error) {
            console.error("❌ Failed to fetch item names:", error);
            throw error;
        }
    },
};
