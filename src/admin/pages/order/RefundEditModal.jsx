// components/refund/RefundEditModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, MapPin, User, Phone, Calendar, Hash, Tag, IndianRupee, Truck, CheckCircle, XCircle } from 'lucide-react';

const RefundEditModal = ({ order, currentStatus, onUpdate, onClose }) => {

    console.log(order,'orderorder');

    const [rejectReason, setRejectReason] = useState('');
    const [refundMode, setRefundMode] = useState('ORIGINAL');
    const [showRejectInput, setShowRejectInput] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getStatusConfig = (status) => {
        const configs = {
            REQUESTED: { color: 'bg-yellow-100 text-yellow-800', icon: Package },
            APPROVED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
            BOOKED: { color: 'bg-purple-100 text-purple-800', icon: Truck },
            RECEIVED: { color: 'bg-green-100 text-green-800', icon: Package },
            REFUNDED: { color: 'bg-emerald-100 text-emerald-800', icon: IndianRupee },
            REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle },
            CANCELLED: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
        };
        return configs[status] || configs.REQUESTED;
    };

    const StatusIcon = getStatusConfig(currentStatus).icon;

    const getActionButtons = () => {
        switch (currentStatus) {
            case 'REQUESTED':
                return (
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="flex gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onUpdate('APPROVED', {})}
                                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <CheckCircle className="inline-block w-4 h-4 mr-2" />
                                Approve Refund
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowRejectInput(true)}
                                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <XCircle className="inline-block w-4 h-4 mr-2" />
                                Reject
                            </motion.button>
                        </div>

                        <AnimatePresence>
                            {showRejectInput && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-3"
                                >
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Enter rejection reason..."
                                        className="w-full p-3 border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        rows="3"
                                    />
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                if (rejectReason.trim()) {
                                                    onUpdate('REJECTED', { reason: rejectReason });
                                                }
                                            }}
                                            disabled={!rejectReason.trim()}
                                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Confirm Rejection
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setShowRejectInput(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );

            case 'APPROVED':
                return (
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Courier Tracking ID
                            </label>
                            <input
                                type="text"
                                value={trackingId}
                                onChange={(e) => setTrackingId(e.target.value)}
                                placeholder="Enter tracking ID"
                                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                autoFocus
                            />
                        </div> */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onUpdate('BOOKED')}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Truck className="inline-block w-4 h-4 mr-2" />
                            Book Pickup
                        </motion.button>
                    </motion.div>
                );

            case 'BOOKED':
                return (
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-purple-800 font-medium mb-2">Tracking Information</p>
                            <p className="text-sm text-purple-600">ID: {order.courierTrackingId || 'Not available'}</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onUpdate('RECEIVED', {})}
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            <Package className="inline-block w-4 h-4 mr-2" />
                            Mark as Received
                        </motion.button>
                    </motion.div>
                );

            case 'RECEIVED':
                return (
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Refund Mode
                            </label>
                            <select
                                value={refundMode}
                                onChange={(e) => setRefundMode(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="ORIGINAL">Original Payment Method</option>
                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                <option value="UPI">UPI</option>
                                <option value="STORE_CREDIT">Store Credit</option>
                            </select>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onUpdate('REFUNDED', { refundMode })}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            <IndianRupee className="inline-block w-4 h-4 mr-2" />
                            Process Refund
                        </motion.button>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    const totalRefundAmount = order.total_amount??0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 mt-[55px] overflow-y-auto"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200  z-10">
                    <div className="flex justify-between items-start bg-[#DEDDDD] p-2">
                        <div >
                            <h2 className="text-lg font-bold m-0">Refund Request #{order.return_id}</h2>
                            <p className="text-sm m-0">Order ID: {order.order_id}</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </motion.button>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-2 flex items-center gap-2 p-2 ">
                        <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusConfig(currentStatus).color}`}>
                            <StatusIcon className="w-4 h-4 mr-2" />
                            {currentStatus}
                        </div>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">Created: {formatDate(order.createdTime)}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-2 space-y-3">
                    {/* Customer Information */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-50 rounded-lg p-2"
                    >
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Customer Details
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-xs text-gray-500 m-0">Name</p>
                                <p className="text-sm font-medium m-0 ">{order.user_name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 m-0">Phone</p>
                                <p className="text-sm font-medium flex items-center m-0">
                                    <Phone className="w-3 h-3 mr-1" />
                                    {order.contact}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Reason */}
                    {order.reason && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-yellow-50 rounded-lg py-2 px-4"
                        >
                            <h3 className="text-sm font-semibold text-yellow-800 mb-1">Refund Reason</h3>
                            <p className="text-sm text-yellow-700 m-0">{order.reason}</p>
                        </motion.div>
                    )}

                    {/* Addresses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {/* Origin Address */}
                        {order.origin_address && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gray-50 rounded-lg p-2"
                            >
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    Pickup Address
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p className="font-medium m-0">{order.origin_address.name}</p>
                                    <p className="text-gray-600 m-0">{order.origin_address.address_line}</p>
                                    <p className="text-gray-600 m-0">
                                        {order.origin_address.city}, {order.origin_address.state} - {order.origin_address.pincode}
                                    </p>
                                    <p className="text-gray-600 flex items-center m-0">
                                        <Phone className="w-3 h-3 mr-1" />
                                        {order.origin_address.phone}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Destination Address */}
                        {order.destination_address && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gray-50 rounded-lg p-4"
                            >
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    Return Address
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p className="font-medium">{order.destination_address.name}</p>
                                    <p className="text-gray-600">{order.destination_address.address_line}</p>
                                    <p className="text-gray-600">
                                        {order.destination_address.city}, {order.destination_address.state} - {order.destination_address.pincode}
                                    </p>
                                    <p className="text-gray-600 flex items-center">
                                        <Phone className="w-3 h-3 mr-1" />
                                        {order.destination_address.phone}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Items */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-gray-50 rounded-lg p-2"
                    >
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <Package className="w-4 h-4 mr-2" />
                            Items ({order.items?.length || 0})
                        </h3>
                        <div className="space-y-2">
                            {order.orderItems?.map((item, index) => (
                                <motion.div
                                    key={item.itemid || index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (index * 0.05) }}
                                    className="bg-white rounded-lg p-3 border border-gray-200"
                                >
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Item ID</p>
                                            <p className="text-sm font-medium">{item.itemid}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Tag No</p>
                                            <p className="text-sm font-medium">{item.tagno || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Quantity</p>
                                            <p className="text-sm font-medium">{item.quantity}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Refund Amount</p>
                                            <p className="text-sm font-medium text-green-600">{formatCurrency(item.price)}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Total Refund Amount</span>
                            <span className="text-lg font-bold text-green-600">{formatCurrency(totalRefundAmount)}</span>
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="border-t border-gray-200 pt-6"
                    >
                        <AnimatePresence mode="wait">
                            {getActionButtons()}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default RefundEditModal;