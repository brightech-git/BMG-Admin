import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link, useLocation ,useParams} from 'react-router-dom';
import BackdropProgress from '../../components/backDrop/BackdropProgress.jsx';
import Snackbar from '../../components/snackBar/Snackbar.jsx';
import AdvancedTable from '../../components/table/ResponsiveTable.jsx';
import StatusChip from '../../components/statusChip/StatusChip.jsx';
import NotificationTemplate from '../../components/notifications/NotificationTemplate.jsx';
import OrderStatusNotification from '../../components/notifications/OrderStatusNotification.jsx';

import {  useRefundOrdersByStatus ,useApproveRefund ,useBookRefundPickup ,useCompleteRefund ,useReceiveRefund ,useRejectRefund} from '../../hooks/refund/useRefundOrders.js';
import { useAddressQuery } from '../../hooks/address/useAddressQuery.js';


import { Truck, ChevronLeft, ChevronRight ,Edit2Icon , Search} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import RefundEditModal from './RefundEditModal.jsx';

const RefundOrdersManagement= () => {
    
    const { orderStatus }= useParams();
    const navigate = useNavigate();


    // Redirect if orderStatus is not present
    useEffect(() => {
        if (!orderStatus) {
            navigate('/', { replace: true });
        }
    }, [orderStatus, navigate]);

   

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        type: "info"
    });

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [inputSearch, setInputSearch] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");

    // Add these state variables
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Import your mutations
    const approveRefund = useApproveRefund();
    const rejectRefund = useRejectRefund();
    const bookPickup = useBookRefundPickup();
    const receiveRefund = useReceiveRefund();
    const completeRefund = useCompleteRefund();

    const [searchScope, setSearchScope] = useState("PAGE"); // PAGE | ALL
    const [appliedFilter, setAppliedFilter] = useState(null);


    const [notificationPayload, setNotificationPayload] = useState(null);
  
    const [progress, setProgress] = useState(0);
    const [showBackdrop, setShowBackdrop] = useState(false);

    const status = orderStatus || "PENDING";

    const { data, isLoading, isError, error, refetch } = useRefundOrdersByStatus(status, page, rowsPerPage, appliedSearch);


    // const updateOrderStatus = useUpdateOrderStatus();
  

    const currentPage = page + 1;               // for UI (1-based)
    const totalPages = data?.totalPages ?? 1;
    const hasMorePage = data?.hasMore ?? false;
    const totalOrdersByStatus = data?.totalByStatus ?? 1;


    const handleSnackbarClose = () => setSnackbar(prev => ({ ...prev, open: false }));

    const normalizeOrder = (order = {}) => ({
        id: order.order_id || order.orderId || 'N/A',
        order_id: order.order_id || order.orderId || 'N/A',
        user_name: order.user_name || order.customerName || 'N/A',
        contact: order.contact || order.customerPhone || 'N/A',
        email: order.email || 'N/A',
        total_amount: parseFloat(order.totalReturnAmount || order.totalAmount || order.amount || 0),
        status: order.status || 'PENDING',
        order_time: order.order_time || order.orderTime || order.date || 'N/A',
        payment_mode: order.paymentMode || order.payment_mode || 'payment',
        payment_status: order.paymentStatus || order.payment_status || 'N/A',
        courierTrackingId: order.courierTrackingId || 'N/A',
        return_id: order.returnId|| '',
        address: order.address ? {
            addressLine: order.address.addressLine || '',
            alternatePhone: order.address.alternatePhone || '',
            city: order.address.city || '',
            state: order.address.state || '',
            pincode: order.address.pincode || '',
            locality: order.address.locality || '',
            landmark: order.address.landmark || '',
            companyName: order.address.companyName || '',
            name: order.address.name || '',
            phone: order.address.phone || '',
            gstNumber: order.address.gstNumber || '',
            id: order.address.id || '',
            isDefault: order.address.isDefault || false,
            customerId: order.address.customerId || '',
        } : {},
        orderItems: (order.orderItems || order.items || []).map((item) => ({
            product_name: item.product_name || item.productName || 'N/A',
            quantity: item.quantity || item.qty||0,
            price: parseFloat(item.price || 0),
            sno: item.sno || 'N/A',
            tagno: item.tagno || 'N/A',
            item_id: item.item_id || item.itemid || 'N/A',
            image_path: item.image_path || item.imagePath || null,
        })),
        reason:order.reason,
        updatedDate: order.updatedAt,
    });

    const refundOrders = useMemo(() => {
        return (data?.requests || []).map(normalizeOrder);
    }, [data]);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
    };
    const handleChangePage = (dir) => {
        setPage((prev) => {
            if (dir === "next" && hasMorePage) {
                return prev + 1;
            }
            if (dir === "prev" && prev > 0) {
                return prev - 1;
            }
            return prev;
        });
    };


   

    const handleSearch = () => {
        if (!inputSearch.trim()) return;

        setPage(0);

        if (searchScope === "ALL") {
            setRowsPerPage(refundOrders?.totalByStatus || 1000);
        } else {
            setRowsPerPage(10);
        }

        setAppliedSearch(inputSearch); // 🔥 API TRIGGER

        setAppliedFilter({
            term: inputSearch,
            scope: searchScope === "ALL" ? "All Orders" : "This Page",
        });
    };
    const handleClearsearch = () => {
        setInputSearch("");
        setAppliedSearch("");
        setAppliedFilter(null);
        setPage(0);
        setRowsPerPage(10);
    };

    // Update handleEditOrder
    const handleEditOrder = (order) => {
        setSelectedOrder(order);
        setShowEditModal(true);
    };


    // Handle status update
    const handleStatusUpdate = async (newStatus, data = {}) => {
        if (!selectedOrder) return;

        setShowBackdrop(true);
        setProgress(0);
        let progressInterval = setInterval(() => {
            setProgress(prev => Math.min(prev + Math.random() * 10, 90));
        }, 200);

        try {
            console.log(selectedOrder,'selectedOrder');
         
            const requestId = selectedOrder.return_id;

            switch (newStatus) {
                case 'APPROVED':
                    await approveRefund.mutateAsync(requestId);
                    break;
                case 'REJECTED':
                    await rejectRefund.mutateAsync({ requestId, reason: data.reason });
                    break;
                case 'BOOKED':
                    await bookPickup.mutateAsync(requestId);
                    break;
                case 'RECEIVED':
                    await receiveRefund.mutateAsync(requestId);
                    break;
                case 'REFUNDED':
                    await completeRefund.mutateAsync(requestId);
                    break;
            }

            clearInterval(progressInterval);
            setProgress(100);

            setTimeout(() => {
                setShowBackdrop(false);
                setProgress(0);
                setShowEditModal(false);
                setSelectedOrder(null);
                setSnackbar({
                    open: true,
                    message: `Order ${newStatus.toLowerCase()} successfully!`,
                    type: "success"
                });
            }, 500);

        } catch (error) {
            clearInterval(progressInterval);
            setShowBackdrop(false);
            setSnackbar({
                open: true,
                message: `Failed: ${error.message}`,
                type: "error"
            });
        }
    };


    const handleTrackOrder = (order) =>{
        setSelectedOrder(order);
        const OrderId = order.order_id;
        navigate(`/track/order/${OrderId}`);

    }


    const getRefundHeaders = (status) => {
        const baseHeaders = [
            { key: "order_id", label: "Order ID", align: "left" },
            { key: "customer", label: "Customer", align: "left" },
            { key: "amount", label: "Amount", align: "right" },
            { key: "status", label: "Status", align: "center" },
        ];

        switch (status) {
            case "REQUESTED":
                return [
                    ...baseHeaders,
                    { key: "reason", label: "Reason", align: "center" },
                    { key: "requested_date", label: "Requested Date", align: "left" },
                    { key: "actions", label: "Actions", align: "center" }, // Approve / Reject
                ];

            case "APPROVED":
                return [
                    ...baseHeaders,
                    { key: "reason", label: "Reason", align: "center" },
                    { key: "approvedAt", label: "Approved Date", align: "left" },
                    { key: "actions", label: "Actions", align: "center" }, // Mark as Received
                ];

            case "RECEIVED":
                return [
                    ...baseHeaders,
                    { key: "rejectedAt", label: "Received Date", align: "left" },
                    { key: "actions", label: "Actions", align: "center" }, // Refund button
                ];

            case "REFUNDED":
                return [
                    ...baseHeaders,
                    { key: "refund_date", label: "Refunded Date", align: "left" },
                    { key: "refund_mode", label: "Refund Mode", align: "center" },
                ];

            case "REJECTED":
                return [
                    ...baseHeaders,
                    { key: "reason", label: "Reject Reason", align: "center" },
                    { key: "rejectedAt", label: "Rejected Date", align: "left" },
                ];

            case "CANCELLED":
                return [
                    ...baseHeaders,
                    { key: "cancelled_date", label: "Cancelled Date", align: "left" },
                ];

            default:
                return baseHeaders;
        }
    };
    const orderHeaders = useMemo(() => {
        return getRefundHeaders(status);
    }, [status]);

    const NON_EDITABLE_STATUSES = ["rejected", "returned", "refunded" , "cancelled"];

    
    const formattedOrders = refundOrders.map(order => ({
        order_id: (
            <span className="text-xs font-semibold text-primaryText">
                {order.order_id}
            </span>
        ),
        customer: (
            <div className="min-w-[120px]">
                <div className="text-xs font-semibold text-primaryText">{order.user_name}</div>
                <div className="text-xs text-secondaryText">{order.contact}</div>
            </div>
        ),
        amount: (
            <span className="text-xs font-semibold text-primaryText">
                ₹{order.total_amount.toFixed(2)}
            </span>
        ),
        status: (
            <StatusChip
                status={order?.status}
                size="small"
                onClick={() => handleEditOrder(order)}
            />
        ),
        order_date: (
            <div className="min-w-[100px]">
                <div className="text-xs font-medium text-primaryText">
                    {new Date(order.order_time).toLocaleDateString()}
                </div>
                <div className="text-xs text-secondaryText">
                    {new Date(order.order_time).toLocaleTimeString()}
                </div>
            </div>
        ),
        payment_mode: (
            <span className="text-xs px-2 py-1 rounded align_center text-black font-semibold">

                <StatusChip status={order.payment_mode} size='small' />
            </span>
        ),
        reason: order.reason && (
            <div className="min-w-[120px]">
                <div className="text-xs font-medium text-primaryText">{order.reason}</div>
            </div>
        ),
        actions: (
            <div className="flex items-center justify-center gap-1">
              

                {/* EDIT ORDER */}
                {!NON_EDITABLE_STATUSES.includes(order.status.toLowerCase()) && (
                    <div className="relative group inline-flex">
                        <button
                            onClick={() => handleEditOrder(order)}
                            className="btn-icon-warning p-1 rounded-md transition-colors"
                        >
                            <Edit2Icon className="w-4 h-4" />
                        </button>
                        <span className="tooltip">Edit Order</span>
                    </div>
                )}

                {/* TRACK ORDER */}
                <div className="relative group inline-flex">
                    <button
                        onClick={() => handleTrackOrder(order)}
                        className="btn-icon-warning p-1 rounded-md transition-colors"
                    >
                        <Truck className="w-4 h-4" />
                    </button>
                    <span className="tooltip">Track Order</span>
                </div>

              
            </div>
        )

    }));

  
    if (isLoading) {
        return (
            <div className="min-h-[200px] bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-[200px] bg-background flex flex-col items-center justify-center p-4">
                <div className="text-error text-sm font-primary mb-2">
                    Error loading orders: {error.message}
                </div>
                <button
                    onClick={() => refetch()}
                    className="bg-primary text-primaryText px-3 py-1 rounded-md text-xs font-semibold hover:bg-activeBorder transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-8xl mx-auto bg-background font-primary  mt-5 overflow-auto">
            {/* Header Card */}
            <div className="bg-card   border border-border mb-4 ml-2 sm:ml-4 transition-all ">
                <div className="p-2">

                    {/* Breadcrumb */}
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb items-center">
                            <Link
                                to="/"
                                className="text-secondaryText hover:text-primaryText transition-colors text-sm"
                            >
                                Dashboard
                            </Link>
                            <span className="text-secondaryText">/</span>
                            <li className="text-primaryText font-semibold capitalize text-xs">
                                Manage {status?.replace('_', ' ')} Orders
                            </li>
                        </ol>
                    </nav>


                    {/* Title and Search */}
                    <motion.div
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        {/* Title and Count */}
                        <motion.div
                            className="flex items-center gap-3"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <h2 className="text-base sm:text-lg font-semibold text-primaryText font-primary">
                               Refund Order Management
                            </h2>
                            <motion.span
                                className="bg-activeBg text-primary px-3 py-1 rounded-full text-sm font-semibold shadow-md"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                            >
                                {totalOrdersByStatus.length} orders
                            </motion.span>
                        </motion.div>

                        {/* Search + Scope */}
                        <motion.div
                            className="flex gap-2 w-full sm:w-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            {/* Search Scope */}
                            <motion.select
                                value={searchScope}
                                onChange={(e) => setSearchScope(e.target.value)}
                                className="px-3 py-2 text-sm bg-card border border-border rounded-md text-primaryText shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                whileHover={{ scale: 1.03 }}
                                whileFocus={{ scale: 1.02 }}
                            >
                                <motion.option value="PAGE">This Page</motion.option>
                                <motion.option value="ALL">All Orders</motion.option>
                            </motion.select>

                            {/* Search Input */}
                            <motion.div
                                className="relative flex-1 sm:w-64"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.5, type: "spring", stiffness: 200 }}
                            >
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ">
                                    <Search className="h-4 w-4 text-secondaryText" />
                                </div>

                                <motion.input
                                    type="text"
                                    placeholder="Search by name, mobile, order id..."
                                    value={inputSearch}
                                    onChange={(e) => setInputSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="w-full pl-10 pr-3 py-2 bg-card border border-border rounded-md text-sm text-primaryText placeholder-secondaryText focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 shadow-sm hover:shadow-md"
                                    whileHover={{ scale: 1.01 }}
                                    whileFocus={{ scale: 1.02 }}
                                />
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Applied Filter */}
                    <AnimatePresence>
                        {appliedFilter && (
                            <motion.div
                                className="mb-2 text-sm bg-white p-2 text-secondaryText flex flex-wrap items-center gap-2"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            >
                                <span className="font-semibold text-primaryText">Filter applied:</span>
                                <span className="italic">"{appliedFilter.term}"</span>
                                <span className="px-2 py-0.5 bg-muted rounded-full text-xs">{appliedFilter.scope}</span>

                                <motion.button
                                    onClick={handleClearsearch}
                                    className="text-primary hover:underline"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Clear
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>


                    {/* Table */}
                    {totalOrdersByStatus.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-secondaryText text-sm">
                                No orders found
                            </div>
                        </div>
                    ) : (
                        <AdvancedTable
                            headers={orderHeaders}
                            fontSizeHeader='text-sm'
                            fontSizeRow="text-xs"
                            data={formattedOrders}
                            alignments={{
                                amount: "right",
                                status: "center",
                                actions: "center",
                                payment_mode: "left",
                            }}
                           actionColumn="actions" 
                            headerBg='bg-[var(--primary-text-color)]'
                            headerText='text-[var(--white-color)]'
                            onRetry={refetch}

                        />
                    )}

                    {/* Footer */}
                    {totalOrdersByStatus > 0 && (
                        <div className="mt-3  flex flex-row sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="bg-info  px-2 py-1 rounded text-xs font-bold">
                                    Total Orders {totalOrdersByStatus}  in {status} 
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
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && selectedOrder && (
                <RefundEditModal
                    order={selectedOrder}
                    currentStatus={status}
                    onUpdate={handleStatusUpdate}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedOrder(null);
                    }}
                />
            )}

            {/* Backdrop and Snackbar */}
            <BackdropProgress
                open={showBackdrop}
                title="Updating Order"
                body="Please wait while we update the order status."
                progress={progress}
            />

            <Snackbar
                open={snackbar.open}
                message={snackbar.message}
                type={snackbar.type}
                onClose={handleSnackbarClose}
            />

            
        </div>
    );
};



export default RefundOrdersManagement;