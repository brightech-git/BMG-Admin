import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    useCreateAppNotificationTemplate,
    useUpdateAppNotificationTemplate
} from "../../hooks/template/useTemplateNotifications";
import { formatDateTime, toLocalISO } from "../../../../utils/date&time/dateTime";

const AppTemplateFormModal = ({ editData, onClose, onSuccess }) => {


    console.log(editData, 'editData')
    const isEdit = Boolean(editData?.id);
    const BASE_URL = "https://app.bmgjewellers.com";

    const createMutation = useCreateAppNotificationTemplate();
    const updateMutation = useUpdateAppNotificationTemplate();

    /** ✅ FORM STATE */
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [url, setUrl] = useState("");
    const [singleUser, setSingleUser] = useState(false);

    /** ✅ ISO STRING (SOURCE OF TRUTH) */
    const [scheduledTimeISO, setScheduledTimeISO] = useState("");

    /** IMAGE STATE */
    const [image, setImage] = useState(null);
    const [existingImagePath, setExistingImagePath] = useState("");
    const [previewImage, setPreviewImage] = useState("");

    /** ✅ PREFILL FROM editData (SINGLE ROW JSON) */
    useEffect(() => {
        if (!isEdit || !editData) return;

        setTitle(editData.title || "");
        setMessage(editData.message || "");
        setUrl(editData.url || "");
        setSingleUser(Boolean(editData.singleUser));
        setScheduledTimeISO(editData.scheduledTimeFormatted || "");

        if (editData.imageUrl) {
            const imagePath = Array.isArray(editData.imageUrl)
                ? editData.imageUrl[0]
                : editData.imageUrl;
           

            setExistingImagePath(imagePath);
        }
    }, [isEdit, editData]);

    /** IMAGE CHANGE */
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImage(file);

        const reader = new FileReader();
        reader.onload = () => setPreviewImage(reader.result);
        reader.readAsDataURL(file);
    };

    /** SUBMIT */
    const handleSubmit = () => {
        if (!title || !message) {
            alert("Please fill all required fields");
            return;
        }
       

        const formData = new FormData();
        formData.append("title", title);
        formData.append("message", message);
        formData.append("scheduledTime", scheduledTimeISO);
        formData.append("url", url);
        formData.append("singleUser", String(singleUser));

        // ✅ Only send image if user changed it
        if (image) {
            formData.append("image", image);
        }

        if (isEdit) {


            updateMutation.mutate(
                { id: editData.id, data: formData },
                { onSuccess }
            );
            return;
        }

        createMutation.mutate(formData, { onSuccess });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded shadow-lg w-96 max-w-2xl">

                <h2 className="text-sm font-semibold mb-3">
                    {isEdit ? "Edit Template" : "Add New Template"}
                </h2>

                <div className="space-y-3">
                    <div className="flex gap-2 items-center">
                    <label >
                        Title 
                    </label> 
                    <input
                        type="text"
                        placeholder="Title"
                        className="w-full border p-2 rounded text-xs"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    </div>
                    <div className="flex gap-2 items-center">
                        <label >
                            ScheduledTime :
                        </label>

                        {/* DATE PICKER */}
                        <DatePicker
                            selected={scheduledTimeISO ? new Date(scheduledTimeISO) : null}
                            onChange={(date) => {
                                if (!date) return;
                                setScheduledTimeISO(toLocalISO(date));
                            }}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={1}
                            dateFormat="dd-MM-yyyy HH:mm:ss"
                            placeholderText="Select date & time"
                            className="w-full border p-2 rounded text-xs"
                        />

                    </div>
                    
                    {scheduledTimeISO && (
                        <p className="text-xs text-gray-600">
                            Scheduled at: <b>{formatDateTime(scheduledTimeISO)}</b>
                        </p>
                    )}

                    <div className="flex gap-2 items-center">
                    <label> Message: </label>
                    <textarea
                        placeholder="Message"
                        className="w-full border p-2 rounded text-xs h-20"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    </div>
                    {/* IMAGE UPLOAD */}
                    <label className="block w-full border p-2 rounded cursor-pointer text-center text-xs bg-gray-100">
                        {previewImage || image || existingImagePath
                            ? "Change Image"
                            : "Upload Image"}
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleImageChange}
                        />
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
                    <button
                        className="px-3 py-1 bg-gray-300 rounded"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                        onClick={handleSubmit}
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                    >
                        {isEdit ? "Update" : "Create"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AppTemplateFormModal;
