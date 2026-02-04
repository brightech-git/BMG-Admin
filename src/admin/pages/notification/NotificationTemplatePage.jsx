import React, { useState } from "react";
import AdvancedTable from "../../components/table/ResponsiveTable";

import { useAllTemplates, useDeleteTemplate } from "../../hooks/notificationTemplates/useNotificationTemplates";
import { usePushNotification } from "../../hooks/notification/useNotificationQuery";

import { Pencil, Trash2, Send, Plus } from "lucide-react";
import TemplateFormModal from "./TemplateFormModal"; // for create/edit
import { getProductImages } from "../../../utils/mediaUtils/mediaUtils";

const NotificationTemplatePage = () => {
    const { data: templates, isLoading, isError, error, refetch } = useAllTemplates();
    const deleteMutation = useDeleteTemplate();
    const pushMutation = usePushNotification();
    const BASE_URL = "https://app.bmgjewellers.com"; // your base URL
    const [showForm, setShowForm] = useState(false);
    const [editTemplate, setEditTemplate] = useState(null);

    const [sendMessageLoading ,setSendMessageLoading] = useState(false);

    const templateData =
        templates?.map((t, i) => ({
            sno: i + 1,
            ...t,
        })) ?? [];

    const finalData = templateData?.reverse();
    console.log(finalData,'finalData')


    const handleDeleteNotification = (row) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete this notification?`
        );

        if (!confirmDelete) return;

        deleteMutation.mutate(row.id, {
            onSuccess: () => {
                refetch();
            }
        });
    };
    const handleSendNotification = (row) =>{

        setSendMessageLoading(true);

        pushMutation.mutate(
            {
                title: row.Title,
                message: row.Message,
                imageUrl: `${BASE_URL}${row.ImageUrl}`,
                url: row.Url,
            },
            {
                onSuccess: () => {
                    setSendMessageLoading(false);
                    alert("Notification sent successfully!");
                },
                onError: () => {
                    alert("Failed to send notification");
                },
            }
        )
    }


    const headers = [
        { key: "Id", label: "Temp Id" ,align:"center"},
        { key: "Title", label: "Title" },
        { key: "Message", label: "Message" },
        { key: "ImageUrl", label: "Image" ,align:"center"},
        { key: "Url", label: "Redirect Url" },
        { key: "actions", label: "Actions", align: "center" },
    ];

    const renderCell = (key, row) => {
        if (key === "sno") return row.sno;

        if (key === "ImageUrl")
            return (
                <img
                    src={getProductImages(row.ImageUrl)}
                    alt="img"
                    className="w-10 h-10 rounded object-cover mx-auto"
                />
            );

        if (key === "actions") {
            return (
                <div className="flex items-center justify-center gap-2">

                    {/* SEND: directly trigger push notification using row data */}

                    {!row.singleUser && (
                        <button
                            className="p-1 text-blue-600 hover:text-blue-800"
                            aria-label="send"
                            name="send"
                            title="Send to All"  
                            onClick={(row) =>handleSendNotification(row) }
                        >
                            <Send size={16} />
                        </button>
                    )}


                    {/* EDIT */}
                    <button
                        className="p-1 text-green-600 hover:text-green-800"
                        title="Edit"
                        name="Edit"
                        aria-label="Edit"
                        onClick={() => {
                            setEditTemplate(row);
                            setShowForm(true);
                        }}
                    >
                        <Pencil size={16} />
                    </button>

                    {/* DELETE */}
                    {!row.singleUser && (
                    <button
                        className="p-1 text-red-600 hover:text-red-800"
                            aria-label="delete"
                            name="delete"
                            title="Delete"  
                        onClick={()=>handleDeleteNotification(row)}
                    >
                        <Trash2 size={16} />
                    </button>
                )}

                </div>
            );
        }

        return row[key];
    };

   

    return (
        <div className="p-3 mt-3">

            {/* Header + Add Button */}
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-semibold">Notification Templates</h2>

                <button
                    className="flex items-center gap-2 bg-white text-var(--primary-text-color) text-xs px-1 py-1.5 "
                    onClick={() => {
                        setEditTemplate(null);
                        setShowForm(true);
                    }}
                >
                    <Plus size={16} /> Add New
                </button>
            </div>

            {/* Table */}
            <AdvancedTable
                headers={headers}
                data={finalData}
                isLoading={isLoading | sendMessageLoading}
                isError={isError}
                error={error}
                onRetry={refetch}
                renderCell={renderCell}
                fontSizeHeader="text-sm"
                fontSizeRow="text-xs"
                actionColumn="actions"
            />

            {/* Form Modal for Create/Edit */}
            {showForm && (
                <TemplateFormModal
                    editData={editTemplate}
                    onClose={() => setShowForm(false)}
                    onSuccess={() => {
                        setShowForm(false);
                        refetch();
                    }}
                    tempCollection={templateData}
                />
            )}
        </div>
    );
};

export default NotificationTemplatePage;
