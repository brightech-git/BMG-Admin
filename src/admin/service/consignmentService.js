// src/service/consignmentService.js
import axiosInstance from "../api/axiosInstance";

/**
 * Create a new consignment
 * @param {Object} consignmentData - The consignment request payload
 * @returns {Promise<Object>} - API response
 */
export const createConsignment = async (consignmentData) => {
    try {
        const response = await axiosInstance.post(
            "/dtdc/create-consignment",
            consignmentData
        );
        return response.data;
    } catch (error) {
        // Normalize error response
        if (error.response) {
            throw new Error(
                error.response.data?.message || "Failed to create consignment"
            );
        }
        throw new Error(error.message || "Network error");
    }
};


export const getLabelList = async (payload) => {
    try {
        const response = await axiosInstance.get("/dtdc/shipping-label", {
            params: payload,
            responseType: "blob", // 👈 important to get binary PDF
        });

        // Create a URL from the blob
        const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
        return fileURL;
    } catch (error) {
        if (error.response) {
            throw new Error(
                error.response.data?.message || "Failed to get label"
            );
        }
        throw new Error(error.message || "Network error");
    }
};
