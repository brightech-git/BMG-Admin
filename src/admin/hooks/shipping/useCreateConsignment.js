// src/hooks/useCreateConsignment.js
import { useMutation } from "@tanstack/react-query";
import { createConsignment } from "../../service/consignmentService";

/**
 * React Query hook to handle consignment creation
 */

export const useCreateConsignment = () => {
    return useMutation({
        mutationFn: createConsignment,
        onSuccess: (data) => {
            console.log("✅ Consignment created successfully:", data);
        },
        onError: (error) => {
            console.error("❌ Error creating consignment:", error.message);
        },
    });
};
