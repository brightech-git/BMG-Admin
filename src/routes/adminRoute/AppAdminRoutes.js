import React, { useContext, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MyContext } from '../../admin/context/themeContext/themeContext';
import { useAuth } from '../../admin/context/auth/authContext';
import LoginPage from '../../admin/pages/login/loginPage';
import NewAdminHeader from '../../admin/components/head/header';
import AppSidebar from '../../admin/components/slide/AppSideBar';
import DashboardPage from '../../admin/appAdmin/pages/Dashboard';
import SchemeSliderTable from '../../admin/appAdmin/pages/banner/manageSliderBanner';
import AddAppSliderBanner from '../../admin/appAdmin/pages/banner/AddSliderBanner';
import AddSchemeBanner from '../../admin/appAdmin/pages/banner/AddSchemeBanner';
import SchemeBannerTable from '../../admin/appAdmin/pages/banner/manageSchemeBanner';
import ManageOnBoard from '../../admin/appAdmin/pages/banner/ManageOnBoard';
import UpdateOnBoard from '../../admin/appAdmin/pages/banner/UpdateOnBoard';
import TemplateNotifications from '../../admin/appAdmin/pages/notification/ManageNotification';
import ManageScheme from '../../admin/appAdmin/pages/schemeBanner/manageScheme';
import AddSchemeDetails from '../../admin/appAdmin/pages/schemeBanner/AddScheme';
import Redemption from '../../admin/appAdmin/pages/redemption/RedemptionPage';
import ManageUsers from '../../admin/appAdmin/pages/users/manageUsers';
import EntrolledUsers from '../../admin/appAdmin/pages/scheme/EntrolledUsers';

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
   
            <NewAdminHeader
                toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
                isSidebarOpen={isSidebarOpen}
            />
            <div className="layout-body">
                <AppSidebar
                    isOpen={isSidebarOpen}
                    toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
                />
                <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                    <Routes>
                        <Route path='*' element={<DashboardPage />} />
                        <Route path='dashboard' element={<DashboardPage />} />
                        <Route path='sliderbanner/manage' element={<SchemeSliderTable />} />
                        <Route path='sliderbanner/add' element={<AddAppSliderBanner />} />
                        <Route path='schemeBanner/manage' element={<SchemeBannerTable />} />
                        <Route path='schemeBanner/add' element={<AddSchemeBanner />} />
                        <Route path='onBoard/manage' element={<ManageOnBoard />} />
                        <Route path='onBoard/add' element={<UpdateOnBoard />} />
                        <Route path='notification/manage' element={<TemplateNotifications />} />
                        <Route path='scheme/manage' element={<ManageScheme />} />
                        <Route path='scheme/add' element={<AddSchemeDetails />} />
                        <Route path='redemption/centre' element={<Redemption />} />
                        <Route path='scheme/users' element={<ManageUsers />} />
                        <Route path='enrolledUsers/manage' element={<EntrolledUsers />} />

                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AdminRoutes;