import axiosInstance from "../api/axiosInstance";

export const getRefundOrdersByStatus = async (status, page, size, searchTerm) => {
    try {
        const response = await axiosInstance.get("/refunds/return-requests", {
            params: { status, page, size, search: searchTerm },
        });
        return response;
    }
    catch (error) {
        console.error("Error fetching refund orders:", error);
        throw error;
    }

}

//Approve the Refund Order 

export const approveRefundOrder = async (requestId) => {
    try {
        const response = await axiosInstance.put(`/refunds/approve/${requestId}`);
        return response.data;
    } catch (error) {
        console.error("Error approving refund order:", error);
        throw error;
    }
};


//Book Approved Orders 

export const bookApprovedOrders = async (requestId) => {
    try {
        const response = await axiosInstance.put(`/refunds/book-pickup/${requestId}`);
        return response.data;
    } catch (error) {
        console.error("Error approving refund order:", error);
        throw error;
    }
};


//Received Booked Orders 

export const receivedRefundOrders = async (requestId) => {
    try {
        const response = await axiosInstance.put(`/refunds/mark-received/${requestId}`);
        return response.data;
    } catch (error) {
        console.error("Error approving refund order:", error);
        throw error;
    }
};

//Rejected Refund Orders 

export const rejectedRefundOrders = async (requestId, reason) => {
    try {
        const response = await axiosInstance.put(`/refunds/reject/${requestId}`,{
            params:{reason:reason}
        });
        return response.data;
    } catch (error) {
        console.error("Error approving refund order:", error);
        throw error;
    }
};
//Completed Refund Orders 

export const completedRefundOrders = async (returnOrderId) => {
    try {
        const response = await axiosInstance.put(`/refund/${returnOrderId}`);
        return response.data;
    } catch (error) {
        console.error("Error approving refund order:", error);
        throw error;
    }
};

