import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetBannerSettings, useDeleteBannerSetting } from '../../../hooks/banners/bannerSetting/useBannerSettings';
import BannerTable from "../../../components/banner/manageBannerTable";
import { FaEdit, FaTrash, FaCheck, FaTimes, FaDesktop, FaTabletAlt, FaMobileAlt, FaClock, FaInfinity, FaArrowsAltH, FaEllipsisH } from "react-icons/fa";
import 'animate.css';

const ManageBannerSettings = () => {
    const navigate = useNavigate();

    const { data: bannersData, isLoading, isError, refetch } = useGetBannerSettings();
    const { mutate: deleteBanner } = useDeleteBannerSetting();

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
                onSuccess: () => refetch(),
            });
        }
    };

    // Parse visibleCount from JSON string
    const parseVisibleCount = (visibleCountStr) => {
        if (!visibleCountStr) return null;
        try {
            return typeof visibleCountStr === 'string'
                ? JSON.parse(visibleCountStr)
                : visibleCountStr;
        } catch (e) {
            return null;
        }
    };

    // Parse mobileRows from JSON string
    const parseMobileRows = (mobileRowsStr) => {
        if (!mobileRowsStr) return [];
        try {
            return typeof mobileRowsStr === 'string'
                ? JSON.parse(mobileRowsStr)
                : mobileRowsStr;
        } catch (e) {
            return [];
        }
    };

    const tableData = banners.map((item, index) => {
        const visibleCountObj = parseVisibleCount(item.visibleCount);
        const mobileRowsArray = parseMobileRows(item.mobileRows);

        return {
            sno: index + 1,
            id: item.id,
            imageKey: item.imageKey,
            title: item.title || "",
            description: item.description || "",
            gap: item.gap ?? "",
            mobileGap: item.mobileGap ?? "",
            centered: item.centered ?? "",
            full: item.full ?? "",
            backgroundColor: item.backgroundColor || "",
            desktopRatio: item.desktopRatio || item.defaultRatio || "16/9",
            mobileRatio: item.mobileRatio || "4/3",
            mobileRows: mobileRowsArray,
            mobileRowsDesktop: mobileRowsArray[0] || "",
            mobileRowsMobile: mobileRowsArray[1] || "",
            desktopColumns: item.desktopColumns || "auto",
            alt: item.alt || "",
            isVisible: item.isVisible,
            isGrid: item.isGrid,
            desktopLayout: item.desktopLayout,
            mobileLayout: item.mobileLayout,
            // New carousel fields
            autoscroll: item.autoscroll ?? false,
            scrollable: item.scrollable ?? false,
            infinite: item.infinite ?? false,
            dots: item.dots ?? false,
            visibleCount: visibleCountObj,
            visibleCountDesktop: visibleCountObj?.desktop || '',
            visibleCountTablet: visibleCountObj?.tablet || '',
            visibleCountMobile: visibleCountObj?.mobile || '' ,
            scrollInterval: item.scrollInterval || '',
            displayOrder: item.displayOrder || '',
            createdAt: item.createdAt,
            _bannerData: item // Store the full item for actions
        };
    });

    const handleOnClick = () => {
        navigate('/admin/bannersetting/add');
    };

    const handleEdit = (row) => {
        navigate('/admin/bannersetting/add', {
            state: {
                data: row._bannerData || row,
                mode: 'edit'
            }
        });
    };

    // Helper function to render boolean values with icons
    const renderBooleanWithIcon = (value, trueColor = "text-green-600", falseColor = "text-red-600") => {
        if (value === true || value === "true" || value === 1 || value === "1") {
            return (
                <div className="flex items-center justify-center animate__animated animate__fadeIn">
                    <FaCheck className={trueColor} size={14} />
                </div>
            );
        } else if (value === false || value === "false" || value === 0 || value === "0") {
            return (
                <div className="flex items-center justify-center animate__animated animate__fadeIn">
                    <FaTimes className={falseColor} size={14} />
                </div>
            );
        }
        return <span className="text-gray-400">—</span>;
    };

    // Helper function to render visible count with device icons
    const renderVisibleCount = (row) => {
        if (!row.visibleCount) return <span className="text-gray-400">—</span>;

        return (
            <div className="flex items-center gap-2 animate__animated animate__fadeIn">
                <div className="flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded-full">
                    <FaDesktop className="text-blue-600" size={10} />
                    <span className="text-xs font-medium text-blue-700">{row.visibleCountDesktop}</span>
                </div>
                <div className="flex items-center gap-1 bg-purple-50 px-1.5 py-0.5 rounded-full">
                    <FaTabletAlt className="text-purple-600" size={10} />
                    <span className="text-xs font-medium text-purple-700">{row.visibleCountTablet}</span>
                </div>
                <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded-full">
                    <FaMobileAlt className="text-green-600" size={10} />
                    <span className="text-xs font-medium text-green-700">{row.visibleCountMobile}</span>
                </div>
            </div>
        );
    };

    // Helper function to render scroll interval
    const renderScrollInterval = (ms) => {
        if (!ms) return <span className="text-gray-400">—</span>;
        const seconds = Math.round(ms / 1000);
        return (
            <div className="flex items-center gap-1 animate__animated animate__fadeIn">
                <FaClock className="text-orange-500" size={12} />
                <span className="text-xs font-medium text-gray-700">{seconds}s</span>
            </div>
        );
    };

    // Helper function to render mobile rows
    const renderMobileRows = (row) => {
        if (!row.mobileRows || row.mobileRows.length === 0) {
            return <span className="text-gray-400">—</span>;
        }
        return (
            <div className="flex items-center gap-1 animate__animated animate__fadeIn">
                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                    {row.mobileRows.join(', ')}
                </span>
            </div>
        );
    };

    // Helper function to render layout preview
    const renderLayoutPreview = (layout) => {
        if (!layout) return <span className="text-gray-400">—</span>;

        // Extract columns from layout string if needed
        let columns = [];
        if (typeof layout === 'string') {
            const match = layout.match(/columns=\[(.*?)\]/);
            if (match) {
                columns = match[1].split(',').map(c => c.trim());
            }
        }

        return columns.length > 0 ? (
            <div className="flex items-center gap-1">
                {columns.map((col, i) => (
                    <span key={i} className="text-[10px] bg-orange-50 text-orange-700 px-1 py-0.5 rounded">
                        {col}
                    </span>
                ))}
            </div>
        ) : <span className="text-gray-400">—</span>;
    };

    return (
        <div className="max-w-8xl mx-auto mt-3 p-3 sm:p-4 sm:mt-4 animate__animated animate__fadeIn">
            <BannerTable
                title="Manage Main Banners"
                button={"Add Banner Setting"}
                onClick={handleOnClick}
                headers={[
                    { key: "sno", label: "S.No" },
                    { key: "imageKey", label: "Image Key" },
                    { key: "title", label: "Title" },
                    { key: "displayOrder", label: "Order" },
                    { key: "isGrid", label: "IsGrid" },
                    // Layout fields
                    { key: "desktopColumns", label: "Desktop Cols" },
                    { key: "mobileRows", label: "Mobile Rows" },
                    { key: "desktopLayout", label: "Desktop Layout" },
                    { key: "mobileLayout", label: "Mobile Layout" },
                    // Boolean fields group
                    { key: "gap", label: "Gap" },
                    { key: "mobileGap", label: "M.Gap" },
                    { key: "centered", label: "Center" },
                    { key: "full", label: "Full" },
                    { key: "isVisible", label: "Visible" },
                    // Carousel settings
                    { key: "autoscroll", label: "Auto" },
                    { key: "scrollable", label: "Scroll" },
                    { key: "infinite", label: "Infinite" },
                    { key: "dots", label: "Dots" },
                    { key: "visibleCount", label: "Visible Items" },
                    { key: "scrollInterval", label: "Interval" },
                    { key: "actions", label: "Actions", align: "center" },
                ]}
                data={tableData}
                renderCell={(key, row) => {
                    // Actions column
                    if (key === "actions") {
                        return (
                            <div className="flex gap-2 justify-center animate__animated animate__fadeIn">
                                <button
                                    onClick={() => handleEdit(row)}
                                    className="text-blue-600 hover:text-blue-800 transition-all duration-300 hover:scale-110 hover:rotate-12"
                                    title="Edit"
                                >
                                    <FaEdit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(row.id)}
                                    className="text-red-600 hover:text-red-800 transition-all duration-300 hover:scale-110 hover:-rotate-12"
                                    title="Delete"
                                >
                                    <FaTrash size={16} />
                                </button>
                            </div>
                        );
                    }

                    // Boolean fields with icons
                    if (["gap", "mobileGap", "centered", "full", "isVisible",
                        "autoscroll", "scrollable", "infinite", "dots", "isGrid"].includes(key)) {
                        return renderBooleanWithIcon(row[key]);
                    }

                    // Type field (Grid vs Carousel)
                    if (key === "isGrid") {
                        return row.isGrid ? (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-medium">
                                Grid
                            </span>
                        ) : (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium">
                                Carousel
                            </span>
                        );
                    }

                    // Visible count with device icons
                    if (key === "visibleCount") {
                        return renderVisibleCount(row);
                    }

                    // Scroll interval
                    if (key === "scrollInterval") {
                        return renderScrollInterval(row.scrollInterval);
                    }

                    // Mobile rows
                    if (key === "mobileRows") {
                        return renderMobileRows(row);
                    }

                    // Desktop/Mobile layout preview
                    if (key === "desktopLayout") {
                        return renderLayoutPreview(row.desktopLayout);
                    }
                    if (key === "mobileLayout") {
                        return renderLayoutPreview(row.mobileLayout);
                    }

                    // Background color with preview
                    if (key === "backgroundColor") {
                        return (
                            <div className="flex items-center gap-1 animate__animated animate__fadeIn">
                                <div
                                    className="w-4 h-4 rounded-full border border-gray-200"
                                    style={{ backgroundColor: row.backgroundColor }}
                                />
                                <span className="text-[10px] font-mono">{row.backgroundColor}</span>
                            </div>
                        );
                    }

                    // Display order
                    if (key === "displayOrder") {
                        return (
                            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                #{row.displayOrder}
                            </span>
                        );
                    }

                    // Desktop columns
                    if (key === "desktopColumns") {
                        return (
                            <span className="text-xs font-medium bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                                {row.desktopColumns}
                            </span>
                        );
                    }

                    // Image key with icon
                    if (key === "imageKey") {
                        return (
                            <div className="flex items-center gap-1">
                                <i className="fas fa-image text-blue-500 text-xs"></i>
                                <span className="text-xs font-medium">{row.imageKey}</span>
                            </div>
                        );
                    }

                    // Title with tooltip if long
                    if (key === "title" && row.title?.length > 20) {
                        return (
                            <span className="text-xs" title={row.title}>
                                {row.title.substring(0, 20)}...
                            </span>
                        );
                    }

                    // Description truncation
                    if (key === "description" && row.description?.length > 30) {
                        return (
                            <span className="text-xs text-gray-600" title={row.description}>
                                {row.description.substring(0, 30)}...
                            </span>
                        );
                    }

                    // Default cell rendering
                    return row[key] !== undefined && row[key] !== null && row[key] !== ""
                        ? row[key]
                        : <span className="text-gray-400">—</span>;
                }}
                loading={isLoading}
                emptyMessage="No banners found"
                error={isError}
                onRetry={refetch}
                // Table styling props
                headerBg="bg-gradient-to-r from-[#F97316] to-[#EA580C]"
                headerText="text-white"
                rowHoverBg="hover:bg-orange-50"
                fontSizeHeader="text-[11px]"
                fontSizeRow="text-[11px]"
            />
        </div>
    );
};

export default ManageBannerSettings;