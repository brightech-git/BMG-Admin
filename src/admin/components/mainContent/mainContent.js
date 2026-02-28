import React, { useContext } from 'react';
import DashboardCards from '../cards/DashboardCards';
import LatestOrders from '../cards/LatestOrders';
import { MyContext } from '../../context/themeContext/themeContext'; 
import { usePollNewOrders } from '../snackBar/usePollNewOrders';
import { getAllOrders } from '../../service/orderService';


const MainContent = () => {
    const { themeMode } = useContext(MyContext);
    // const { showNewOrder } = useNewOrderNotifier();
    // const navigate = useNavigate();
    usePollNewOrders( getAllOrders);
    return (
        <main className='p-1 sm:p-3'>
           
            <div className="w-full lg:max-w-8xl p-0 sm:p-2 mt-4 ml-1 sm:ml-3">
                <DashboardCards />
            </div>
            {/* Latest Orders Section */}
            <div className="w-full lg:max-w-8xl ml-2">
                <LatestOrders />
            </div>
        </main>
    );
};

export default MainContent;
