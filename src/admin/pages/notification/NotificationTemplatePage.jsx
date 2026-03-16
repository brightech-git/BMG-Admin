import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdvancedTable from "../../components/table/ResponsiveTable";
import { useAllTemplates, useDeleteTemplate } from "../../hooks/notificationTemplates/useNotificationTemplates";
import { usePushNotification } from "../../hooks/notification/useNotificationQuery";
import { Pencil, Trash2, Send, Plus, X, CheckCircle, AlertCircle } from "lucide-react";
import TemplateFormModal from "./TemplateFormModal";
import { getProductImages } from "../../../utils/mediaUtils/mediaUtils";
import {Toast} from '../../components/toast/Toast';


// Loading overlay component
const LoadingOverlay = ({ isVisible, message }) => {
    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white bg-opacity-10 backdrop-blur-sm z-50 flex items-center justify-center"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center gap-3"
            >
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-[#cd865c] rounded-full animate-spin"></div>
                </div>
                <p className="text-sm text-gray-600 font-medium">{message || "Processing..."}</p>
            </motion.div>
        </motion.div>
    );
};

// Delete confirmation modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg max-w-md w-full shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                        <AlertCircle size={24} className="text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-center mb-2">Confirm Deletion</h3>
                    <p className="text-sm text-gray-600 text-center mb-6">
                        Are you sure you want to delete this notification template? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 bg-red-600 rounded-lg text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Send notification button with loading state
const SendButton = ({ onClick, isLoading, disabled }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`p-1.5 rounded-full transition-all relative ${isLoading
                    ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
            title="Send to All"
        >
            {isLoading ? (
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <Send size={16} />
            )}
        </motion.button>
    );
};

const NotificationTemplatePage = () => {
    const { data: templates, isLoading, isError, error, refetch } = useAllTemplates();
    const deleteMutation = useDeleteTemplate();
    const pushMutation = usePushNotification();
    const BASE_URL = "https://app.bmgjewellers.com";

    const [showForm, setShowForm] = useState(false);
    const [editTemplate, setEditTemplate] = useState(null);
    const [sendingStates, setSendingStates] = useState({});
    const [toast, setToast] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, template: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const templateData =
        templates?.map((t, i) => ({
            sno: i + 1,
            ...t,
        })) ?? [];

    const finalData = templateData?.reverse();

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleDeleteNotification = (row) => {
        setDeleteModal({ isOpen: true, template: row });
    };

    const confirmDelete = () => {

        if (!deleteModal.template) return;
      
        console.log(deleteModal,'deleteModal')
        setIsDeleting(true);
        deleteMutation.mutate(deleteModal.template.Id, {
            onSuccess: () => {
                setIsDeleting(false);
                setDeleteModal({ isOpen: false, template: null });
                refetch();
                showToast("Notification template deleted successfully!", "success");
            },
            onError: (error) => {
                setIsDeleting(false);
                setDeleteModal({ isOpen: false, template: null });
                showToast(error?.message || "Failed to delete template", "error");
            }
        });
    };

    const handleSendNotification = (row) => {
        const templateId = row.id || row.Id;

        setSendingStates(prev => ({ ...prev, [templateId]: true }));

        pushMutation.mutate(
            {
                title: row.Title,
                message: row.Message,
                imageUrl: `${BASE_URL}${row.ImageUrl}`,
                url: row.Url,
            },
            {
                onSuccess: () => {
                    setSendingStates(prev => ({ ...prev, [templateId]: false }));
                    showToast("Notification sent successfully to all users!", "success");
                },
                onError: (error) => {
                    setSendingStates(prev => ({ ...prev, [templateId]: false }));
                    showToast(error?.message || "Failed to send notification", "error");
                },
            }
        );
    };

    const headers = [
        { key: "Id", label: "Temp Id", align: "center" },
        { key: "Title", label: "Title" },
        { key: "Message", label: "Message" },
        { key: "ImageUrl", label: "Image", align: "center" },
        { key: "Url", label: "Redirect Url" },
        { key: "actions", label: "Actions", align: "center" },
    ];

    const renderCell = (key, row) => {
        if (key === "sno") return row.sno;

        if (key === "ImageUrl") {
            return (
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex justify-center"
                >
                    <img
                        src={getProductImages(row.ImageUrl)}
                        alt={row.Title || "template"}
                        className="w-10 h-10 rounded object-cover border border-gray-200 shadow-sm"
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/40?text=No+Image";
                        }}
                    />
                </motion.div>
            );
        }

        if (key === "actions") {
            const templateId = row.id || row.Id;
            const isSending = sendingStates[templateId];

            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2"
                >
                    {!row.singleUser && (
                        <SendButton
                            onClick={() => handleSendNotification(row)}
                            isLoading={isSending}
                            disabled={isSending}
                        />
                    )}

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-all"
                        title="Edit"
                        onClick={() => {
                            setEditTemplate(row);
                            setShowForm(true);
                        }}
                    >
                        <Pencil size={16} />
                    </motion.button>

                    {!row.singleUser && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-all"
                            title="Delete"
                            onClick={() => handleDeleteNotification(row)}
                        >
                            <Trash2 size={16} />
                        </motion.button>
                    )}
                </motion.div>
            );
        }

        if (key === "Url" && row[key]) {
            return (
                <a
                    href={row[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline text-xs truncate max-w-[200px] block"
                    title={row[key]}
                >
                    {row[key].length > 30 ? `${row[key].substring(0, 30)}...` : row[key]}
                </a>
            );
        }

        return row[key];
    };

    const anySending = Object.values(sendingStates).some(state => state);

    return (
        <div className="p-2 sm:p-6 mt-4 bg-gray-50">
            {/* Toast Notifications */}
            <AnimatePresence>
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModal.isOpen && (
                    <DeleteConfirmationModal
                        isOpen={deleteModal.isOpen}
                        onClose={() => setDeleteModal({ isOpen: false, template: null })}
                        onConfirm={confirmDelete}
                        isDeleting={isDeleting}
                    />
                )}
            </AnimatePresence>

            {/* Loading Overlay for sending notifications */}
            <AnimatePresence>
                {anySending && (
                    <LoadingOverlay
                        isVisible={anySending}
                        message="Sending notifications to all users..."
                    />
                )}
            </AnimatePresence>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
                {/* Header */}
                <div className="p-3 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-lg font-semibold">Notification Templates</h1>
                        <p className="text-sm text-gray-500">
                            Manage and send notifications to all users
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 bg-[#cd865c] text-white px-2 py-1.5 rounded-lg hover:bg-[#b6744d] transition-colors shadow-sm"
                        onClick={() => {
                            setEditTemplate(null);
                            setShowForm(true);
                        }}
                    >
                        <Plus size={18} />
                        <span className="text-xs font-medium">Create Template</span>
                    </motion.button>
                </div>

                {/* Stats/Info Bar */}
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Total Templates:</span>
                        <span className="text-sm font-semibold text-gray-700">{finalData?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Bulk Templates:</span>
                        <span className="text-sm font-semibold text-gray-700">
                            {finalData?.filter(t => !t.singleUser)?.length || 0}
                        </span>
                    </div>
                </div>

                {/* Table */}
                <div className="p-2">
                    <AdvancedTable
                        headers={headers}
                        data={finalData}
                        isLoading={isLoading}
                        isError={isError}
                        error={error}
                        onRetry={refetch}
                        renderCell={renderCell}
                        fontSizeHeader="text-sm"
                        fontSizeRow="text-xs"
                        actionColumn="actions"
                        emptyMessage="No notification templates found"
                    />
                </div>
            </motion.div>

            {/* Form Modal for Create/Edit */}
            <AnimatePresence>
                {showForm && (
                    <TemplateFormModal
                        editData={editTemplate}
                        onClose={() => setShowForm(false)}
                        onSuccess={() => {
                            setShowForm(false);
                            refetch();
                            showToast(
                                editTemplate ? "Template updated successfully!" : "Template created successfully!",
                                "success"
                            );
                        }}
                        tempCollection={templateData}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationTemplatePage;