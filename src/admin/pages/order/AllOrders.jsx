import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllOrders } from '../../hooks/order/useAllOrder';
import { format, subDays, parseISO, isWithinInterval } from 'date-fns';
import { useMediaQuery } from 'react-responsive';
import ResponsiveTable from '../../components/table/ResponsiveTable';
import StatusChip from '../../components/statusChip/StatusChip';
import SkeletonTable from '../../components/table/SkeletonTable';
import { Truck,ChevronRight, ChevronLeft } from 'lucide-react';
// Icons (still using MUI icons, but styled via CSS)
import { Search as SearchIcon, RemoveRedEye, ArrowForward } from '@mui/icons-material';

const AllOrders = () => {
  

    const navigate = useNavigate();
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const isTablet = useMediaQuery({ query: '(max-width: 1024px)' });


       const [page, setPage] = useState(0);
        const [rowsPerPage, setRowsPerPage] = useState(10);

    const { data: orders = [], isLoading, isError, refetch } = useAllOrders(page,rowsPerPage);

    console.log(orders,'orders');


    const handleTrackOrder = (orderId) => {
        navigate(`/track/order/${orderId}`);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
    };

    const handleChangePage = (dir) => {
        setPage((prev) => {
            // if (dir === "next" && hasMorePage) 
                if (dir === "next") {
                return prev + 1;
            }
            if (dir === "prev" && prev > 0) {
                return prev - 1;
            }
            return prev;
        });
    };
    const totalOrders = orders?.totalOrders;
    const totalPages = orders?.totalPages || orders?.totalOrders;
    const hasMorePage = orders?.hasMore || true ;
    const currentPage = page + 1;  

    const filteredOrders = Array.isArray(orders?.orders) ? orders?.orders : [] ;



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

    const renderCell = (key, row,  showNextArrow) => {
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
                return <StatusChip status={row?.status} size="small" />;

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
        <div className="border mt-8 md:py-4 px-2 md:px-10 ml-0 md:ml-4" style={{ backgroundColor: 'var(--background-color)' }}>
            <div className=""
                >
           


                    {/* Header */}
                    <div className={`
            flex ${isMobile ? 'flex-col' : isTablet ? 'flex-col lg:flex-row lg:items-center lg:justify-between' : 'flex-row items-center justify-between'}
            ${isMobile ? 'space-y-2' : isTablet ? 'space-y-4 lg:space-y-0' : 'space-y-0'} mb-2 p-2
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

                      
                    </div>

                    <div className="rounded-[var(--border-radius-md)] p-1 overflow-hidden " >
                        {isLoading ? (
                            <SkeletonTable rows={5} cols={7} />
                        ) : (
                            <>
                            <ResponsiveTable
                                headers={tableHeaders}
                                data={filteredOrders}
                                renderCell={renderCell}
                                showNextArrow={true}
                                fontSizeRow='text-xs'
                                alignments={{
                                    totalAmount: 'right',
                                    status: 'center',
                                    tracking: 'center'
                                }}
                              
                                fontSizeHeader="text-sm"
                            />
                            {/* Footer */}
                                    {totalOrders > 0 && (
                            <div className="mt-3  flex flex-row sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="bg-info  px-2 py-1 rounded text-xs font-bold">
                                                    Total Orders {totalOrders} 
                                    </span>
                                </div>
                                <div className='flex items-center gap-2'>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-secondaryText font-secondary">
                                            Rows per page:
                                        </span>
                                        <select
                                            value={rowsPerPage}
                                            onChange={handleChangeRowsPerPage}
                                            className="bg-background border border-border rounded text-xs px-1 py-1"
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs">
                                        <button
                                            disabled={page === 0}
                                            onClick={() => handleChangePage("prev")}
                                            className="p-1 rounded bg-[var(--primary-color)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-[var(--primary-color)]"
                                            aria-label="Previous page"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>

                                        <span className="text-gray-600 font-medium">
                                            {currentPage} / {totalPages}
                                        </span>

                                        <button
                                            disabled={!hasMorePage}
                                            onClick={() => handleChangePage("next")}
                                            className="p-1 rounded bg-[var(--primary-color)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-[var(--primary-color)]"
                                            aria-label="Next page"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                                </>
                        )}
                              
                    </div>
                
            </div>

        </div>
    );
};

export default AllOrders;