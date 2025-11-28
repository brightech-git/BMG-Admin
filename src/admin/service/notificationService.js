import axiosInstance from "../api/axiosInstance";

const pushNotification = async (data ) => {
    try {
        console.log(data, 'pushdata');
        const response = await axiosInstance.post(
            "/notifications/sendAll",
            data, // send JSON body
           
        );
        console.log(response.data , 'data');
        return response.data;
     
    } catch (error) {
        console.error("Push notification error:", error);
        throw error;
    }
};

export default pushNotification;
