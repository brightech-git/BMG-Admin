// src/services/dashboardService.js
import axiosInstance from "../api/axiosInstance";

export const getDashboardData = async () => {
    try {
        const  userCountRes = await axiosInstance.get(`/auth/user/count`)
        return userCountRes.data;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
};

// New API endpoints for enhanced dashboard features
export const getRevenueData = async () => {
    try {
        const response = await axiosInstance.get('/analytics/revenue');
        return response.data;
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        // Return dummy data if API fails
        return {
            totalRevenue: 12500000,
            monthlyGrowth: 12.5,
            todayRevenue: 450000,
            weeklyRevenue: 3200000,
            revenueBreakdown: {
                goldSales: 6500000,
                silverSales: 3200000,
                diamondSales: 1800000,
                platinumSales: 1000000
            }
        };
    }
};

export const getProductAnalytics = async () => {
    try {
        const response = await axiosInstance.get('/analytics/products');
        return response.data;
    } catch (error) {
        console.error('Error fetching product analytics:', error);
        // Return dummy data if API fails
        return {
            totalProducts: 1250,
            premiumProducts: 45,
            lowStockProducts: 12,
            outOfStockProducts: 3,
            categoryDistribution: {
                goldJewelry: 35,
                silverJewelry: 25,
                diamondSets: 20,
                platinumItems: 15,
                other: 5
            }
        };
    }
};

export const getUserAnalytics = async () => {
    try {
        const response = await axiosInstance.get('/analytics/users');
        return response.data;
    } catch (error) {
        console.error('Error fetching user analytics:', error);
        // Return dummy data if API fails
        return {
            totalUsers: 1250,
            newUsers: 45,
            activeUsers: 35,
            premiumUsers: 15,
            inactiveUsers: 5,
            userGrowth: 8.2
        };
    }
};

export const getOrderAnalytics = async () => {
    try {
        const response = await axiosInstance.get('/analytics/orders');
        return response.data;
    } catch (error) {
        console.error('Error fetching order analytics:', error);
        // Return dummy data if API fails
        return {
            totalOrders: 850,
            pendingOrders: 45,
            deliveredOrders: 650,
            shippedOrders: 120,
            cancelledOrders: 35,
            averageOrderValue: 8500,
            conversionRate: 15.3
        };
    }


    
};
