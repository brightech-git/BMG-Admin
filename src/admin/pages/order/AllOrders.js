import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link, useLocation ,useParams} from 'react-router-dom';
import { useUpdateOrderStatus, useOrdersByStatus } from '../../hooks/order/useAllOrder.js';
import BackdropProgress from '../../components/backDrop/BackdropProgress.jsx';
import Snackbar from '../../components/snackBar/Snackbar.jsx';
import EditStatusModalTailwind from '../../components/modal/EditStatusModalTailwind.jsx';
import AdvancedTable from '../../components/table/ResponsiveTable.jsx';
import StatusChip from '../../components/statusChip/StatusChip.jsx';
import { useCreateConsignment } from '../../hooks/shipping/useCreateConsignment.js';
import { useAddressQuery } from '../../hooks/address/useAddressQuery.js'
import { getProductImages } from '../../../utils/mediaUtils/mediaUtils.js';
import { useLabelQuery } from '../../hooks/shipping/useLabelQuery';
import OrderStatusNotification from '../../components/notifications/OrderStatusNotification.jsx';
import NotificationTemplate from '../../components/notifications/NotificationTemplate.jsx';
import { Bell, TrainTrackIcon } from "lucide-react";
import { FaRoute } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OrderTable = () => {
    
    const { orderStatus }= useParams();
    const navigate = useNavigate();


    // Redirect if orderStatus is not present
    useEffect(() => {
        if (!orderStatus) {
            navigate('/', { replace: true });
        }
    }, [orderStatus, navigate]);

    const [downloadLabel, setDownloadLabel] =useState(false)

    const [statusUpdated, setStatusUpdated] = useState(false);
    const [sendPendingNotification , setSendPendingNotification] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        type: "info"
    });

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [inputSearch, setInputSearch] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openEditModal, setOpenEditModal] = useState(false);

    const [searchScope, setSearchScope] = useState("PAGE"); // PAGE | ALL
    const [appliedFilter, setAppliedFilter] = useState(null);

    const [showNotification, setShowNotification] = useState(false);
    const [notificationPayload, setNotificationPayload] = useState(null);
    
    const [editForm, setEditForm] = useState({
        status: '',
        remarks: '',
        paymentMode: '',
        paymentStatus: '',
    });
    const [formError, setFormError] = useState('');
    const [progress, setProgress] = useState(0);
    const [showBackdrop, setShowBackdrop] = useState(false);

    const status = orderStatus || "PENDING";

    const { data, isLoading, isError, error, refetch } = useOrdersByStatus(status, page, rowsPerPage, appliedSearch);
    const createConsignmentMutation = useCreateConsignment();
    const updateOrderStatus = useUpdateOrderStatus();
    const { useGetAllAddresses } = useAddressQuery();
    const { data: addressesData } = useGetAllAddresses();


    const addresses = Array.isArray(addressesData) ? addressesData : [];

    const currentPage = page + 1;               // for UI (1-based)
    const totalPages = data?.totalPages ?? 1;
    const hasMorePage = data?.hasMore ?? false;
    const totalOrdersByStatus = data?.totalByStatus ?? 1;



    const notificationStatus = {
        placed: {
            current: "placed",
            next: "in_processing",
        },
        in_processing: {
            current: "in_processing",
            next: "packing",
        },
        packing: {
            current: "packing",
            next: "ready_to_ship",
        },
        ready_to_ship: {
            current: "ready_to_ship",
            next: "shipped",
        },
        shipped: {
            current: "shipped",
            next: "in_transit",
        },
        in_transit: {
            current: "in_transit",
            next: "out_for_delivery",
        },
        out_for_delivery: {
            current: "out_for_delivery",
            next: "delivered",
        },

        delivered: {
            current: "delivered",
            next: null,
        },
        cancelled: {
            current: "cancelled",
            next: null,
        },
        pending: {
            current: "pending",
            next: "in_processing", // or whatever makes sense in your flow
        },
    }; 
    // Find default origin address safely
    const defaultOriginAddress = useMemo(() => {
        if (!addresses.length) return null;

        // If default address is stored as default: true
        return addresses.find(a => a.isDefault === true) || null;

        // If your backend uses default === false for default (rare case)
        // return addresses.find(a => a.default === false) || null;
    }, [addresses]);

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
        courierTrackingId: order.courierTrackingId || 'N/A',
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

    const labelPayload = {
        reference_number: selectedOrder?.courierTrackingId || 'NA',
        label_code: "SHIP_LABEL_4X6",
        label_format: "pdf"
    };

    const {
        data: labelData,
        isLoading: isLabelLoading,
        isError: isLabelError,
        error: labelError,
    } = useLabelQuery(labelPayload, {
        enabled: status?.toLowerCase() === "ready_to_ship" && !!selectedOrder?.courierTrackingId,
    });

   
    useEffect(()=>{
        if (status.toLowerCase() === 'ready_to_ship') {
          setDownloadLabel(true);
        }
        else{
            setDownloadLabel(false)
        }
    },[status,orderStatus]);

    const handleSearch = () => {
        if (!inputSearch.trim()) return;

        setPage(0);

        if (searchScope === "ALL") {
            setRowsPerPage(orders?.totalByStatus || 1000);
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




const handleDownloadLabel = () => {
    if (!labelData) return;
    window.open(labelData, "_blank");
    const link = document.createElement("a");
    link.href = labelData;
    link.download = `label_${labelPayload.reference_number}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        //Notification
        
       
       
    };

    const handleTrackOrder = (order) =>{
        setSelectedOrder(order);
        const OrderId = order.order_id;
        navigate(`/track/order/${OrderId}`);

    }

    
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

    // ────────────────────────────────────────────────────────────────
    // MAIN SUBMIT – Consignment + Label + Status Update
    // ────────────────────────────────────────────────────────────────
    const buildConsignment = (order, origin) => {
        const consignment = {
            customer_code: "EO2243",
            service_type_id: "B2C SMART EXPRESS",
            load_type: "NON-DOCUMENT",

            // PRODUCT DESCRIPTION
            description: order.orderItems.map(i => i.product_name).join(", "),

            dimension_unit: "cm",

            // REQUIRED TOP-LEVEL DIMENSIONS (must be present)
            length: "3",
            width: "5",
            height: "3",

            // REQUIRED TOP-LEVEL WEIGHT
            weight: "5",

            declared_value: order.total_amount.toString(),
            num_pieces: order.orderItems.length.toString(),
          
            origin_details: {
                name: origin.name,
                phone: origin.phone,
                alternate_phone: origin.alternatePhone || "",
                address_line_1: origin.addressLine1,
                address_line_2: origin.addressLine2 || "",
                pincode: origin.pincode,
                city: origin.city,
                state: origin.state,
                country: "India",
            },

            destination_details: {
                name: order.address.name,
                phone: order.address.phone,
                alternate_phone: order.address.alternatePhone || order.address.phone,
                address_line_1: order.address.addressLine,
                address_line_2: order.address.landmark || "",
                pincode: order.address.pincode,
                city: order.address.city,
                state: order.address.state,
                country: "India",
            },

            return_details: {
                name: origin.name,
                phone: origin.phone,
                alternate_phone: origin.alternatePhone || "",
                address_line_1: origin.addressLine1,
                address_line_2: origin.addressLine2 || "",
                pincode: origin.pincode,
                city: origin.city,
                state: origin.state,
                country: "India",
            },

            customer_reference_number: order.order_id,
            commodity_id: "COM005",
            is_risk_surcharge_applicable: false,

            invoice_number: `INV${order.order_id}`,
            invoice_date: new Date().toISOString().split("T")[0],

            // ITEM-WISE DETAILS
            pieces_detail: order.orderItems.map((it) => ({
                description: it.product_name,
                declared_value: it.price.toString(),
                weight: "5",
                length: "30",
                width: "20",
                height: "15",
            })),
        };
        console.log(order.payment_mode ,'paymentmode')

        if (order?.payment_mode?.toLowerCase() !== "online") {
            consignment.cod_collection_mode = "cash";
            consignment.cod_amount = order.total_amount.toString();
        }
        

        return consignment;
    };



    const handleEditSubmit = async (formData) => {
        const currentStatus = selectedOrder.status?.toUpperCase();
        const newStatus = formData.status?.toUpperCase();

        if (!newStatus) {
            setSnackbar({ open: true, message: "Status is required.", type: "error" });
            return;
        }

        if (newStatus === "CANCELLED" && !formData.remarks?.trim()) {
            setFormError("Remarks are required when cancelling an order.");
            return;
        }

        if (currentStatus === newStatus) {
            setFormError("Please change the order status.");
            return;
        }

        setShowBackdrop(true);
        setProgress(0);
        let progressInterval;

        try {
            const payload = {
                orderId: selectedOrder.order_id,
                newStatus: newStatus,
                remarks: formData.remarks,
                paymentMode: editForm.paymentMode,
                paymentStatus: editForm.paymentStatus,
            };

            // Simulate progress
            progressInterval = setInterval(() => {
                setProgress(prev => Math.min(Math.floor(prev + Math.random() * 5), 90));
            }, 150);

            // ── CANCELLED ───────────────────────
            if (newStatus === "CANCELLED") {
                await updateOrderStatus.mutateAsync(payload);
                clearInterval(progressInterval);
                setProgress(100);
                setSnackbar({ open: true, message: "Order cancelled successfully!", type: "success" });

                // Build notification with updated status
                const notiPayload = buildNotificationPayload(
                    selectedOrder, // ensure payload reflects new status
                    "order-cancel"
                );
                setNotificationPayload(notiPayload);
                setStatusUpdated(true);

                setTimeout(() => {
                    setShowBackdrop(false);
                    setSnackbar({ open: true, message: "Notification sent to the user successfully!", type: "success" });
                    refetch();
                    handleCloseEditModal();
                    setStatusUpdated(false);
                }, 600);

                return; // ✅ important: stop further execution
            }

            // ── PACKING → READY_TO_SHIP: Create Consignment ─────────────
            if (currentStatus === "PACKING" && newStatus === "READY_TO_SHIP") {
                if (!defaultOriginAddress) throw new Error("Default origin address not found.");

                const consignment = buildConsignment(selectedOrder, defaultOriginAddress);
                const consignmentPayload = { consignments: [consignment] };

                const consignmentResponse = await createConsignmentMutation.mutateAsync(consignmentPayload);
                const result = consignmentResponse?.data?.[0];
                if (!result?.success || !result?.reference_number) {
                    throw new Error(result?.message || "Consignment creation failed");
                }

                setSnackbar({
                    open: true,
                    message: `Consignment created & Label generated`,
                    type: "success",
                });
            }

            // ── FINAL: Update Order Status ───────────────────────
            await updateOrderStatus.mutateAsync(payload);
            clearInterval(progressInterval);
            setProgress(100);

            // Build notification payload for normal updates
            const notiPayload = buildNotificationPayload(selectedOrder,
                "order-status-update"
            );
            setNotificationPayload(notiPayload);

            setStatusUpdated(true);
            setSnackbar({ open: true, message: "Order updated successfully!", type: "success" });

            setTimeout(() => {
                setShowBackdrop(false);
                setSnackbar({ open: true, message: "Notification sent to the user successfully!", type: "success" });
                refetch();
                handleCloseEditModal();
                setStatusUpdated(false);
            }, 600);

        } catch (err) {
            clearInterval(progressInterval);
            setProgress(0);
            setShowBackdrop(false);
            setSnackbar({ open: true, message: `Failed: ${err.message}`, type: "error" });
            setStatusUpdated(false);
        }
    };



    const buildNotificationPayload = (selectedOrder, tempKey) => {
        if (!selectedOrder) return null;

        const formattedTime = new Date().toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });
        
        const status = selectedOrder.status?.toLowerCase()?.trim();
        const currentStatus = notificationStatus[status]?.current || status;

        const userName = selectedOrder?.user_name?.toUpperCase();
        const userId = selectedOrder?.address?.customerId;
        const orderId = selectedOrder?.order_id || selectedOrder?.id;
        const imageUrl = selectedOrder?.orderItems?.[0]?.image_path || null;
        const trackingNumber =
            selectedOrder?.courierTrackingId &&
                selectedOrder.courierTrackingId !== "N/A"
                ? selectedOrder.courierTrackingId
                : null;
        const totalAmount = selectedOrder?.total_amount || 0;

        // ✅ Determine tempKey based on status if not explicitly passed
        if (!tempKey) {
            switch (status) {
                case "pending":
                    tempKey = "order-pending";
                    break;

                case "placed":
                    tempKey = "order-placed";
                    break;

                case "shipped":
                    tempKey = "order-shipped";
                    break;

                case "delivered":
                    tempKey = "order-delivered";
                    break;
                case "cancelled":
                    tempKey = "order-cancel";

                default:
                    console.warn("⚠️ Unknown order status, notification skipped:", status);
                    return null;
            }
        }

        return {
            userId,
            tempKey,
            imageUrl,
            data: {
                orderId,
                status,
                userName,
                totalAmount,
                trackingNumber, // optional, handled in template
                formattedTime,
                currentStatus
            },
        };
    };



    
   
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
                { value: 'READY_TO_SHIP', label: 'Move to Ready to Ship' },
                { value: 'CANCELLED', label: 'Cancel Order' },
            ],

        };

        return statusFlow[status] || [];
    };

  
    console.log(selectedOrder?.status || null, 'console')
    console.log(notificationStatus[selectedOrder?.status?.toLowerCase()]?.current || null ,'currentStatus')
  
    const orderHeaders = [
        { key: "order_id", label: "Order ID", align: "left" },
        { key: "customer", label: "Customer", align: "left" },
        { key: "amount", label: "Amount", align: "right" },
        { key: "status", label: "Status", align: "center" },
        { key: "order_date", label: "Order Date", align: "left" },
        { key: "payment_mode", label: "Payment Mode", align: "center" },
        { key: "actions", label: "Actions", align: "center" },
    ];

    const NON_EDITABLE_STATUSES = ["shipped", "cancelled", "delivered" , "pending"];

    const sendNotificationIcon = [ "pending" ]
    
    const formattedOrders = orders.map(order => ({
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
        actions: (
            <div className="flex items-center justify-center gap-1">
                {/* VIEW ORDER */}
                {/* <div className="relative group inline-flex">
                    <button
                        onClick={() => handleViewOrder(order)}
                        className="btn-icon-primary p-1 rounded-md transition-colors"
                    >
                        <ViewIcon className="w-4 h-4" />
                    </button>
                    <span className="tooltip">View Order</span>
                </div> */}

                {/* EDIT ORDER */}
                {!NON_EDITABLE_STATUSES.includes(order.status.toLowerCase()) && (
                    <div className="relative group inline-flex">
                        <button
                            onClick={() => handleEditOrder(order)}
                            className="btn-icon-warning p-1 rounded-md transition-colors"
                        >
                            <EditIcon className="w-4 h-4" />
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
                        <FaRoute className="w-4 h-4" />
                    </button>
                    <span className="tooltip">Track Order</span>
                </div>

                {/* SEND NOTIFICATION */}
                {sendNotificationIcon.includes(order.status.toLowerCase()) && (
                    <div className="relative group inline-flex">
                        <button
                            onClick={() => {
                                const payload = buildNotificationPayload(order); // ✅ FIXED

                                if (!payload) return;

                                setSelectedOrder(order);
                                setNotificationPayload(payload);
                                setSendPendingNotification(true);
                            }}
                            className="p-1 rounded-md border border-gray-300
            hover:bg-gray-100 text-gray-700 transition-colors"
                        >
                            <Bell className="w-3 h-3" />
                        </button>
                        <span className="tooltip">Send Notification</span>
                    </div>
                )}
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
                            <h2 className="text-base sm:text-xl font-bold text-primaryText font-primary">
                                Order Management
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
                                    <SearchIcon className="h-4 w-4 text-secondaryText" />
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
                           actionColumn="actions" // This will show actions column
                           actionOptions ={getStatusOptions()}
                            headerBg='bg-[var(--primary-text-color)]'
                            headerText='text-[var(--white-color)]'

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
                        downloadLabel={downloadLabel}
                        onDownload={handleDownloadLabel}
                    />
                   
                    {selectedOrder && notificationPayload && (
                        <NotificationTemplate
                            payload={notificationPayload}
                            onSuccess={() =>
                                setSnackbar({
                                    open: true,
                                    message: "Notification sent",
                                    type: "success",
                                })
                            }
                            onClose={() => setSendPendingNotification(false)}
                            trigger={sendPendingNotification || statusUpdated}
                            key={`${selectedOrder.order_id}-${notificationPayload.tempKey}`}
                        />
                    )}

                 
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