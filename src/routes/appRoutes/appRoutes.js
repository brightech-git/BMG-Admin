import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AdminRoutes from '../adminRoute/AdminRoutes';
import AppAdminRoutes from '../adminRoute/AppAdminRoutes';
import './appRoutes.css';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
               

                {/* Admin panel routes (e.g., dashboard, manage products) */}

                <Route path="/admin/*" element={<AdminRoutes />} />
                <Route path="/*" element={<AdminRoutes />} />
                <Route path="/app/admin" element={<AppAdminRoutes />} />
                <Route path="/app/admin/*" element={<AppAdminRoutes />} />
                
            </Routes>
        </Router>
    );
};

export default AppRoutes;
