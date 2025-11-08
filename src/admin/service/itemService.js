import axiosInstance from "../api/axiosInstance";

export const itemService = {
    // Fetch item names or subitems if itemId is provided
    getItemNames: async (itemctrId = null) => {
        try {
            const response = await axiosInstance.get("product/finditemname", {
                params: itemctrId ? { itemctrId } : {},
            });
            return response.data;
        } catch (error) {
            console.error("❌ Failed to fetch item names:", error);
            throw error;
        }
    },
};
