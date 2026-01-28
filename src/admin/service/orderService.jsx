import axiosInstance from "../api/axiosInstance";

export const orderService = {
      // 🔹 1. Get All Orders (Paginated)
      getAllOrders: (page, size) =>
            axiosInstance.get("/order/all-ordersCount", {
                  params: { page, size },
            }),

      // 🔹 2. Update Order Status
      updateStatus: (payload) =>
            axiosInstance.post("/order/update-status", payload),

      // 🔹 3. Track Order by ID
      trackOrder: (orderId) =>
            axiosInstance.get("/order/track-order", {
                  params: { orderId },
            }),

      // 🔹 4. Verify Payment
      verifyPayment: (orderId) =>
            axiosInstance.get("/payment/verify-payment", {
                  params: { orderId },
            }),

      // 🔹 5. Get Paginated Pending Orders
      getPaginatedPendingOrders: (page, size) =>
            axiosInstance.get("/order/pending-orders", {
                  params: { page, size },
            }),

      // 🔹 6. Get Paginated Delivered Orders
      getPaginatedDeliveredOrders: (page, size) =>
            axiosInstance.get("/order/delivered-orders", {
                  params: { page, size },
            }),

      // 🔹 7. Get Paginated Cancelled Orders
      getPaginatedCancelledOrders: (page, size) =>
            axiosInstance.get("/order/cancelled-orders", {
                  params: { page, size },
            }),

      // 🔹 8. Get Paginated Shipped Orders
      getPaginatedShippedOrders: (page, size) =>
            axiosInstance.get("/order/shipped-orders", {
                  params: { page, size },
            }),

      // 🔹 9. Get Total Revenue
      getTotalRevenue: () =>
            axiosInstance.get("/order/total-revenue"),

      // 🔹 10. Get Today's Revenue
      getTodayRevenue: () =>
            axiosInstance.get("/order/today-revenue"),

      // 🔹 11. Get Monthly Sales Report
      getMonthlySalesReport: () =>
            axiosInstance.get("/order/monthly-sales"),

      // 🔹 12. Get Orders by Date Range
      getOrdersByDateRange: (startDate, endDate) =>
            
            axiosInstance.get("/order/orders-by-date", {
                  params: { startDate, endDate },
            }),
      getOrdersByStatus: (status, page, size) =>
            axiosInstance.get("/order/orders-by-status", {
                  params: { status, page, size },
            }),
            
};

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