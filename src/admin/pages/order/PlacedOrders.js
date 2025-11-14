import React, { useState, useMemo } from 'react';
import { useUpdateOrderStatus, useOrdersByStatus } from '../../hooks/order/useAllOrder';
import { Link, useLocation } from 'react-router-dom';
import BackdropProgress from '../../components/backDrop/BackdropProgress';
import Snackbar from '../../components/snackBar/Snackbar';
import EditStatusModalTailwind from '../../components/modal/EditStatusModalTailwind';
import AdvancedTableModal from '../../components/modal/AdvancedTableModal';
import AdvancedTable from '../../components/table/ResponsiveTable';
import StatusChip from '../../components/statusChip/StatusChip';

const OrderTable = () => {
    const location = useLocation();
    const { key, values } = location.state || {};

    console.log(key ,'key for order')

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        type: "info"
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        status: '',
        remarks: '',
        paymentMode: '',
        paymentStatus: '',
    });
    const [formError, setFormError] = useState('');
    const [progress, setProgress] = useState(0);
    const [showBackdrop, setShowBackdrop] = useState(false);

    const status = key;
    const { data, isLoading, isError, error, refetch } = useOrdersByStatus(status, page, rowsPerPage);
    const updateOrderStatus = useUpdateOrderStatus();

    const handleSnackbarClose = () => setSnackbar(prev => ({ ...prev, open: false }));

    const normalizeOrder = (order = {}) => ({
        id: order.order_id || order.orderId || 'N/A',
        order_id: order.order_id || order.orderId || 'N/A',
        user_name: order.user_name || order.customerName || 'N/A',
        contact: order.contact || 'N/A',
        email: order.email || 'N/A',
        total_amount: parseFloat(order.total_amount || order.totalAmount || order.amount || 0),
        status: order.status || 'PENDING',
        order_time: order.order_time || order.orderTime || order.date || 'N/A',
        payment_mode: order.paymentMode || order.payment_mode || 'payment',
        payment_status: order.paymentStatus || order.payment_status || 'N/A',
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
        orderItems: (order.orderItems || []).map((item) => ({
            product_name: item.product_name || item.productName || 'N/A',
            quantity: item.quantity || 0,
            price: parseFloat(item.price || 0),
            sno: item.sno || 'N/A',
            tagno: item.tagno || 'N/A',
            item_id: item.item_id || item.itemid || 'N/A',
            image_path: item.image_path || item.imagePath || null,
        })),
    });

    const orders = useMemo(() => {
        return (data?.orders || []).map(normalizeOrder);
    }, [data]);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const searchTermLower = (searchTerm || '').toLowerCase();
            const orderId = (order.order_id || '').toLowerCase();
            const userName = (order.user_name || '').toLowerCase();
            const contact = (order.contact || '').toLowerCase();
            const email = (order.email || '').toLowerCase();

            return orderId.includes(searchTermLower) ||
                userName.includes(searchTermLower) ||
                contact.includes(searchTermLower) ||
                email.includes(searchTermLower);
        });
    }, [orders, searchTerm]);

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setOpenViewModal(true);
    };

    const handleEditOrder = (order) => {
        setSelectedOrder(order);
        setEditForm({
            status: status,
            remarks: '',
            paymentMode: order.paymentMode || order.payment_mode || 'ONLINE',
            paymentStatus: order.paymentStatus || order.payment_status || 'PENDING',
        });
        setOpenEditModal(true);
    };

    const handleCloseViewModal = () => {
        setOpenViewModal(false);
        setSelectedOrder(null);
    };

    const handleCloseEditModal = () => {
        setOpenEditModal(false);
        setSelectedOrder(null);
        setEditForm({
            status: '',
            remarks: '',
            paymentMode: '',
            paymentStatus: ''
        });
        setFormError('');
    };

    const handleEditSubmit = async (formData) => {
        if (!editForm.status) {
            setSnackbar({
                open: true,
                message: "Status is required.",
                type: "error",
            });
            return;
        }

        setShowBackdrop(true);
        setProgress(0);

        let progressInterval;

        try {
            const payload = {
                orderId: selectedOrder.order_id,
                newStatus: formData.status,
                remarks: formData.remarks,
                paymentMode: editForm.paymentMode,
                paymentStatus: editForm.paymentStatus,
            };

            progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + Math.random() * 5, 90).toFixed());
            }, 150);

            const response = await updateOrderStatus.mutateAsync(payload);

            if (!response) throw new Error("Order update failed");

            clearInterval(progressInterval);
            setProgress(100);

            setSnackbar({
                open: true,
                message: "Order status updated successfully!",
                type: "success",
            });

            setTimeout(() => {
                setShowBackdrop(false);
                refetch();
                handleCloseEditModal();
            }, 600);

        } catch (err) {
            clearInterval(progressInterval);
            setProgress(0);

            setSnackbar({
                open: true,
                message: `Failed: ${err.message || "Unknown error"}`,
                type: "error",
            });

            setTimeout(() => setShowBackdrop(false), 1000);
        }
    };

    const orderHeaders = [
        { key: "order_id", label: "Order ID", align: "left" },
        { key: "customer", label: "Customer", align: "left" },
        { key: "amount", label: "Amount", align: "right" },
        { key: "status", label: "Status", align: "center" },
        { key: "order_date", label: "Order Date", align: "left" },
        { key: "payment_mode", label: "Payment Mode", align: "left" },
        { key: "actions", label: "Actions", align: "center" },
    ];

    const formattedOrders = filteredOrders.map(order => ({
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
            <span className="text-xs px-2 py-1 rounded bg-info text-black font-semibold">
                {order.payment_mode}
            </span>
        ),
        actions: (
            <div className="flex items-center justify-center gap-1">
                <button
                    onClick={() => handleViewOrder(order)}
                    className="btn-icon-primary p-1 rounded-md  transition-colors"
                >
                    <ViewIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={() => handleEditOrder(order)}
                    className="btn-icon-warning p-1 rounded-md  transition-colors"
                >
                    <EditIcon className="w-4 h-4" />
                </button>
            </div>
        ),
    }));

    // Status options based on current status
    const getStatusOptions = () => {
        const statusFlow = {
            'PLACED': [
                { value: 'IN_PROCESSING', label: 'Move to Quality Check' },
                { value: 'CANCELLED', label: 'Cancel Order' },
            ],
            'IN_PROCESSING': [
                { value: 'PACKING', label: 'Move to Packing' },
                { value: 'CANCELLED', label: 'Cancel Order' },
            ],
            'PACKING': [
                { value: 'PACKED', label: 'Product has been packed' },
                { value: 'CANCELLED', label: 'Cancel Order' },
            ],
            'PACKED': [
                { value: 'READY_TO_SHIP', label: 'Move to Ready to Ship' },
                { value: 'CANCELLED', label: 'Cancel Order' },
            ],
            'READY_TO_SHIP': [
                { value: 'SHIPPED', label: 'Move to Shipped' },
                { value: 'CANCELLED', label: 'Cancel Order' },
            ],
            'SHIPPED': [
                { value: 'DELIVERED', label: 'Mark as Delivered' },
            ],
        };

        return statusFlow[status] || [
            { value: 'CANCELLED', label: 'Cancel Order' },
        ];
    };

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
        <div className="min-h-screen bg-background font-primary p-2 mt-5 overflow-auto">
            {/* Header Card */}
            <div className="bg-card rounded-lg shadow-sm border border-border mb-4 transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className="p-4">
                    {/* Breadcrumb */}
                    <nav className="breadcrumb mb-3">
                        <ol className="flex items-center space-x-2 text-sm">
                            <li className="breadcrumb-item">
                                <Link
                                    to="/"
                                    className="text-secondaryText hover:text-primaryText transition-colors"
                                >
                                    Dashboard
                                </Link>
                            </li>
                            <li className="text-primaryText font-semibold">
                                Manage {status?.replace('_', ' ')} Orders
                            </li>
                        </ol>
                    </nav>

                    {/* Title and Search */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-primaryText font-primary">
                                Order Management
                            </h2>
                            <span className="bg-activeBg text-primary px-2 py-1 rounded text-xs font-semibold">
                                {filteredOrders.length} orders
                            </span>
                        </div>

                        <div className="relative flex-1 sm:flex-none sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-3 w-3 text-secondaryText" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-3 py-2 bg-card border border-border rounded-md text-sm text-primaryText placeholder-secondaryText focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-secondaryText text-sm">
                                No orders found
                            </div>
                        </div>
                    ) : (
                        <AdvancedTable
                            headers={orderHeaders}
                            data={formattedOrders}
                            alignments={{
                                amount: "right",
                                status: "center",
                                actions: "center",
                                payment_mode: "left",
                            }}
                            actionColumn="actions" // This will show actions column
                        />
                    )}

                    {/* Footer */}
                    {filteredOrders.length > 0 && (
                        <div className="mt-3 bg-card rounded-lg border border-border p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="bg-info text-black px-2 py-1 rounded text-xs font-semibold">
                                    {filteredOrders.length} filtered
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-secondaryText font-secondary">
                                    Rows per page:
                                </span>
                                <select
                                    value={rowsPerPage}
                                    onChange={handleChangeRowsPerPage}
                                    className="bg-background border border-border rounded text-xs text-primaryText font-secondary px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

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

            {/* Modals */}
            {selectedOrder && (
                <>
                    <AdvancedTableModal
                        open={openViewModal}
                        onClose={handleCloseViewModal}
                        title={`Order Details - ${selectedOrder?.order_id}`}
                        mode="view"
                        userData={[
                            {
                                key: "Order Number",
                                value: selectedOrder?.order_id,
                                align: "left",
                            },
                            {
                                key: "Name",
                                value: selectedOrder?.user_name,
                            },
                            {
                                key: "Email",
                                value: selectedOrder?.email,
                            },
                            {
                                key: "Mobile Number",
                                value: selectedOrder?.contact,
                            },
                            {
                                key: "Address",
                                value: selectedOrder?.address
                                    ? `${selectedOrder.address.name}, ${selectedOrder.address.addressLine}, ${selectedOrder.address.landmark ? selectedOrder.address.landmark + "," : ""} ${selectedOrder.address.city}, ${selectedOrder.address.state} - ${selectedOrder.address.pincode}`
                                    : "No address available",
                            },
                            {
                                key: "Order Date",
                                value: selectedOrder?.order_time
                                    ? new Date(selectedOrder.order_time).toLocaleString()
                                    : "-",
                            },
                        ]}
                        userColumns={[
                            { key: "key", label: "Field" },
                            { key: "value", label: "Details" },
                        ]}
                        orderData={selectedOrder?.orderItems?.map((item, index) => ({
                            sno: index + 1,
                            productId: item.tagno || item.sno || "-",
                            productImage: item.image_path,
                            productName: item.product_name,
                            price: item.price.toFixed(2),
                            total: (item.price * item.quantity).toFixed(2),
                        }))}
                        orderColumns={[
                            { key: "sno", label: "S.No", align: "left" },
                            { key: "productId", label: "Product ID", align: "left" },
                            { key: "productImage", label: "Product Image", align: "left" },
                            { key: "productName", label: "Product Name", align: "left" },
                            { key: "price", label: "Price", align: "right" },
                            { key: "total", label: "Total", align: "right" },
                        ]}
                        showNextArrow={false}
                        showTotal={true}
                        totalLabel="Grand Total"
                        totalValue={`₹${selectedOrder?.total_amount?.toFixed(2)}`}
                    />

                    <EditStatusModalTailwind
                        open={openEditModal}
                        onClose={handleCloseEditModal}
                        orderData={selectedOrder}
                        onSubmit={handleEditSubmit}
                        isLoading={updateOrderStatus.isLoading}
                        statusOptions={getStatusOptions()}
                        itemTableColumns={[
                            { key: "sno", label: "S.NO", align: "left" },
                            { key: "product", label: "Product", align: "left" },
                            { key: "price", label: "Price", align: "right" },
                            { key: "tagno", label: "Tag No", align: "center" }
                        ]}
                        itemTableData={selectedOrder?.orderItems || []}
                        userTableColumns={[]}
                        userTableData={selectedOrder || []}
                        errorMessage={formError}
                    />
                </>
            )}
        </div>
    );
};

// Simple icon components (replace with your actual icon components)
const ViewIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);

const EditIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
);

const SearchIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

export default OrderTable;