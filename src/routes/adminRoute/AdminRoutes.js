import React, { useContext, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MyContext } from '../../admin/context/themeContext/themeContext';
import { useAuth } from '../../admin/context/auth/authContext';
import ProtectedRoute from '../adminProtectedRoute/ProtectedRoute';
import LoginPage from '../../admin/pages/login/loginPage';
import Sidebar from '../../admin/components/slide/Sidebar';
import MainContent from '../../admin/components/mainContent/mainContent';
import EmployeeProfile from '../../admin/pages/employeeprofile/EmployeeProfilePage';
import AddProduct from '../../admin/pages/product/add/addProduct';
import ManageProduct from '../../admin/pages/product/manage/manageProducts';
import AddBanner from '../../admin/pages/banner/add/addBanner';
import ManageBanner from '../../admin/pages/banner/manage/manageBanners';
import AddVideos from '../../admin/pages/video/add/addVideo';
import ManageVideos from '../../admin/pages/video/manage/ManageVideos';
import AddRates from '../../admin/pages/rate/add/addRates';
import ManageRates from '../../admin/pages/rate/manage/manageRates';
import AddEmployee from '../../admin/pages/employee/add/AddEmployee';
import ManageEmployees from '../../admin/pages/employee/manage/ManageEmployees';
import Unauthorized from '../../admin/pages/unauthorized/Unauthorized';
import UserDetails from '../../admin/pages/dashboard/userDetails';
import NewAdminHeader from '../../admin/components/head/header';
import OrderStatusManagement from '../../admin/pages/order/orderStatus';
import PendingOrders from '../../admin/pages/order/pendingOrders';
import CancelledOrder from '../../admin/pages/order/CancelledOrder';
import PrepareOrder from '../../admin/pages/order/prepareOrder';
import ShippedStatus from '../../admin/pages/order/Shipped';
import QualityChecking from '../../admin/pages/order/QCStatus';
import PackedStatus from '../../admin/pages/order/PackedStatus';
import { PendingOrdersPage, ShippedOrdersPage, DeliveredOrdersPage, CancelledOrdersPage, TotalRevenuePage, TodayRevenuePage, MonthlySalesPage } from '../../admin/pages/order/OrderPages';
import EstimationProductsPage from '../../admin/pages/product/manage/EstimationProductsPage';
import OrderHistoryPage from '../../admin/pages/order/todayOrders';
import AddCategoryPage from '../../admin/pages/category/add/AddCategoryPage';
import ManageCategoriesPage from '../../admin/pages/category/manage/ManageCategoriesPage';
import AddOccasionBanner from '../../admin/pages/banner/add/AddOccasionBanner';
import AddOfferBanner from '../../admin/pages/banner/add/AddOfferBanner';
import AddCategoryBanner from '../../admin/pages/banner/add/AddCategoryBanner';
import AddBugetBanner from '../../admin/pages/banner/add/AddBudgetBanner';
import AddFestivalBanner from '../../admin/pages/banner/add/addFestivalBanner';
import AddBreadCrumbBanner from '../../admin/pages/banner/add/AddBreadCrumbsBanner';
import ManageOccasionBanner from '../../admin/pages/banner/manage/manageOccasionBanner';
import ManageOfferBanner from '../../admin/pages/banner/manage/manageOfferBanner';
import ManageFestivalBanner from '../../admin/pages/banner/manage/manageFestivalBanner';
import ManageBudgetBanner from '../../admin/pages/banner/manage/manageBudgetBanner';
import ManageCategoryBanner from '../../admin/pages/banner/manage/manageCategoryBanner';
import ManageBreadCrumbBanner from '../../admin/pages/banner/manage/manageBreadCrumbBanner';
import NotificationForm from '../../admin/pages/notification/PushNotification';
import ManageAddress from '../../admin/pages/address/manageAddress';
import './AdminRoutes.css';
import ShippedOrders from '../../admin/pages/order/shippedOrders';
import DeliveredOrders from '../../admin/pages/order/DeliveredOrders';
import TransitOrders from '../../admin/pages/order/TransitOrders';
import RefundedOrders from '../../admin/pages/order/RefundedOrders';
import ReturnedOrders from '../../admin/pages/order/ReturnedOrders';
import ManageSingleProduct from '../../admin/pages/product/manage/ManageSingleProduct';

import PackingOrders from '../../admin/pages/order/PackingOrders';
import GlobalSnackbar from '../../admin/components/snackBar/GlobalSnackbar';
import EcomMarketingAttributesTable from '../../admin/pages/market-option/EcomMarketingAttributesTable';
import ItemCategory from '../../admin/pages/itemcategory/add/AdditemCategory';
import ManageItemCategory from '../../admin/pages/itemcategory/manage/manageItemCategory';
import UploadBestDesign from '../../admin/pages/banner/add/UploadBestDesign';
import ManageBestDesignBanner from '../../admin/pages/banner/manage/ManageBestDesignBanner';
import UploadFeatureDesign from '../../admin/pages/banner/add/AddFeatureBanner';
import ManageFeaturedBanner from '../../admin/pages/banner/manage/ManageFeaturedBanner';
import UploadLatestBanner from '../../admin/pages/banner/add/AddLatestCollectionBanner';
import ManageLatestBanner from '../../admin/pages/banner/manage/ManageLatestBanner';
import AddGenderBanner from '../../admin/pages/banner/add/AddGenderBanner';
import ManageGenderBanner from '../../admin/pages/banner/manage/ManageGenderBanner';
import AddImage from '../../admin/pages/product/add/addImageProduct';

import OrderTable from '../../admin/pages/order/AllOrders';


const AdminRoutes = () => {
    const { isSidebarOpen, setIsSidebarOpen, themeMode } = useContext(MyContext);
    const { authToken } = useAuth();
    const allowedRoles = ['ROLE_ADMIN', 'ROLE_EMPLOYEE'];


    useEffect(() => {
        document.body.classList.remove('dark', 'light');
        document.body.classList.add(themeMode);
    }, [themeMode]);

    if (!authToken) {
        return (
            <Routes>
                <Route path="login" element={<LoginPage />} />
                <Route path="*" element={<Navigate to="/admin/login" replace />} />
            </Routes>
        );
    }

    return (
        <div className={`app-layout ${themeMode}`}>
            <GlobalSnackbar /> {/* only once in layout */}
            <NewAdminHeader
                toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
                isSidebarOpen={isSidebarOpen}
            />
            <div className="layout-body">
                <Sidebar
                    isOpen={isSidebarOpen}
                    toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
                />
                <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                    <Routes>
                        <Route path="/" element={<ProtectedRoute allowedRoles={allowedRoles}><MainContent /></ProtectedRoute>} />
                        <Route path="product/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddImage /></ProtectedRoute>} />
                        {/* <Route path="product/manage/:tagKey" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageProduct /></ProtectedRoute>} /> */}
                        <Route path="product/manage/single" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageSingleProduct /></ProtectedRoute>} />

                        <Route path="product/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageProduct /></ProtectedRoute>} />
                        <Route path="address/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageAddress /></ProtectedRoute>} />
                        <Route path="breadcrumbbanner/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddBreadCrumbBanner /></ProtectedRoute>} />
                        <Route path="festivalbanner/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddFestivalBanner /></ProtectedRoute>} />
                        <Route path="categorybanner/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddCategoryBanner /></ProtectedRoute>} />
                        <Route path="budgetbanner/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddBugetBanner /></ProtectedRoute>} />
                        <Route path="occasionbanner/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddOccasionBanner /></ProtectedRoute>} />
                        <Route path="offerbanner/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddOfferBanner /></ProtectedRoute>} />
                        <Route path="banner/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddBanner /></ProtectedRoute>} />
                        <Route path="bestbanner/add" element={<ProtectedRoute allowedRoles={allowedRoles}><UploadBestDesign /></ProtectedRoute>} />
                        <Route path="featurebanner/add" element={<ProtectedRoute allowedRoles={allowedRoles}><UploadFeatureDesign /></ProtectedRoute>} />
                        <Route path="latestbanner/add" element={<ProtectedRoute allowedRoles={allowedRoles}><UploadLatestBanner /></ProtectedRoute>} />
                        <Route path="genderbanner/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddGenderBanner /></ProtectedRoute>} />
                       

                        


                        <Route path="genderbanner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageGenderBanner /></ProtectedRoute>} />
                        <Route path="latestbanner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageLatestBanner /></ProtectedRoute>} />
                        <Route path="featurebanner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageFeaturedBanner /></ProtectedRoute>} />
                        <Route path="bestbanner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageBestDesignBanner /></ProtectedRoute>} />
                        <Route path="banner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageBanner /></ProtectedRoute>} />
                        <Route path="occasionbanner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageOccasionBanner /></ProtectedRoute>} />
                        <Route path="offerbanner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageOfferBanner /></ProtectedRoute>} />
                        <Route path="festivalbanner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageFestivalBanner /></ProtectedRoute>} />
                        <Route path="budgetbanner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageBudgetBanner /></ProtectedRoute>} />
                        <Route path="categorybanner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageCategoryBanner /></ProtectedRoute>} />
                        <Route path="breadcrumbbanner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageBreadCrumbBanner /></ProtectedRoute>} />
                        <Route path="category/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddCategoryPage /></ProtectedRoute>} />
                        <Route path="header/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageCategoriesPage /></ProtectedRoute>} />
                        <Route path="video/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddVideos /></ProtectedRoute>} />
                        <Route path="video/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageVideos /></ProtectedRoute>} />
                        <Route path="rates/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddRates /></ProtectedRoute>} />
                        <Route path="rates/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageRates /></ProtectedRoute>} />
                        <Route path="employee/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddEmployee /></ProtectedRoute>} />
                        <Route path="employee/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageEmployees /></ProtectedRoute>} />
                        <Route path="profile" element={<ProtectedRoute allowedRoles={allowedRoles}><EmployeeProfile /></ProtectedRoute>} />
                        <Route path="/notification" element={<ProtectedRoute allowedRoles={allowedRoles}><NotificationForm /></ProtectedRoute>} />

                        <Route path="userDetails" element={<UserDetails />} />
                        <Route path="order/today" element={<OrderHistoryPage />} />
                        {/* <Route path="order/status" element={<OrderStatusManagement />} /> */}
                        <Route path="order/status/prepare" element={<PrepareOrder />} />
                        <Route path='order/status' element={<OrderTable />} />
                        <Route path='order/status/packing' element={<PackingOrders />} />
                        <Route path="order/status/in-transit" element={<TransitOrders />} />
                        <Route path="order/status/refunded" element={<RefundedOrders />} />
                        <Route path="order/status/returned" element={<ReturnedOrders />} />
                        <Route path="order/status/delivered" element={<DeliveredOrders />} />
                        <Route path="order/status/shipping" element={<ShippedOrders />} />
                        <Route path="order/status/cancelled" element={<CancelledOrder />} />
                        <Route path="order/status/pending" element={<PendingOrders />} />
                        <Route path="order/status/qc" element={<QualityChecking />} />
                        <Route path="order/status/packed" element={<PackedStatus />} />
                        <Route path="order/status/shipped" element={<ShippedStatus />} />
                        <Route path="AllOrderPage" element={<OrderStatusManagement />} />
                        <Route path="pendingOrders" element={<PendingOrdersPage />} />
                        <Route path="deliveredOrders" element={<DeliveredOrdersPage />} />
                        <Route path="shippedOrders" element={<ShippedOrdersPage />} />
                        <Route path="cancelledOrders" element={<CancelledOrdersPage />} />
                        <Route path="totalRevenue" element={<TotalRevenuePage />} />
                        <Route path="todayRevenue" element={<TodayRevenuePage />} />
                        <Route path="monthlySales" element={<MonthlySalesPage />} />
                        <Route path="unauthorized" element={<Unauthorized />} />
                        <Route path="item-category/add" element={<ItemCategory />} />
                        <Route path="item-category/manage" element={< ManageItemCategory/>} />


                        <Route path='productSpec' element={<EcomMarketingAttributesTable />} />
                        <Route path="*" element={<Navigate to="/admin" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AdminRoutes;