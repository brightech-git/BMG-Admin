import schemeAppAxios from "../../api/schemeAxios";

export const getAppNotificationsTemplates = async () => {
  try {
    const response = await schemeAppAxios.get("/notifications/templates");
    return response.data;
  } catch (error) {
    console.warn("Error fetching notifications templates:", error);
    throw error;
  }
};

export const sendAppNotification = async (id) => {
    try {
        const response = await schemeAppAxios.post(`/notifications/sendAll/${id}`);
        console.log(response.data ,'response ');
        return response.data;
    } catch (error) {
        console.warn("Error sending notification:", error);
        throw error;
    }
};

export const createAppNotificationTemplate = async(data) =>{

  for( const[key,value] of data.entries()){
    console.log(`${key}: ${value}` );
  }
   

    try {
      const response = await schemeAppAxios.post("/notifications/saveMessage", data);
        return  response.data;
    }
    catch (error) {
        console.warn("Error creating notification template:", error);
        throw error;
    }

} 