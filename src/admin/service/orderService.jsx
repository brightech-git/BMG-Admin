import axiosInstance from "../api/axiosInstance";

export const getAllOrders = (page, size) =>{
      try{
            console.log("Fetching all orders...", page, size);
            const res = axiosInstance.get("/order/all-ordersCount", {
                  params: { page, size },
            });
            console.log(res ,'orders');
            return res;
      }
      catch(err){
            console.error("Error fetching all orders:", err);
            throw err;
      }
}

      

      // 🔹 2. Update Order Status
export const updateStatus = (payload) =>{
      try{
            const res = axiosInstance.post("/order/update-status", payload);
            return res;
      }
      catch(err){
            console.error("Error updating order status:", err);
            throw err;
      }
}
          


            export const getOrdersByStatus =  (status, page, size, searchTerm) =>{
                  try{
                        const res = axiosInstance.get("/order/orders-by-status", {
                              params: { status, page, size, search: searchTerm },
                        });
                        return res;
                  }
                  catch(err){
                        console.error("Error fetching orders by status:", err);
                        throw err;
                  }
            }

export const getOrdersByDateRange = async (startDate, endDate )=> {
      try{
            const res =axiosInstance.get("/order/orders-by-date", {
                  params: { startDate, endDate },
            });
            return res;
      }
      catch(err){
            console.error("Error fetching orders by date range:", err);
            throw err;
      }
}
                 
export const getOrderStatus = async (orderId, trackingId) => {
      if (!orderId || !trackingId) {
            throw new Error("Order ID and Tracking ID are required");
      }

      const { data } = await axiosInstance.post(`/order/${orderId}/status`, {
            params: { orderId, trackingId },
      });

      return data; // return full response; filter in hook/page if needed
};

export const getAllOrderSummary = async() =>{
      try{
            const { data } = await axiosInstance.get('/order/status-summary');
            return data;
      }
     
      catch(err){
            console.error('Error fetching order summary:', err);
            throw new Error(`${err},Failed to fetch order summary`);
      }
}

export const trackOrderById = async (orderId) => {
      if (!orderId) throw new Error("Order ID is required");

      const { data } = await axiosInstance.get(`/order/trackingAdmin/${orderId}`);

      // We only need current_status and history
     return data;
};

export const OrderTracking  = async( trackingId) =>{

      console.log("Tracking ID:", trackingId);
      try{
            if (!trackingId) throw new Error("Tracking ID is required");
            const response = await axiosInstance.post('/dtdc/track',{
                  trkType : "cnno",
                  trackingId:trackingId,
                  addtnDtl: "Y"

            } );
            return response.data;
      }
      catch(err){
            console.error('Order tracking error:', err);
            throw err;
      }
     
}