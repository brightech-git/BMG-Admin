import axiosInstance from "../api/axiosInstance";

const pushNotification = async (data) => {
    try {
        const response = await axiosInstance.post(
            "/notifications/sendAll",
            data, // send JSON body
           
        );

        return response.data;
    } catch (error) {
        console.error("Push notification error:", error);
        throw error;
    }
};

export default pushNotification;
