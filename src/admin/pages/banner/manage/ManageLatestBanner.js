import React, { useState, useEffect } from "react";
import {
    useLatestBannersQuery,
    useDeleteLatestBannerMutation
} from "../../../hooks/banners/latestCollection/useLatestCollection";

import { useNavigate } from "react-router-dom";
import BannerTable from "../../../components/banner/manageBannerTable.jsx";
import { FaTrash, FaEdit } from "react-icons/fa";
import { getProductImages } from "../../../../utils/mediaUtils/mediaUtils.js";
import { useLocation } from "react-router-dom";
const ManageLatestBanner = () => {
    const { data: latestDesign, isLoading ,refetch } = useLatestBannersQuery();
    const deleteMutation = useDeleteLatestBannerMutation();
    const navigate = useNavigate();
    const location =useLocation();
    const [loadedData, setLoadedData] = useState([]);

    // Load data from query
    useEffect(() => {
        refetch();
        if (latestDesign) {
            setLoadedData(latestDesign);
        }
    }, [latestDesign ,location.pathname]);

    // Delete handler
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this banner?")) {
            deleteMutation.mutate(id);
        }
    };

    // Table headers
    const headers = [
        { key: "sno", label: "S.No" },
        { key: "image_path", label: "Image" },
        { key: "name", label: "Name" },
        { key: "actions", label: "Actions", align: "center" },
    ];

    // Table formatted data
    const tableData = loadedData.map((item, index) => ({
        id: item.id,
        sno: index + 1,
        image_path: item.Image,
        name: item.Name || "—",
    }));
    const handleAdd = () => navigate('/latestbanner/add');
    return (
        <div className="max-w-8xl mx-auto p-3 mt-4 ">
            <BannerTable
                title="Manage LatestProduct Banners"
                headers={headers}
                data={tableData}
                loading={isLoading}
                button={loadedData.length < 4 ? "Add Banner" : ""}
                onClick={handleAdd}
                emptyMessage="No banners found"
                renderCell={(key, row) => {
                    // Image
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

                    // Actions (Edit / Delete)
                    if (key === "actions") {
                        return (
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => navigate(`/latestbanner/add`,{state:{id:row.id , mode:"edit"}})}
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

export default ManageLatestBanner;
