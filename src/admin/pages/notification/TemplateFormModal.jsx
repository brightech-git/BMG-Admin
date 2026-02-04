import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "animate.css";
import { X, UploadCloud, Image as ImageIcon } from "lucide-react";
import {
    useCreateTemplate,
    useUpdateTemplate,
} from "../../hooks/notificationTemplates/useNotificationTemplates";
import SmartDateInput  from "../../components/date&Time/SmartDateInput";
import TimePicker from "../../components/date&Time/TimePicker";
import Snackbar from "../../components/snackBar/Snackbar";


const TemplateFormModal = ({ editData, onClose, onSuccess ,tempCollection }) => {

    console.log(tempCollection,'tempCollection');
    const isEdit = !!editData;
    const BASE_URL = "https://app.bmgjewellers.com";

    const createMutation = useCreateTemplate();
    const updateMutation = useUpdateTemplate(editData?.Id);

    const isLoading = createMutation.isPending || updateMutation.isPending;

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [url, setUrl] = useState("");
    const [singleUser, setSingleUser] = useState(false);
    const [image, setImage] = useState(null);
    const [tempKey ,setTempKey] = useState();
    const [scheduledDate, setScheduledDate] = useState();
    const [scheduledTime, setScheduledTime] = useState(null);
    const [scheduledDateTime, setScheduledDateTime] = useState(null);
    const [existingImagePath, setExistingImagePath] = useState("");
    const [previewImage, setPreviewImage] = useState("");

    console.log(scheduledTime, scheduledDate,'scheduledDate');

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        type: "info",
        title: "",
    });

    // Combine date and time when they change
    useEffect(() => {
        if (scheduledDate && scheduledTime && scheduledTime.backend) {
            const combinedDateTime = `${scheduledDate} ${scheduledTime.backend}:00`;
            setScheduledDateTime(combinedDateTime);
            console.log('Formatted datetime for API:', combinedDateTime);
        } else {
            setScheduledDateTime(null);
        }
    }, [scheduledDate, scheduledTime]);

    useEffect(() => {
        if (isEdit && editData) {
            setTitle(editData.Title);
            setMessage(editData.Message);
            setUrl(editData.Url);
            setSingleUser(editData.singleUser || false);
            setTempKey(editData.Temp_Key)
            setScheduledDateTime(editData.ScheduledTime || null)
            setExistingImagePath(
                `${BASE_URL}${Array.isArray(editData.ImageUrl)
                    ? editData.ImageUrl[0]
                    : editData.ImageUrl}`
            );
        }
    }, [editData]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);

        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => setPreviewImage(reader.result);
        reader.readAsDataURL(file);
    };

    // Inside TemplateFormModal.jsx
    const getMinTimeForSelectedDate = () => {
        if (!scheduledDate) return undefined;

        const today = new Date();
        const selected = new Date(scheduledDate);

        const isToday =
            today.getFullYear() === selected.getFullYear() &&
            today.getMonth() === selected.getMonth() &&
            today.getDate() === selected.getDate();

        if (isToday) {
            const hours = String(today.getHours()).padStart(2, "0");
            const minutes = String(today.getMinutes()).padStart(2, "0");
            return `${hours}:${minutes}`;
        }

        return undefined;
    };

    //---------------------------Validation -----------------------------
    const normalizeTempKey = (key) =>
        key?.toLowerCase().trim().replace(/\s+/g, "-");

    const isTempKeyDuplicate = () => {
        if (!tempKey) return false;

        const normalizedKey = normalizeTempKey(tempKey);

        return tempCollection.some((item) => {
            // Ignore the same record when editing
            if (isEdit && item.Id === editData.Id) return false;

            return normalizeTempKey(item.Temp_Key) === normalizedKey;
        });
    };




    //---------------------Submit -----------------------

    const handleSubmit = () => {
        if (isLoading) return;

        if (!tempKey) {
            setSnackbar({
                open: true,
                type: "error",
                title: "Validation Error",
                message: "Template Key is required",
            });
            return;
        }

        if (isTempKeyDuplicate()) {
            setSnackbar({
                open: true,
                type: "error",
                title: "Duplicate Template Key",
                message: "This Template Key already exists. Please use a unique key.",
            });
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("message", message);
        formData.append("url", url);
        formData.append("singleUser", singleUser);
        formData.append("tempKey", normalizeTempKey(tempKey));

        if (scheduledDateTime) {
            formData.append("scheduledTime", scheduledDateTime);
        }

        if (image) formData.append("image", image);

        const mutation = isEdit ? updateMutation : createMutation;

        mutation.mutate(formData, {
            onSuccess: () => {
                setSnackbar({
                    open: true,
                    type: "success",
                    title: "Success",
                    message: isEdit
                        ? "Template updated successfully"
                        : "Template created successfully",
                });
                onSuccess?.();
            },
            onError: (err) => {
                setSnackbar({
                    open: true,
                    type: "error",
                    title: "Error",
                    message:
                        err?.response?.data?.message ||
                        "Something went wrong. Please try again.",
                });
            },
        });
    };


    return (
        <>
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 mt-[50px] flex items-center justify-center bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.92, y: 40, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: 20, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="animate__animated animate__fadeInUp bg-white w-full max-w-2xl rounded-xl shadow-2xl  relative"
                >
                    <div id="datepicker-portal">
                    {/* Header */}
                    <div className="flex bg-[var(--primary-text-color)]  justify-between items-center mb-2 p-2 ">
                        <div>
                            <h2 className="text-sm font-semibold text-[var(--white-color)] m-0">
                                {isEdit ? "Edit Notification Template" : "Create Notification Template"}
                            </h2>
                            <p className="text-xs text-[var(--primary-color)] m-0">
                                Configure message, image & delivery scope
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-1 rounded-md hover:bg-[var(--primary-text-color)] transition"
                        >
                            <X className="w-4 h-4 text-[var(--white-color)]" />
                        </button>
                    </div>

                    {/* Form */}
                    <div className="space-y-2 text-xs p-2 animate__animated animate__fadeInUp  max-h-[400px] sm:max-h-[600px] overflow-y-auto">

                        {/* Title */}
                        <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 items-center">
                            <label className="font-medium text-gray-700">
                                Template Title :
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter template title"
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>

                        {/* Message */}
                        <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 items-start">
                            <label className="font-medium text-gray-700 pt-2">
                                Notification Message :
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={3}
                                placeholder="Type notification message"
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition"
                            />
                        </div>
                        {/* Template Key */}
                        <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 items-center">
                            <label className="font-medium text-gray-700">
                                Template Key :
                            </label>
                            <input
                                type="text"
                                value={tempKey}
                                onChange={(e) => setTempKey(e.target.value)}
                                placeholder="Enter template key"
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>

                        {/* Redirect URL */}
                        <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 items-center">
                            <label className="font-medium text-gray-700">
                                Redirect URL : 
                            </label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com"
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>

                        {/* Single User */}
                        <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 items-center">
                            <label className="font-medium text-gray-700">
                                Audience :
                            </label>
                            <label className="flex items-center gap-2 bg-gray-50 border rounded-md px-3 py-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={singleUser}
                                    onChange={(e) => setSingleUser(e.target.checked)}
                                    className="accent-blue-600"
                                />
                                <span className="text-gray-700">
                                    Send to a single user only
                                </span>
                            </label>
                        </div>
                            <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 items-center">
                                <label className="font-medium text-gray-700">
                                    Scheduled Time :
                                </label>

                                <div className="relative w-full space-y-2">
                                    <div className="flex items-center gap-0">
                                        {/* Date Picker */}
                                        <SmartDateInput
                                            value={scheduledDate}
                                            onChange={(backendDate) => {
                                                console.log("Send date to backend:", backendDate);
                                                setScheduledDate(backendDate);
                                            }}
                                            prevDisable={true}
                                            onClickOpen={() => console.log("Calendar opened")}
                                        />
                                        {/* Time Picker */}
                                        <TimePicker
                                                value={scheduledTime}
                                                minTime={getMinTimeForSelectedDate()}
                                                onChange={(val) => {
                                                setScheduledTime(val);
                                                console.log("Display:", val.display);   // 03:45 PM
                                                console.log("Backend:", val.backend);   // 15:45
                                            }}
                                        />
                                    </div>
                              
                                </div>
                            </div>

                      

                        {/* Image Upload */}
                        <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 items-start">
                            <label className="font-medium text-gray-700 pt-2">
                                Notification Image :
                            </label>

                            <label className="group border-dashed border-2 rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition bg-gray-50">
                                <UploadCloud className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                                <span className="text-xs mt-1 text-gray-500">
                                    {image || existingImagePath ? "Change Image" : "Upload Image"}
                                </span>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </div>

                        {/* Image Preview */}
                        {(previewImage || existingImagePath) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex justify-center mt-3"
                            >
                                <img
                                    src={previewImage || existingImagePath}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                                />
                            </motion.div>
                        )}

                    </div>



                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-2 p-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="px-4 py-1.5 rounded-md border text-xs text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </motion.button>
                            <motion.button
                                whileHover={!isLoading ? { scale: 1.05 } : {}}
                                whileTap={!isLoading ? { scale: 0.95 } : {}}
                                disabled={isLoading}
                                onClick={handleSubmit}
                                className={`
        px-4 py-1.5 rounded-md text-xs shadow flex items-center gap-2
        ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
        text-white
    `}
                            >
                                {isLoading && (
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                )}
                                {isEdit ? "Update Template" : "Create Template"}
                            </motion.button>

                    </div>
                    </div>
                </motion.div>
            </motion.div>
            
        </AnimatePresence>
        <Snackbar
                open={snackbar.open}
                title={snackbar.title}
                message={snackbar.message}
                type={snackbar.type}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                duration={3000}
            />
            </>
    );
};

export default TemplateFormModal;
