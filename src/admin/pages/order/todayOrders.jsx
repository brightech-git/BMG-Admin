import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { MyContext } from '../../context/themeContext/themeContext';
import { useOrdersByDateRange } from '../../hooks/order/useAllOrder';
import { format, subDays, parseISO, isWithinInterval } from 'date-fns';
import { useMediaQuery } from 'react-responsive';
import ResponsiveTable from '../../components/table/ResponsiveTable';
import { getStatusRoute } from '../../components/routes/getStatusRoute';
import StatusChip from '../../components/statusChip/StatusChip';
import SkeletonTable from '../../components/table/SkeletonTable';
import { Truck } from 'lucide-react';
// Icons (still using MUI icons, but styled via CSS)
import { Search as SearchIcon, RemoveRedEye, ArrowForward } from '@mui/icons-material';

const OrdersByRange = () => {
    const { themeMode } = useContext(MyContext);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');


    const navigate = useNavigate();
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const isTablet = useMediaQuery({ query: '(max-width: 1024px)' });

    const [activeDays, setActiveDays] = useState(0);

    const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : '';
    const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : '';

    const { data: orders = [], isLoading, isError, refetch } = useOrdersByDateRange(
        formattedStartDate,
        formattedEndDate
    );

    useEffect(() => {
        refetch();
    }, [formattedStartDate, formattedEndDate, refetch]);

   

    const handleQuickDateSelect = (days) => {
        const newStartDate = subDays(new Date(), days);
        setStartDate(newStartDate);
        setEndDate(new Date());
        setActiveDays(days);
    };

    const handleTrackOrder = (orderId) => {
        navigate(`/admin/track/order/${orderId}`);
    };

 

    const parseDate = (value) => (value ? new Date(value) : null);

    const filteredOrders = Array.isArray(orders)
        ? orders.filter((order) => {
            const start = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
            const end = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;
            const matchesDate = start && end
                ? isWithinInterval(parseISO(order.orderTime), { start, end })
                : true;
            const searchTerm = searchQuery.trim().toLowerCase();
            const matchesSearch = searchTerm
                ? order.orderId.toString().toLowerCase().includes(searchTerm) ||
                order.contact.toLowerCase().includes(searchTerm)
                : true;
            return matchesDate && matchesSearch;
        })
        : [];

    const handleNextAction = (row) => {
        const path = `/admin/order/status/${row.status}`;
        if (row.status) {
            navigate(path, { state: { key: row.status} });
        }
    };

    const tableHeaders = [
        { key: 'orderId', label: 'Order ID', align: 'left' },
        { key: 'customer', label: 'Customer', align: 'left' },
        { key: 'orderTime', label: 'Date & Time', align: 'left' },
        { key: 'products', label: 'Products', align: 'left' },
        { key: 'totalAmount', label: 'Amount', align: 'right' },
        { key: 'status', label: 'Status', align: 'center' },
        { key: 'tracking', label: 'Tracking', align: 'center' }
    ];

    const renderCell = (key, row, themeMode, showNextArrow) => {
        switch (key) {
            case 'orderId':
                return (
                    <span className="text-xs font-semibold" style={{ color: 'var(--active-border)' }}>
                        {row.orderId}
                    </span>
                );

            case 'customer':
                return (
                    <div>
                        <div className="text-xs font-semibold" style={{ color: 'var(--primary-text-color)' }}>
                            {row.customerName}
                        </div>
                        <div className="text-xxs" style={{ color: 'var(--secondary-text-color)' }}>
                            {row.contact}
                        </div>
                    </div>
                );

            case 'orderTime':
                return (
                    <div>
                        <div className="text-xs" style={{ color: 'var(--primary-text-color)' }}>
                            {format(parseISO(row.orderTime), 'dd/MM/yyyy')}
                        </div>
                        <div className="text-xxs" style={{ color: 'var(--secondary-text-color)' }}>
                            {format(parseISO(row.orderTime), 'hh:mm a')}
                        </div>
                    </div>
                );

            case 'products':
                return (
                    <div className="flex items-center space-compact-sm">
                        <span className="inline-block px-2 py-1 text-responsive-xxs font-medium rounded-full"
                            style={{ backgroundColor: 'var(--active-bg)', color: 'var(--primary-text-color)' }}>
                            {row.orderItems?.length || 0} item{row.orderItems?.length > 1 ? 's' : ''}
                        </span>
                    </div>
                );

            case 'totalAmount':
                return (
                    <span className="text-xs font-bold" style={{ color: 'var(--primary-color)' }}>
                        ₹{row.totalAmount?.toFixed(2)}
                    </span>
                );

            case 'status':
                return <StatusChip status={row?.status} size="small" themeMode={themeMode} />;

            case 'tracking':
                return (
                    <div className="flex items-center justify-center space-compact-xs">
                         {/* TRACK ORDER */}
                                       <div className="relative group inline-flex">
                                           <button
                                onClick={() => handleTrackOrder(row.orderId)}
                                               className="btn-icon-warning p-1 rounded-md transition-colors"
                                           >
                                <Truck className="w-4 h-4" />
                                           </button>
                                           <span className="tooltip">Track Order</span>
                                       </div>
                        {showNextArrow && (
                            <button
                                onClick={() => handleNextAction(row)}
                                className="p-1 rounded-[var(--border-radius-sm)] transition-smooth hover:scale-105"
                                style={{ color: 'var(--primary-color)', }}
                                title="Next Action"
                            >
                                <ArrowForward className="text-xs" />
                            </button>
                        )}
                    </div>
                );

            default:
                return row[key];
        }
    };

    if (isError) {
        return (
            <div className="p-4 md:p-8" style={{ backgroundColor: 'var(--background-color)' }}>
                <div className="p-6 rounded-[var(--border-radius-md)] shadow-professional"
                    style={{ backgroundColor: 'var(--card-background-color)' }}>
                    <div className="p-4 mb-4 rounded-[var(--border-radius-md)] text-white"
                        style={{ backgroundColor: 'var(--error-color)' }}>
                        <p className="text-responsive-sm">Failed to load orders. Please try again.</p>
                    </div>
                    <button
                        onClick={refetch}
                        className="px-4 py-2 text-responsive-sm font-medium text-white rounded-[var(--border-radius-sm)] transition-smooth"
                        style={{ backgroundColor: 'var(--primary-color)' }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="border mt-8 md:py-10 px-2 md:px-10 ml-0 md:ml-4" style={{ backgroundColor: 'var(--background-color)' }}>
            <div className=""
                >
                <div className="p-2  md:p-3">


                    {/* Header */}
                    <div className={`
            flex ${isMobile ? 'flex-col' : isTablet ? 'flex-col lg:flex-row lg:items-center lg:justify-between' : 'flex-row items-center justify-between'}
            ${isMobile ? 'space-y-4' : isTablet ? 'space-y-4 lg:space-y-0' : 'space-y-0'} mb-6
          `}>
                        <div className="flex items-center space-x-2">
                            <h2 className={`${isTablet ? 'text-responsive-lg' : 'text-responsive-xl'} font-bold`}
                                style={{ color: 'var(--primary-text-color)' }}>
                                Order Details
                            </h2>
                            <span className="inline-block px-2 py-1 text-responsive-xs font-medium rounded-full"
                                style={{ backgroundColor: 'var(--active-bg)', color: 'var(--primary-text-color)' }}>
                                {filteredOrders.length || 0} orders
                            </span>
                        </div>

                        <div className={`
              flex ${isMobile ? 'flex-col' : isTablet ? 'flex-col lg:flex-row' : 'flex-row items-center'}
              ${isMobile ? 'space-y-3' : isTablet ? 'space-y-3 lg:space-y-0 lg:space-x-3' : 'space-x-3'}
              ${isMobile ? 'w-full' : isTablet ? 'w-full lg:w-auto' : 'w-auto'}
            `}>
                            <div className={`
                flex ${isMobile ? 'flex-col' : isTablet ? 'flex-col lg:flex-row' : 'flex-row items-center'}
                ${isMobile ? 'space-y-2' : isTablet ? 'space-y-2 lg:space-y-0 lg:space-x-2' : 'space-x-2'}
              `}>
                                <input
                                    type="date"
                                    value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                                    onChange={(e) => setStartDate(parseDate(e.target.value))}
                                    className="px-3 py-2 text-responsive-sm border rounded-[var(--border-radius-sm)]"
                                    style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-background-color)' }}
                                />
                                <input
                                    type="date"
                                    value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                                    onChange={(e) => setEndDate(parseDate(e.target.value))}
                                    className="px-3 py-2 text-responsive-sm border rounded-[var(--border-radius-sm)]"
                                    style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-background-color)' }}
                                />
                            </div>

                            <div className="flex space-x-1 flex-wrap">
                                {[0, 7, 30].map((days) => (
                                    <button
                                        key={days}
                                        onClick={() => handleQuickDateSelect(days)}
                                        className={`px-3 py-1 text-responsive-xs font-medium rounded-[var(--border-radius-sm)] transition-smooth ${activeDays === days ? 'text-white' : ''
                                            }`}
                                        style={{
                                            backgroundColor: activeDays === days ? 'var(--primary-color)' : 'transparent',
                                            color: activeDays === days ? '#fff' : 'var(--primary-text-color)',
                                            border: activeDays === days ? 'none' : '1px solid var(--border-color)'
                                        }}
                                    >
                                        {days === 0 ? 'Today' : days === 7 ? '7 Days' : '30 Days'}
                                    </button>
                                ))}
                            </div>

                            <div className="relative flex-1 min-w-[190px]">
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-responsive-xs"
                                    style={{ color: 'var(--secondary-text-color)' }} />
                                <input
                                    type="text"
                                    placeholder="Search by Order ID or Mobile"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 text-responsive-sm border rounded-[var(--border-radius-sm)]"
                                    style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-background-color)' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[var(--border-radius-md)] overflow-hidden border" style={{ borderColor: 'var(--border-color)' }}>
                        {isLoading ? (
                            <SkeletonTable rows={5} cols={7} />
                        ) : (
                            <ResponsiveTable
                                headers={tableHeaders}
                                data={filteredOrders}
                                renderCell={renderCell}
                                themeMode={themeMode}
                                showNextArrow={true}
                                fontSizeRow='text-xs'
                                alignments={{
                                    totalAmount: 'right',
                                    status: 'center',
                                    tracking: 'center'
                                }}
                              
                                fontSizeHeader="text-sm"
                            />
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default OrdersByRange;