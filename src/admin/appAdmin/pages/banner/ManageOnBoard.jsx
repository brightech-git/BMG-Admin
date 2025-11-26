import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import BannerTable from "../../../components/banner/manageBannerTable";
import { getAllSliders } from "../../service/onBoardImages";

const ManageOnBoard = () => {
    const navigate = useNavigate();
    const baseUrl = "https://scheme.bmgjewellers.com";

    const [slidersData, setSlidersData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all sliders
    useEffect(() => {
        const fetchSliders = async () => {
            try {
                setLoading(true);
                const res = await getAllSliders();
                setSlidersData(res?.banners  || []);
            } catch (error) {
                console.error("Error fetching sliders:", error);
                setSlidersData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSliders();
    }, []);

    // Normalize data for the table
    const tableData = useMemo(() => {
        if (!slidersData) return [];

        return [...slidersData]        // copy array to avoid mutating original
            .reverse()                 // reverse the order
            .map((item,index) => ({
                id: item.BannerId,
                sno:index+1,
                SchemeId: item.SchemeId,
                schemeName: item.schemeName,
                image_path: item.image_path,
            }));
    }, [slidersData]);


    // Delete slider
    // const handleDelete = async (id) => {
    //     if (!window.confirm("Delete this slider?")) return;

    //     try {
    //         await deleteSlider(id);
    //         setSlidersData((prev) => prev.filter((item) => item.SliderId !== id));
    //     } catch (error) {
    //         console.error("Failed to delete slider:", error);
    //     }
    // };

    // const handleAddClick = () => {
    //     navigate("/app/admin/sliderbanner/add"); // replace with your add page
    // };

    return (
        <div className="max-w-8xl mx-auto mt-3 p-3 sm:p-4 sm:mt-4">
            <BannerTable
                title="Manage Scheme Sliders"
                // button={slidersData.length < 5 ? "Add Slider" : ""}
                // onClick={handleAddClick}
                headers={[
                    { key: "sno", label: "S.No" },
                    // { key: "SchemeId" , label:"Scheme Id" ,align :'center'},
                    // { key: "schemeName" , label:"Scheme Name" },
                    { key: "image_path", label: "Image"  ,align:'center'},        
                    { key: "actions", label: "Actions", align: "center" },
                ]}
                data={tableData}
                renderCell={(key, row) => {
                    if (key === "image_path") {
                        return (
                            <div className="flex gap-2 justify-center">
                            <img
                                src={`${baseUrl}${row.image_path}`}
                                alt={row.title}
                                width={35}
                                height={35}
                                className="rounded shadow-sm object-contain "
                            />
                            </div>
                        );
                    }

                    if (key === "actions") {
                        return (
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() =>
                                        navigate("/app/admin/onBoard/add", {
                                            state: { id: row.id, mode: "edit" },
                                        })
                                    }
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                    title="Edit"
                                >
                                    <FaEdit size={16} />
                                </button>
                                {/* <button
                                    onClick={() => handleDelete(row.id)}
                                    className="text-red-600 hover:text-red-800 transition-colors"
                                    title="Delete"
                                >
                                    <FaTrash size={16} />
                                </button> */}
                            </div>
                        );
                    }

                    return row[key];
                }}
                loading={loading}
                emptyMessage="No sliders found"
            />
        </div>
    );
};

export default ManageOnBoard;
