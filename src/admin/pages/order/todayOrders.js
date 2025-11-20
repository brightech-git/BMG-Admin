import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../context/themeContext/themeContext';
import { useOrdersByDateRange } from '../../hooks/order/useAllOrder';
import { format, subDays, parseISO, isWithinInterval } from 'date-fns';
import { useMediaQuery } from 'react-responsive';
import ResponsiveTable from '../../components/table/ResponsiveTable';
import { useNavigate } from 'react-router-dom';
import { getStatusRoute } from '../../components/routes/getStatusRoute';
import { useMutation } from '@tanstack/react-query';
import { trackOrderById } from '../../service/orderService';
import { Link } from 'react-router-dom';
import StatusChip from '../../components/statusChip/StatusChip';
import SkeletonTable from '../../components/table/SkeletonTable';
import AdvancedTableModal from '../../components/modal/AdvancedTableModal';
import { getProductImages } from '../../../utils/mediaUtils/mediaUtils';
// Icons (still using MUI icons, but styled via CSS)
import { Search as SearchIcon, RemoveRedEye, ArrowForward } from '@mui/icons-material';

const OrderHistoryPage = () => {
    const { themeMode } = useContext(MyContext);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder , setSelectedOrder] = useState('');
    const [trackingModalOpen, setTrackingModalOpen] = useState(false);
    const [trackingData, setTrackingData] = useState(null);
    const navigate = useNavigate();
console.log(selectedOrder ,'oredeselectede')
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

    const trackOrderMutation = useMutation({
        mutationFn: (orderId) => trackOrderById(orderId),
        onSuccess: (data) => {
            setTrackingData(data);
            setSelectedOrder(data);
            setTrackingModalOpen(true);
        },
        onError: (error) => {
            console.error('Tracking error:', error);
        },
    });

    const handleQuickDateSelect = (days) => {
        const newStartDate = subDays(new Date(), days);
        setStartDate(newStartDate);
        setEndDate(new Date());
        setActiveDays(days);
    };

    const handleTrackOrder = (orderId) => {
        trackOrderMutation.mutate(orderId);
    };

    const closeTrackingModal = () => {
        setTrackingModalOpen(false);
        setTrackingData(null);
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
        const route = getStatusRoute(row.status);
        const path ='/admin/order/status';
        if (route) {
            navigate(path, { state: { key: route.key, values: route.values } });
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
                        <button
                            onClick={() => handleTrackOrder(row.orderId)}
                            className="p-1 rounded-[var(--border-radius-sm)] transition-smooth hover:scale-105"
                            style={{ color: 'var(--active-border)' }}
                            title="View Tracking"
                        >
                            <RemoveRedEye className="text-xs" />
                        </button>
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
            <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'var(--background-color)' }}>
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

            <AdvancedTableModal
                open={trackingModalOpen}
                onClose={closeTrackingModal}
                title="Order Tracking Details"
                mode="track"
                userView ={false}
                themeMode={themeMode}
                currentStatus={selectedOrder.current_status}
                trackDetails = {selectedOrder.history}
                //  userData={[
                //                             {
                //                                 key: "Order Number",
                //                                 value: selectedOrder?.order_id,
                //                                 align: "left",
                //                             },
                //                             {
                //                                 key: "Name",
                //                                 value: selectedOrder?.user_name,
                //                             },
                //                             {
                //                                 key: "Email",
                //                                 value: selectedOrder?.email,
                //                             },
                //                             {
                //                                 key: "Mobile Number",
                //                                 value: selectedOrder?.contact,
                //                             },
                //                             {
                //                                 key: "Address",
                //                                 value: selectedOrder?.address
                //                                     ? `${selectedOrder.address.name}, ${selectedOrder.address.addressLine}, ${selectedOrder.address.landmark ? selectedOrder.address.landmark + "," : ""} ${selectedOrder.address.city}, ${selectedOrder.address.state} - ${selectedOrder.address.pincode}`
                //                                     : "No address available",
                //                             },
                //                             {
                //                                 key: "Order Date",
                //                                 value: selectedOrder?.order_time
                //                                     ? new Date(selectedOrder.order_time).toLocaleString()
                //                                     : "-",
                //                             },
                //                         ]}
                //                         userColumns={[
                //                             { key: "key", label: "Field" },
                //                             { key: "value", label: "Details" },
                //                         ]}
                                        orderData={selectedOrder?.items?.map((item, index) => ({
                                            sno: index + 1,
                                            productId: item.tagno || item.sno || "-",
                                            product: (
                                                <span className='flex items-center gap-1 text-xs'>
                                                    <img src={getProductImages(item.image_path)} width={30} height={30} />
                                                    {item.product_name}
                                                </span>
                                            ),
                                            price: item.price.toFixed(2),
                                            total: item.price.toFixed(2),
                                        }))}
                                        orderColumns={[
                                            { key: "sno", label: "S.No", align: "left" },
                                            { key: "productId", label: "Product ID", align: "left" },
                                            { key: "product", label: "Product ", align: "left" },
                                            { key: "price", label: "Price", align: "right" },
                                            { key: "total", label: "Total", align: "right" },
                                        ]}
                showTotal={true}
                totalLabel="Total Price"
                totalValue={`₹${trackingData?.items?.reduce((sum, i) => sum + i.price, 0)?.toFixed(2) || 0}`}
                
            />
        </div>
    );
};

export default OrderHistoryPage;