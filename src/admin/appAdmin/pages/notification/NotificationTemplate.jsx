import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCreateAppNotificationTemplate } from "../../hooks/template/useTemplateNotifications";
import { formatDateTime ,toLocalISO} from "../../../../utils/date&time/dateTime";

const AppTemplateFormModal = ({ editData, onClose, onSuccess }) => {
    const isEdit = !!editData;
    const BASE_URL = "https://app.bmgjewellers.com";

    const createMutation = useCreateAppNotificationTemplate();

    // ✅ SINGLE SOURCE OF TRUTH (ISO)
    const [scheduledTimeISO, setScheduledTimeISO] = useState("");

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [url, setUrl] = useState("");
    const [singleUser, setSingleUser] = useState(false);
    const [image, setImage] = useState(null);
    const [existingImagePath, setExistingImagePath] = useState("");
    const [previewImage, setPreviewImage] = useState("");

    useEffect(() => {
        if (isEdit && editData) {
            setTitle(editData.Title);
            setMessage(editData.Message);
            setUrl(editData.Url);
            setSingleUser(editData.singleUser || false);

            // ✅ Prefill ISO from backend
            if (editData.ScheduledTime) {
                setScheduledTimeISO(editData.ScheduledTime);
            }

            setExistingImagePath(
                `${BASE_URL}${Array.isArray(editData.ImageUrl)
                    ? editData.ImageUrl[0]
                    : editData.ImageUrl
                }`
            );
        }
    }, [editData, isEdit]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);

        if (file) {
            const reader = new FileReader();
            reader.onload = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        } else {
            setPreviewImage("");
        }
    };

    const handleSubmit = () => {
        if (!scheduledTimeISO) {
            alert("Please select scheduled date & time");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("message", message);

        // ✅ API always receives ISO
        formData.append("scheduledTime", scheduledTimeISO);

        if (image) formData.append("image", image);

        createMutation.mutate(formData, { onSuccess });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded shadow-lg w-96 max-w-2xl">

                <h2 className="text-sm font-semibold mb-3">
                    {isEdit ? "Edit Template" : "Add New Template"}
                </h2>

                <div className="space-y-3">

                    <input
                        type="text"
                        placeholder="Title"
                        className="w-full border p-2 rounded text-xs"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    {/* ✅ DATE PICKER */}
                    <DatePicker
                        selected={scheduledTimeISO ? new Date(scheduledTimeISO) : null}
                        onChange={(date) => {
                            if (!date) return;
                            const localISO = toLocalISO(date);
                            setScheduledTimeISO(localISO);
                           
                        }}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={1}
                        dateFormat="dd-MM-yyyy HH:mm:ss"
                        placeholderText="Select date & time"
                        className="w-full border p-2 rounded text-xs"
                    />

                    {/* ✅ FORMATTED DISPLAY */}
                    {scheduledTimeISO && (
                        <p className="text-xs text-gray-600">
                            Scheduled at: <b>{formatDateTime(scheduledTimeISO)}</b>
                        </p>
                    )}

                    <textarea
                        placeholder="Message"
                        className="w-full border p-2 rounded text-xs"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />

                    {/* Image Upload */}
                    <label className="block w-full border p-2 rounded cursor-pointer text-center text-xs bg-gray-100">
                        {image || existingImagePath || previewImage
                            ? "Change Image"
                            : "Upload Image"}
                        <input type="file" className="hidden" onChange={handleImageChange} />
                    </label>

                    {(previewImage || existingImagePath) && (
                        <img
                            src={previewImage || existingImagePath}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded mx-auto mt-2"
                        />
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button className="px-3 py-1 bg-gray-300 rounded" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                        onClick={handleSubmit}
                    >
                        {isEdit ? "Update" : "Create"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AppTemplateFormModal;
