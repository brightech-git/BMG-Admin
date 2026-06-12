import React, { useContext, useEffect ,useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MyContext } from '../../admin/context/themeContext/themeContext';
import { useAuth } from '../../admin/context/auth/authContext';
import ProtectedRoute from '../adminProtectedRoute/ProtectedRoute';
import LoginPage from '../../admin/pages/login/loginPage';
import Sidebar from '../../admin/components/slide/Sidebar';
import MainContent from '../../admin/components/mainContent/mainContent';
import EmployeeProfile from '../../admin/pages/employeeprofile/EmployeeProfilePage';
import ManageProduct from '../../admin/pages/product/manage/manageProducts';
import AddVideos from '../../admin/pages/video/add/addVideo';
import ManageVideos from '../../admin/pages/video/manage/ManageVideos';
import AddRates from '../../admin/pages/rate/add/addRates';
import ManageRates from '../../admin/pages/rate/manage/manageRates';

import ManageUserMaster from '../../admin/pages/UserMaster/UserMaster';
import UserDetails from '../../admin/pages/dashboard/userDetails';
import NewAdminHeader from '../../admin/components/head/header';


import AddBanner from '../../admin/pages/banner/add/AddBanners';
import AddCategoryPage from '../../admin/pages/category/add/AddHeader';
import ManageCategoriesPage from '../../admin/pages/category/manage/ManageCategoriesPage';
import AddOccasionBanner from '../../admin/pages/banner/add/AddOccasionBanner';
import AddOfferBanner from '../../admin/pages/banner/add/AddOfferBanner';
import AddCategoryBanner from '../../admin/pages/banner/add/AddCategoryBanner';
import AddBugetBanner from '../../admin/pages/banner/add/AddBanners';
import AddFestivalBanner from '../../admin/pages/banner/add/addFestivalBanner';
import AddBreadCrumbBanner from '../../admin/pages/banner/add/AddBreadCrumbsBanner';

import ManageBanners from '../../admin/pages/banner/manage/ManageBanners';
import ManageOccasionBanner from '../../admin/pages/banner/manage/manageOccasionBanner';
import ManageOfferBanner from '../../admin/pages/banner/manage/manageOfferBanner';
import ManageFestivalBanner from '../../admin/pages/banner/manage/manageFestivalBanner';
import ManageBudgetBanner from '../../admin/pages/banner/manage/ManageBanners';
import ManageCategoryBanner from '../../admin/pages/banner/manage/manageCategoryBanner';
import ManageBreadCrumbBanner from '../../admin/pages/banner/manage/manageBreadCrumbBanner';
import ManageAddress from '../../admin/pages/address/manageAddress';

import ManageSingleProduct from '../../admin/pages/product/manage/ManageSingleProduct';

import GlobalSnackbar from '../../admin/components/snackBar/GlobalSnackbar';
import ItemCategory from '../../admin/pages/category/add/AdditemCategory';
import ManageItemCategory from '../../admin/pages/category/manage/manageItemCategory';
import UploadBestDesign from '../../admin/pages/banner/add/UploadBestDesign';
import ManageBestDesignBanner from '../../admin/pages/banner/manage/ManageBestDesignBanner';
import UploadFeatureDesign from '../../admin/pages/banner/add/AddFeatureBanner';
import ManageFeaturedBanner from '../../admin/pages/banner/manage/ManageFeaturedBanner';
import UploadLatestBanner from '../../admin/pages/banner/add/AddLatestCollectionBanner';
import ManageLatestBanner from '../../admin/pages/banner/manage/ManageLatestBanner';
import AddGenderBanner from '../../admin/pages/banner/add/AddGenderBanner';
import ManageGenderBanner from '../../admin/pages/banner/manage/ManageGenderBanner';
import AddImage from '../../admin/pages/product/add/addImageProduct';


import NotificationTemplatePage from '../../admin/pages/notification/NotificationTemplatePage';
import FooterCategory from '../../admin/pages/category/manage/ManageFooterCategory';
import AddFooterEntryPage from '../../admin/pages/category/add/AddFooterCategory';



import RefundOrdersManagement from '../../admin/pages/order/RefundOrders';
import AllOrders from '../../admin/pages/order/AllOrders';
import TrackOrder from '../../admin/pages/order/TrackOrder';
import AllOrdersByStatus from '../../admin/pages/order/AllOrdersByStatus';
import OrdersByRange from '../../admin/pages/order/todayOrders';

/*-------------------------SETTINGS----------------------------*/
import AddBannerSetting from '../../admin/pages/settings/banner/AddBannerSetting';
import AddFilterSetting from '../../admin/pages/settings/filter/AddFilterSettings';

import ManageBannerSettings from '../../admin/pages/settings/banner/ManageBannerSettings';


import './AdminRoutes.css';
import ManageFilters from '../../admin/pages/settings/filter/ManageFilterSettings';
import ManageFilterSettings from '../../admin/pages/settings/filter/ManageFilterSettings';

import AddFilterContent from '../../admin/pages/filter/AddFilter';
import ManageFilterContent from '../../admin/pages/filter/ManageFilter';

import AddHeaderNav from '../../admin/pages/settings/headerNav/AddHeaderNavKey';
import ManageHeaderNavKey from '../../admin/pages/settings/headerNav/ManageHeaderKey';
import ManageRoleMaster from '../../admin/pages/RoleMaster/RoleMaster';
import RoleMapping from '../../admin/pages/RoleMapping/RoleMapping';
import RoleTransactionPage from '../../admin/pages/RolePermission/RolePermission';
import RoleTransaction from '../../admin/pages/RoleTransaction/RoleTransaction';


const AdminRoutes = () => {
    const { isSidebarOpen, setIsSidebarOpen, themeMode } = useContext(MyContext);
    const { authToken } = useAuth();
    const allowedRoles = ['ROLE_ADMIN', 'ROLE_EMPLOYEE'];

    const [isMobile, setIsMobile] = useState(false);

       useEffect(() => {
            const checkScreenSize = () => {
                // Otherwise use actual screen size
                const width = window.innerWidth;
                setIsMobile(width < 768);
            };
    
            checkScreenSize();
          
       }, [isMobile]);


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
        <div className=''>
            <GlobalSnackbar /> {/* only once in layout */}
            <NewAdminHeader
                toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
                isSidebarOpen={isSidebarOpen}
            />
            <div>
                <Sidebar
                    isOpen={isSidebarOpen}
                    toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
                />
                <main className={`${isMobile ? '': 'ml-[65px]'} mt-[50px] p-2`} >
                    {/* <main className={`${isSidebarOpen ? 'ml-[60px]' : 'ml-[60px]'} mt-[45px] p-2`}> */}
               

                        <Routes>
                            <Route path="/" element={<ProtectedRoute allowedRoles={allowedRoles}><MainContent /></ProtectedRoute>} />

                            {/*---------------------------PRODUCT MANAGEMENT------------------------*/}

                            <Route path="product/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddImage /></ProtectedRoute>} />
                            <Route path="product/manage/single" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageSingleProduct /></ProtectedRoute>} />
                            <Route path="product/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageProduct /></ProtectedRoute>} />


                            {/*---------------------------ADDRESS MANAGEMENT------------------------*/}

                            <Route path="address/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageAddress /></ProtectedRoute>} />

                            {/*---------------------------ADD BANNER MANAGEMENT------------------------*/}

                           

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
                            <Route path="header/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddCategoryPage /></ProtectedRoute>} />
                            <Route path="item-category/add" element={<ItemCategory />} />
                            <Route path='category/footer/add' element={<AddFooterEntryPage />} />


                            {/*---------------------------BANNER MANAGEMENT------------------------*/}


                            <Route path="genderbanner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageGenderBanner /></ProtectedRoute>} />
                            <Route path="manage/featurebanner" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageFeaturedBanner /></ProtectedRoute>} />
                            <Route path="latestbanner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}> <ManageLatestBanner /> </ProtectedRoute>} />
                            <Route path="bestbanner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageBestDesignBanner /></ProtectedRoute>} />
                            <Route path="banner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageBanners /></ProtectedRoute>} />
                            <Route path="occasionbanner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageOccasionBanner /></ProtectedRoute>} />
                            <Route path="offerbanner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageOfferBanner /></ProtectedRoute>} />
                            <Route path="festivalbanner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageFestivalBanner /></ProtectedRoute>} />
                            {/* <Route path="banner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageBanners /></ProtectedRoute>} /> */}
                            <Route path="categorybanner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageCategoryBanner /></ProtectedRoute>} />
                            <Route path="breadcrumbbanner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageBreadCrumbBanner /></ProtectedRoute>} />
                            <Route path="header/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageCategoriesPage /></ProtectedRoute>} />
                            <Route path="item-category/manage" element={< ManageItemCategory />} />
                            <Route path='category/footer/manage' element={<FooterCategory />} />

                            {/*---------------------------VIDEO MANAGEMENT------------------------*/}

                            <Route path="video/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddVideos /></ProtectedRoute>} />
                            <Route path="video/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageVideos /></ProtectedRoute>} />


                            {/*---------------------------RATE MANAGEMENT------------------------*/}

                            <Route path="rates/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddRates /></ProtectedRoute>} />
                            <Route path="rates/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageRates /></ProtectedRoute>} />

                            {/*---------------------------EMPLOYEE MANAGEMENT------------------------*/}

                            {/* <Route path="employee/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddEmployee /></ProtectedRoute>} />
                            <Route path="employee/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageEmployees /></ProtectedRoute>} /> */}

                            <Route path="master/user" element={<ManageUserMaster/>} />    
                            <Route path="master/role" element={<ManageRoleMaster/>} />    
                            <Route path="role/mapping" element={<RoleMapping />} />    
                            <Route path="role/permission" element={<RoleTransactionPage />} />
                            <Route path="role/transaction" element={<RoleTransaction />} />

                            {/*---------------------------BANNER MANAGEMENT------------------------*/}

                            <Route path="profile" element={<ProtectedRoute allowedRoles={allowedRoles}><EmployeeProfile /></ProtectedRoute>} />

                            {/*---------------------------NOTIFICATION MANAGEMENT------------------------*/}

                            <Route path="/notification" element={<ProtectedRoute allowedRoles={allowedRoles}><NotificationTemplatePage /></ProtectedRoute>} />


                            {/*---------------------------USER'S DETAIL------------------------*/}

                            <Route path="userDetails" element={<UserDetails />} />

                         

                            {/*---------------------------ORDERS TABLE------------------------*/}

                            <Route path="order/today" element={<OrdersByRange />} />
                            <Route path="AllOrderPage" element={<AllOrders />} />
                            <Route path='order/status/:orderStatus' element={<AllOrdersByStatus />} />
                            <Route path='order/refund/status/:orderStatus' element={<RefundOrdersManagement />} />
                            <Route path='track/order/:orderId' element={<TrackOrder />} />

                            {/*---------------------------SETTINGS------------------------*/}


                        {/*---------------------------MANAGE HEADER KEY SETTINGS------------------------*/}

                            <Route path='header/setting/add' element = {<ProtectedRoute allowedRoles={allowedRoles}> <AddHeaderNav /> </ProtectedRoute>} />
                            <Route path='header/setting/manage' element = {<ProtectedRoute allowedRoles={allowedRoles}> <ManageHeaderNavKey /> </ProtectedRoute>} />

                            <Route path="banner/setting/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddBannerSetting /></ProtectedRoute>} />
                            <Route path="filter/setting/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddFilterSetting /></ProtectedRoute>} />


                            {/*---------------------------MANAGE SETTINGS------------------------*/}

                            <Route path="banner/setting/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageBannerSettings /></ProtectedRoute>} />
                            <Route path="filter/setting/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageFilterSettings /></ProtectedRoute>} />


                            {/*---------------------------FILTERS------------------------*/}
                            <Route path="filter/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddFilterContent /></ProtectedRoute>} />
                            <Route path="filter/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageFilterContent /></ProtectedRoute>} />

                            <Route path="*" element={<Navigate to="/admin" replace />} />



                        </Routes>
                 
                </main>
            </div>
        </div>
    );
};

export default AdminRoutes;