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
import { TextField, Button } from '../../components/ui/TailwindForm';
import { Card, CardContent } from '../../components/ui/TailwindCard';
import { Typography } from '../../components/ui/TailwindTypography';
import { Chip } from '../../components/ui/TailwindChip';
import SkeletonTable from '../../components/table/SkeletonTable';
import { EnhancedDialog, ProgressTracker } from '../../components/ui/EnhancedDialog';

// Icons
import {
    Search as SearchIcon,
    RemoveRedEye,
    ArrowForward
} from '@mui/icons-material';

const OrderHistoryPage = () => {
    const { themeMode } = useContext(MyContext);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [trackingModalOpen, setTrackingModalOpen] = useState(false);
    const [trackingData, setTrackingData] = useState(null);
    const navigate = useNavigate();

    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const isTablet = useMediaQuery({ query: '(max-width: 1024px)' });

    const [activeDays, setActiveDays] = useState(0); // Default active is "Today"

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
            console.log('Tracking data:', data);
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
        if (route) {
            navigate(route.path, { state: { key: route.key, values: route.values } });
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
                    <span className="text-responsive-xs font-semibold text-[var(--active-border)]">
                        {row.orderId}
                    </span>
                );

            case 'customer':
                return (
                    <div>
                        <div className="text-responsive-xs font-semibold text-[var(--primary-text-color)]">
                            {row.customerName}
                        </div>
                        <div className="text-responsive-xxs text-[var(--secondary-text-color)]">
                            {row.contact}
                        </div>
                    </div>
                );

            case 'orderTime':
                return (
                    <div>
                        <div className="text-responsive-xs text-[var(--primary-text-color)]">
                            {format(parseISO(row.orderTime), 'dd/MM/yyyy')}
                        </div>
                        <div className="text-responsive-xxs text-[var(--secondary-text-color)]">
                            {format(parseISO(row.orderTime), 'hh:mm a')}
                        </div>
                    </div>
                );

            case 'products':
                return (
                    <div className="flex items-center space-compact-sm">
                        <Chip
                            label={`${row.orderItems?.length || 0} item${row.orderItems?.length > 1 ? 's' : ''}`}
                            size="small"
                            themeMode={themeMode}
                        />
                    </div>
                );

            case 'totalAmount':
                return (
                    <span className="text-responsive-xs font-bold text-[var(--primary-color)]">
                        ₹{row.totalAmount?.toFixed(2)}
                    </span>
                );

            case 'status':
                return (
                    <StatusChip
                        status={row?.status}
                        size="small"
                        themeMode={themeMode}
                    />
                );

            case 'tracking':
                return (
                    <div className="flex items-center justify-center space-compact-xs">
                        <button
                            onClick={() => handleTrackOrder(row.orderId)}
                            className="
                                p-1 rounded-[var(--border-radius-sm)] 
                                transition-smooth hover:scale-105
                                text-[var(--active-border)] 
                                bg-[var(--active-bg)]
                            "
                            title="View Tracking"
                        >
                            <RemoveRedEye className="text-responsive-sm" />
                        </button>
                        {showNextArrow && (
                            <button
                                onClick={() => handleNextAction(row)}
                                className="
                                    p-1 rounded-[var(--border-radius-sm)] 
                                    transition-smooth hover:scale-105
                                    text-[var(--primary-color)] 
                                    bg-[var(--active-bg)]
                                "
                                title="Next Action"
                            >
                                <ArrowForward className="text-responsive-sm" />
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
            <div className="min-h-screen bg-[var(--background-color)] p-4 md:p-8">
                <Card themeMode={themeMode} className="p-6">
                    <div className="
                        bg-[var(--error-color)] text-[var(--text-dark)] 
                        rounded-[var(--border-radius-md)] p-4 mb-4
                    ">
                        <Typography variant="body1">
                            Failed to load orders. Please try again.
                        </Typography>
                    </div>
                    <Button
                        onClick={refetch}
                        variant="contained"
                        themeMode={themeMode}
                    >
                        Retry
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background-color)] py-8 md:py-10 px-2 md:px-10 ml-0 md:ml-4">
            {/* Main Card */}
            <Card themeMode={themeMode} className="shadow-professional hover:shadow-professional-hover transition-smooth">
                <CardContent padding="default">
                    {/* Breadcrumb */}
                    <nav className="mb-1">
                        <ol className="flex items-center space-x-1 text-responsive-sm">
                            <li>
                                <Link
                                    to="/"
                                    className="text-[var(--primary-color)] hover:text-[var(--active-border)] transition-colors"
                                >
                                    Dashboard
                                </Link>
                            </li>
                            <li className="text-[var(--secondary-text-color)]">/</li>
                            <li className="text-[var(--primary-text-color)] font-semibold">
                                Manage Today Orders
                            </li>
                        </ol>
                    </nav>

                    {/* Header Section - Enhanced for Tablet */}
                    <div className={`
                        flex ${isMobile ? 'flex-col' : isTablet ? 'flex-col lg:flex-row lg:items-center lg:justify-between' : 'flex-row items-center justify-between'} 
                        ${isMobile ? 'space-y-1' : isTablet ? 'space-y-3 lg:space-y-0' : 'space-y-0'} 
                        mb-2
                    `}>
                        {/* Title Section */}
                        <div className="flex items-center space-x-1">
                            <Typography variant="h6" className={`${isTablet ? 'text-responsive-lg' : 'text-responsive-md md:text-responsive-xl'}`}>
                                Order Details
                            </Typography>
                            <Chip
                                label={`${filteredOrders.length || 0} orders`}
                                size="small"
                                themeMode={themeMode}
                            />
                        </div>

                        {/* Controls Section - Enhanced for Tablet */}
                        <div className={`
                            flex ${isMobile ? 'flex-col' : isTablet ? 'flex-col lg:flex-row lg:items-center' : 'flex-row items-center'} 
                            ${isMobile ? 'space-y-2' : isTablet ? 'space-y-2 lg:space-y-0 lg:space-x-2' : 'space-x-2'}
                            ${isMobile ? 'w-full' : isTablet ? 'w-full lg:w-auto' : 'w-auto'}
                        `}>
                            {/* Date Range - Enhanced for Tablet */}
                            <div className={`
                                flex ${isMobile ? 'flex-col' : isTablet ? 'flex-col lg:flex-row lg:items-center' : 'flex-row items-center'} 
                                ${isMobile ? 'space-y-1' : isTablet ? 'space-y-1 lg:space-y-0 lg:space-x-2' : 'space-x-2'}
                                ${isTablet ? 'w-30 lg:w-30' : 'w-30'}
                            `}>
                                <TextField
                                    label="From"
                                    type="date"
                                    value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                                    onChange={(e) => setStartDate(parseDate(e.target.value))}
                                    themeMode={themeMode}
                                    className={isMobile ? 'w-full' : isTablet ? 'w-full lg:w-36' : 'w-40'}
                                />

                                <TextField
                                    label="To"
                                    type="date"
                                    value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                                    onChange={(e) => setEndDate(parseDate(e.target.value))}
                                    themeMode={themeMode}
                                    className={isMobile ? 'w-full' : isTablet ? 'w-full lg:w-36' : 'w-40'}
                                />
                            </div>

                            {/* Quick Date Buttons - Enhanced for Tablet */}
                            <div className={`
                                flex space-x-1 flex-wrap
                                ${isTablet ? 'justify-center lg:justify-start' : ''}
                                ${isMobile ? 'mt-0' : isTablet ? 'mt-2 lg:mt-2' : 'mt-2'}
                            `}>
                                {[0, 7, 30].map((days) => (
                                    <Button
                                        key={days}
                                        variant={activeDays === days ? "contained" : "outlined"}
                                        size="small"
                                        onClick={() => handleQuickDateSelect(days)}
                                        themeMode={themeMode}
                                        className={`${isTablet ? 'text-responsive-xs px-2' : 'text-responsive-xxs'}`}
                                    >
                                        {days === 0 ? 'Today' : days === 7 ? '7 Days' : '30 Days'}
                                    </Button>
                                ))}
                            </div>

                            {/* Search - Enhanced for Tablet */}
                            <div className={`relative ${isTablet ? 'flex-1 min-w-full lg:min-w-[230px]' : 'flex-1 min-w-[190px]'}`}>
                                <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                                    <SearchIcon className={`${isTablet ? 'text-responsive-xs' : 'text-responsive-xxs'} text-[var(--secondary-text-color)]`} />
                                </div>
                                <TextField
                                    placeholder="Search by Order ID or Mobile"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    themeMode={themeMode}
                                    className={`w-full`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <SkeletonTable
                                rows={6}
                                columns={7}
                                themeMode={themeMode}
                                withHeader={true}
                            />
                            <Typography variant="body1" className="text-center text-[var(--secondary-text-color)]">
                                Loading orders...
                            </Typography>
                        </div>
                    ) : (
                        <div className="rounded-[var(--border-radius-md)] overflow-hidden border border-[var(--border-color)]">
                            <ResponsiveTable
                                headers={tableHeaders}
                                data={filteredOrders}
                                isLoading={isLoading}
                                isError={isError}
                                onRetry={refetch}
                                renderCell={renderCell}
                                themeMode={themeMode}
                                showNextArrow={true}
                                alignments={{
                                    totalAmount: 'right',
                                    status: 'center',
                                    tracking: 'center'
                                }}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Enhanced Tracking Dialog */}
            <EnhancedDialog
                open={trackingModalOpen}
                onClose={closeTrackingModal}
                title="Order Tracking Details"
                maxWidth="lg"
                themeMode={themeMode}
            >
                {trackingData ? (
                    <div className="space-y-2">
                        <ProgressTracker
                            trackingData={trackingData}
                            themeMode={themeMode}
                        />

                        {/* Order Items */}
                        <div>
                            <h3 className="text-responsive-md font-semibold text-[var(--primary-text-color)] mb-4">
                                Order Items
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[var(--active-bg)]">
                                            <th className="text-left p-3 text-responsive-xs font-semibold text-[var(--primary-text-color)]">
                                                Product
                                            </th>
                                            <th className="text-left p-3 text-responsive-xs font-semibold text-[var(--primary-text-color)]">
                                                Product Key
                                            </th>
                                            <th className="text-right p-3 text-responsive-xs font-semibold text-[var(--primary-text-color)]">
                                                Price
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trackingData?.items?.map((item, index) => (
                                            <tr key={index} className="border-b border-[var(--border-color)] hover:bg-[var(--active-bg)]">
                                                <td className="p-3">
                                                    <div className="flex items-center space-x-2">
                                                        {item.image_path && (
                                                            <img
                                                                src={item.image_path}
                                                                alt={item.productName}
                                                                className="w-10 h-10 rounded-[var(--border-radius-sm)] object-cover border border-[var(--border-color)]"
                                                            />
                                                        )}
                                                        <span className="text-responsive-xs text-[var(--primary-text-color)]">
                                                            {item.productName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-responsive-xs text-[var(--primary-text-color)]">
                                                    {item.itemid}{item.tagno}
                                                </td>
                                                <td className="p-3 text-right text-responsive-xs font-semibold text-[var(--success-color)]">
                                                    ₹{item.price.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="text-4xl text-[var(--border-color)] mb-4">📦</div>
                        <Typography variant="h6" className="text-[var(--secondary-text-color)] mb-2">
                            No Tracking Information
                        </Typography>
                        <Typography variant="body2" className="text-[var(--secondary-text-color)]">
                            Tracking details are not available for this order yet.
                        </Typography>
                    </div>
                )}
            </EnhancedDialog>
        </div>
    );
};

export default OrderHistoryPage;