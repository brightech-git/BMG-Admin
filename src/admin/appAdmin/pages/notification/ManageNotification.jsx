import { useTemplateNotifications ,useSendAppNotificationByTemplate ,useAppTempDeleteById } from "../../hooks/template/useTemplateNotifications";
import React, { useState } from "react";
import AdvancedTable from "../../../components/table/ResponsiveTable";


// import { usePushNotification } from "../../hooks/notification/useNotificationQuery";

import { Pencil, Trash2, Send, Plus } from "lucide-react";
import AppTemplateFormModal from "./NotificationTemplate";
import { formatDateTime } from "../../../../utils/date&time/dateTime";
// import { getProductImages } from "../../../utils/mediaUtils/mediaUtils";

const NotificationTemplatePage = () => {

    const { data: templates, isLoading, isError, error, refetch } = useTemplateNotifications();
    const deleteMutation = useAppTempDeleteById();

    console.log(templates, 'templates')
     //const deleteMutation = useDeleteTemplate();
     const pushMutation = useSendAppNotificationByTemplate();
    const BASE_URL = "https://app.bmgjewellers.com"; // your base URL
    const [showForm, setShowForm] = useState(false);
    const [editTemplate, setEditTemplate] = useState(null);



    const templateData =
        templates?.data.map((t, i) => ({
            sno: i + 1,
            ...t,
        })) ?? [];

    const finalData = templateData;
    console.log(finalData, 'finalData')

    const headers = [
        {key:'sno' , label:'S.No'},
        { key: "id", label: "Temp Id", align: "center" },
        { key: "title", label: "Title" },
        { key: "message", label: "Message" },
        { key: "scheduledTimeFormatted", label: "ScheduledTime" },
        { key: "ImageUrl", label: "Image", align: "center" },
        // { key: "url", label: "Redirect Url" },
        { key: "actions", label: "Actions", align: "center" },
    ];

    const renderCell = (key, row,index ) => {

        if (key === "sno") return row.sno;

        if (key === "ImageUrl")
            return (
                <img
                    src={row.imageUrl}
                    alt="img"
                    className="w-10 h-10 rounded object-cover mx-auto"
                />
            );
            if (key === "scheduledTimeFormatted") {
                return (
                    <div className="flex flex-col">
                        <span className="text-xs">{formatDateTime(row.scheduledTimeFormatted)} </span>
                    </div>
                );
            }


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
                            onClick={() =>{
                                console.log(row.id);
                                pushMutation.mutate(row.id, {

                                    onSuccess: () => {
                                        alert("Notification sent successfully!");
                                    },
                                    onError: () => {
                                        alert("Failed to send notification");
                                    },
                                })
                            }
                                
                            }
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
                            onClick={() => {
                                const confirm = window.confirm('Are you sure want to delete the template');
                                if (confirm){
                                    deleteMutation.mutate(row.id, { onSuccess: refetch })
                                }
                                }
                              
                            }
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
                <h2 className="text-sm font-semibold">App Notification Templates</h2>

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
                isLoading={isLoading}
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
                <AppTemplateFormModal
                    editData={editTemplate}
                    onClose={() => setShowForm(false)}
                    onSuccess={() => {
                        setShowForm(false);
                        refetch();
                    }}
                />
            )}
        </div>
    );
};

export default NotificationTemplatePage;
