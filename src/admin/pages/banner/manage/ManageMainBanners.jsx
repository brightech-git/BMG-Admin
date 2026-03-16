import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useBannersQuery } from "../../../hooks/banners/mainBanner/useBannersQuery.js";
import { useDeleteBannerMutation } from "../../../hooks/banners/mainBanner/useUploadBannerMutation.js";
import BannerTable from "../../../components/banner/manageBannerTable.jsx";
import { FaEdit, FaTrash } from "react-icons/fa";
import { getProductImages } from "../../../../utils/mediaUtils/mediaUtils.js";

const ManageBanners = () => {
    const navigate = useNavigate();

    const { data: bannersData, isLoading, refetch } = useBannersQuery();
    const { mutate: deleteBanner } = useDeleteBannerMutation();

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

    const tableData = banners.map((item, index) => ({
        id: item.id,
        sno: index + 1,
        image_path: item.image_path,
        // title: item.title || "—",
        // subtitle: item.subtitle || "—",
        itemname: item.itemname || "—",
    }));
    const handleOnClick = () => {
        navigate('/banner/add')
    }

    return (
        <div className="max-w-8xl mx-auto mt-3 p-3 sm:p-4 sm:mt-4">
            <BannerTable
                title="Manage Main Banners"
                button={banners.length <= 5 ? ("Add Banner") : ('')}
                onClick={handleOnClick}
                headers={[
                    { key: "sno", label: "S.No" },
                    { key: "image_path", label: "Image" },
                    // { key: "title", label: "Title" },
                    // { key: "subtitle", label: "Subtitle" },
                    { key: "itemname", label: "Item Name" },
                    { key: "actions", label: "Actions", align: "center" },
                ]}
                data={tableData}
                renderCell={(key, row) => {
                    if (key === "image_path") {
                        return (
                            <img
                                src={getProductImages(row.image_path)}
                                alt={row.title}
                                width={60}
                                height={40}
                                className="rounded shadow-sm object-contain"
                            />
                        );
                    }
                    if (key === "actions") {
                        return (
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() => navigate('/admin/banner/add', { state: { id: row.id, mode: 'edit' } })}
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
                    return row[key];
                }}
                loading={isLoading}
                emptyMessage="No banners found"
            />
        </div>
    );
};

export default ManageBanners;
