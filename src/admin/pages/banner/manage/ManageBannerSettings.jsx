import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetBannerSettings, useDeleteBannerSetting } from '../../../hooks/banners/bannerSetting/useBannerSettings';
import BannerTable from "../../../components/banner/manageBannerTable";
import { FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";

const ManageBannerSettings = () => {
    const navigate = useNavigate();

    const { data: bannersData, isLoading, isError, refetch } = useGetBannerSettings();
    const { mutate: deleteBanner } = useDeleteBannerSetting();

    console.log(bannersData, 'bannersData')
    // Use memo to avoid unnecessary recalculations
    const banners = useMemo(() => {
        if (!bannersData) return [];

        // Handle different possible response structures
        if (Array.isArray(bannersData)) {
            return bannersData;
        } else if (Array.isArray(bannersData?.data)) {
            return bannersData.data;
        } else if (Array.isArray(bannersData?.banners)) {
            return bannersData.banners;
        } else if (Array.isArray(bannersData?.results)) {
            return bannersData.results;
        }

        console.warn('Unexpected banners data structure:', bannersData);
        return [];
    }, [bannersData]);

    const handleDelete = (id) => {
        if (window.confirm("Delete this banner?")) {
            deleteBanner(id, {
                onSuccess: () => refetch(), // Refresh list after deletion
            });
        }
    };
    console.log(banners, 'banners')

    const tableData = banners.map((item, index) => ({
        sno: index + 1,
        id: item.id,
        imageKey: item.imageKey,
        title: item.title || "—",
        description: item.description || "—",
        gap: item.gap ?? "—",
        mobileGap: item.mobileGap ?? "—",
        centered: item.centered ?? "—",
        full: item.full ?? "—",
        backgroundColor: item.backgroundColor || "—",
        desktopRatio: item.desktopRatio || "—",
        mobileRatio: item.mobileRatio || "—",
        mobileRows: item.mobileRows,
        desktopColumns: item.desktopColumns || "—",
        alt: item.alt || "—",
        desktopLink: item.desktopLink || "—",
        mobileLink: item.mobileLink || "—",
    }));

    const handleOnClick = () => {
        navigate('/admin/bannersetting/add')
    }

    // Helper function to render boolean values with icons
    const renderBooleanWithIcon = (value) => {
        if (value === true || value === "true") {
            return (
                <div className="flex items-center justify-center">
                    <FaCheck className="text-green-600" size={14} />
                </div>
            );
        } else if (value === false || value === "false") {
            return (
                <div className="flex items-center justify-center">
                    <FaTimes className="text-red-600" size={14} />
                </div>
            );
        }
        return "—";
    };

    return (
        <div className="max-w-8xl mx-auto mt-3 p-3 sm:p-4 sm:mt-4">
            <BannerTable
                title="Manage Main Banners"
                button={banners.length <= 5 ? ("Add Banner") : ('')}
                onClick={handleOnClick}
                headers={[
                    { key: "sno", label: "S.No" },
                    { key: "imageKey", label: "ImageKey" },
                    { key: "title", label: "Title" },
                    { key: "description", label: "Description" },
                    { key: "gap", label: "Gap" },
                    { key: "mobileGap", label: "Mobile Gap" },
                    { key: "centered", label: "Centered" },
                    { key: "full", label: "Full Width" },
                    { key: "actions", label: "Actions", align: "center" },
                ]}
                data={tableData}
                renderCell={(key, row) => {
                    if (key === "actions") {
                        return (
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() => navigate('/admin/bannersetting/add', { state: { data: row, mode: 'edit' } })}
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                    title="Edit"
                                >
                                    <FaEdit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(row.id)}
                                    className="text-red-600 hover:text-red-800 transition-colors"
                                    title="Delete"
                                >
                                    <FaTrash size={16} />
                                </button>
                            </div>
                        );
                    }

                    // Handle boolean fields with icons
                    if (key === "gap" || key === "mobileGap" || key === "centered" || key === "full") {
                        return renderBooleanWithIcon(row[key]);
                    }

                    return row[key];
                }}
                loading={isLoading}
                emptyMessage="No banners found"
                error={isError}
            />
        </div>
    );
};

export default ManageBannerSettings;