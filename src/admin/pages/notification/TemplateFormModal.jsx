import React, { useState, useEffect } from "react";
import { useCreateTemplate, useUpdateTemplate } from "../../hooks/notificationTemplates/useNotificationTemplates";

const TemplateFormModal = ({ editData, onClose, onSuccess }) => {
    const isEdit = !!editData;
    console.log(editData,'edit data')
    const BASE_URL = "https://app.bmgjewellers.com"; // base URL
    const createMutation = useCreateTemplate();
    const updateMutation = useUpdateTemplate(editData?.Id);

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [url, setUrl] = useState("");
    const [image, setImage] = useState(null);
    const [existingImagePath, setExistingImagePath] = useState("");
    const [previewImage, setPreviewImage] = useState("");

    useEffect(() => {
        if (isEdit) {
            setTitle(editData.Title);
            setMessage(editData.Message);
            setUrl(editData.Url);
            setExistingImagePath(`${BASE_URL}${Array.isArray(editData.ImageUrl) ? editData.ImageUrl[0] : editData.ImageUrl}`);
        }
    }, [editData]);

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
        const formData = new FormData();
        formData.append("title", title);
        formData.append("message", message);
        formData.append("url", url);
        if (image) formData.append("image", image);

        if (isEdit) {
            updateMutation.mutate(formData, { onSuccess });
        } else {
            createMutation.mutate(formData, { onSuccess });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50   mx-auto">
            <div className="bg-white p-4  rounded shadow-lg w-96 max-w-2xl">

                <h2 className="text-sm font-semibold mb-3">
                    {isEdit ? "Edit Template" : "Add New Template"}
                </h2>

                <div className="space-y-3 max-w-2xl ">

                    <input
                        type="text"
                        placeholder="Title"
                        className="w-full border p-2 rounded text-xs"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <textarea
                        placeholder="Message"
                        className="w-full border p-2 rounded text-xs"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Redirect URL"
                        className="w-full border p-2 rounded text-xs"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />

                    {/* Image input with label and preview */}
                    <label className="block w-full border p-2 rounded cursor-pointer text-center text-xs bg-gray-100 hover:bg-gray-200">
                        {image || existingImagePath || previewImage ? "Change Image" : "Upload Image"}
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </label>

                    {/* Show preview */}
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
                    >
                        {isEdit ? "Update" : "Create"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default TemplateFormModal;
