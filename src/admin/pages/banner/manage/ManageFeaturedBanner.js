import React ,{useEffect} from "react";
import {
    useFeaturedBannersQuery,
    useDeleteFeaturedBannerMutation,
} from "../../../hooks/banners/FeatureProductsBanner/useFeatureBanner";

import { useNavigate } from "react-router-dom";
import BannerTable from "../../../components/banner/manageBannerTable.jsx";
import { FaEdit, FaTrash } from "react-icons/fa";
import { getProductImages } from "../../../../utils/mediaUtils/mediaUtils.js";
import { useLocation } from "react-router-dom";


const ManageFeaturedBanner = () => {
    const { data: designs = [], isLoading ,refetch } = useFeaturedBannersQuery();
    const deleteMutation = useDeleteFeaturedBannerMutation();
    const navigate = useNavigate();

    // Delete handler
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this banner?")) {
            deleteMutation.mutate(id);
        }
    };
    const location = useLocation();

    useEffect(() => {
        refetch(); // your query refetch
    }, [location.pathname]);
    // Add button redirect
    const handleAdd = () => {
        navigate("/featurebanner/add");
    };

    // Table headers
    const headers = [
        { key: "sno", label: "S.No" },
        { key: "image_path", label: "Image" },
        { key: "name", label: "Name" },
        { key: "actions", label: "Actions", align: "center" },
    ];

    // Table rows
    const tableData = designs.map((item, index) => ({
        id: item.id,
        sno: index + 1,
        image_path: item.Image,
        name: item.Name || "—",
    }));

    return (
        <div className="max-w-8xl p-3 mx-auto mt-4">
            <BannerTable
                title="Manage Featured Banners"
                headers={headers}
                data={tableData}
                loading={isLoading}
                emptyMessage="No banners found"
                button={designs.length <= 3 ? "Add Banner" : ""}
                onClick={handleAdd}
                renderCell={(key, row) => {
                    // Image rendering
                    if (key === "image_path") {
                        return (
                            <img
                                src={getProductImages(row.image_path)}
                                alt={row.title}
                                style={{ width: 50, height: 45, objectFit: "contain" }}
                                className="rounded"
                            />
                        );
                    }

                    // Action buttons
                    if (key === "actions") {
                        return (
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() =>
                                        navigate("/featurebanner/add", {
                                            state: { id: row.id, mode: "edit" },
                                        })
                                    }
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Edit"
                                >
                                    <FaEdit size={16} />
                                </button>

                                <button
                                    onClick={() => handleDelete(row.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Delete"
                                >
                                    <FaTrash size={16} />
                                </button>
                            </div>
                        );
                    }

                    return row[key];
                }}
            />
        </div>
    );
};

export default ManageFeaturedBanner;
