import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetBannerSettings, useDeleteBannerSetting } from '../../../hooks/banners/bannerSetting/useBannerSettings';
import BannerTable from "../../../components/banner/manageBannerTable";
import { useBannersByKey } from '../../../hooks/banners/budgetBanner/useBudgetBannerQuery';
import * as Lucide from "lucide-react";
import 'animate.css';
import HeroBanner from "../../../components/banner/HeroBanner";
import GridBanner from "../../../components/banner/StackBanner";

const ManageBannerSettings = () => {
    const navigate = useNavigate();

    const { data: bannersData, isLoading, isError, refetch } = useGetBannerSettings();

    console.log(bannersData,'bannersData');

    const { mutate: deleteBanner } = useDeleteBannerSetting();

    const [openPreview, setOpenPreview] = useState(null);
    const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop', 'tablet', 'mobile'

    // Fetch banners for preview
    const { data: previewBanners, isLoading: previewLoading } = useBannersByKey(openPreview?.imageKey);

    console.log(previewBanners,'previewBanners');

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
            visibleCountMobile: visibleCountObj?.mobile || '',
            scrollInterval: item.scrollInterval || '',
            displayOrder: item.displayOrder || '',
            createdAt: item.createdAt,
            _bannerData: item // Store the full item for actions
        };
    });

    const handleOnClick = () => {
        navigate('/admin/banner/setting/add');
    };

    const handleEdit = (row) => {
        navigate('/admin/banner/setting/add', {
            state: {
                data: row._bannerData || row,
                mode: 'edit'
            }
        });
    };

    const handleView = (row) => {
        setOpenPreview(row);
    };

    const closePreview = () => {
        setOpenPreview(null);
        setPreviewDevice('desktop');
    };

    // Helper function to render boolean values with Lucide icons
    const renderBooleanWithIcon = (value, trueColor = "text-green-600", falseColor = "text-red-600") => {
        if (value === true || value === "true" || value === 1 || value === "1") {
            return (
                <div className="flex items-center justify-center animate__animated animate__fadeIn">
                    <Lucide.Check className={trueColor} size={14} />
                </div>
            );
        } else if (value === false || value === "false" || value === 0 || value === "0") {
            return (
                <div className="flex items-center justify-center animate__animated animate__fadeIn">
                    <Lucide.X className={falseColor} size={14} />
                </div>
            );
        }
        return <span className="text-gray-400">—</span>;
    };

    // Helper function to render visible count with device icons using Lucide
    const renderVisibleCount = (row) => {
        if (!row.visibleCount) return <span className="text-gray-400">—</span>;

        return (
            <div className="flex items-center gap-2 animate__animated animate__fadeIn">
                <div className="flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded-full">
                    <Lucide.Monitor className="text-blue-600" size={10} />
                    <span className="text-xs font-medium text-blue-700">{row.visibleCountDesktop}</span>
                </div>
                <div className="flex items-center gap-1 bg-purple-50 px-1.5 py-0.5 rounded-full">
                    <Lucide.Tablet className="text-purple-600" size={10} />
                    <span className="text-xs font-medium text-purple-700">{row.visibleCountTablet}</span>
                </div>
                <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded-full">
                    <Lucide.Smartphone className="text-green-600" size={10} />
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
                <Lucide.Clock className="text-orange-500" size={12} />
                <span className="text-xs font-medium text-gray-700">{seconds}s</span>
            </div>
        );
    };


    const getMobileRowsArray = (mobileRows) => {
        if (!mobileRows) return [];

        // already array
        if (Array.isArray(mobileRows)) return mobileRows;

        // string like "0,1"
        if (typeof mobileRows === "string") {
            return mobileRows.split(',').filter(Boolean);
        }

        return [];
    };
    // Helper function to render mobile rows
    const renderMobileRows = (row) => {
        const rows = getMobileRowsArray(row.mobileRows);

        if (rows.length === 0) {
            return <span className="text-gray-400">—</span>;
        }

        console.log(rows, 'mobileRows');

        return (
            <div className="flex items-center gap-1 animate__animated animate__fadeIn">
                {rows.map((item, index) => (
                    <span
                        key={index}
                        className="text-xs bg-gray-100 px-1.5 py-0.5 rounded"
                    >
                        {item}
                    </span>
                ))}
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
                                    onClick={() => handleView(row)}
                                    className="text-blue-600 hover:text-blue-800 transition-all duration-300 hover:scale-110 hover:rotate-12"
                                    title="Preview"
                                >
                                    <Lucide.Eye size={16} />
                                </button>
                                <button
                                    onClick={() => handleEdit(row)}
                                    className="text-blue-600 hover:text-blue-800 transition-all duration-300 hover:scale-110 hover:rotate-12"
                                    title="Edit"
                                >
                                    <Lucide.Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(row.id)}
                                    className="text-red-600 hover:text-red-800 transition-all duration-300 hover:scale-110 hover:-rotate-12"
                                    title="Delete"
                                >
                                    <Lucide.Trash2 size={16} />
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
                                <Lucide.Image className="text-blue-500" size={12} />
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

           
            {openPreview && (
                <div className="fixed inset-0 z-50 mt-[50px] overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center animate__animated animate__fadeIn">
                    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="p-2 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-50 to-orange-100">
                            <div className="flex items-center gap-2">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800 m-0">
                                        Banner Preview: {openPreview.title || openPreview.imageKey}
                                    </h2>
                                    <p className="text-sm text-gray-600 m-0">
                                        Image Key: {openPreview.imageKey}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closePreview}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <Lucide.X size={20} />
                            </button>
                        </div>

                        {/* Device Preview Controls */}
                        <div className="px-4 py-1 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Preview Device:</span>
                                <div className="flex gap-1 bg-white rounded-lg border border-gray-200 p-1">
                                    <button
                                        onClick={() => setPreviewDevice('desktop')}
                                        className={`p-1 rounded-md text-sm flex items-center gap-2 transition-colors ${previewDevice === 'desktop'
                                            ? 'bg-orange-500 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Lucide.Monitor size={14} />
                                        Desktop
                                    </button>
                                    <button
                                        onClick={() => setPreviewDevice('tablet')}
                                        className={`p-1 rounded-md text-sm flex items-center gap-2 transition-colors ${previewDevice === 'tablet'
                                            ? 'bg-orange-500 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Lucide.Tablet size={16} />
                                        Tablet
                                    </button>
                                    <button
                                        onClick={() => setPreviewDevice('mobile')}
                                        className={`p-1 rounded-md text-sm flex items-center gap-2 transition-colors ${previewDevice === 'mobile'
                                            ? 'bg-orange-500 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Lucide.Smartphone size={16} />
                                        Mobile
                                    </button>
                                </div>
                            </div>

                            {/* Banner Type Badge */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Banner Type:</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${openPreview.isGrid
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {openPreview.isGrid ? (
                                        <div className="flex items-center gap-1">
                                            <Lucide.Grid size={12} />
                                            Grid Banner
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <Lucide.Sliders size={12} />
                                            Carousel Banner
                                        </div>
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Banner Preview Content */}
                        <div className="flex-1 overflow-y-auto p-2 bg-gray-100">
                            {previewLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="text-center">
                                        <Lucide.Loader className="animate-spin text-orange-500 mx-auto mb-4" size={40} />
                                        <p className="text-gray-600">Loading banners...</p>
                                    </div>
                                </div>
                            ) : previewBanners?.data?.[openPreview.imageKey] ? (
                                <div className="bg-white rounded-lg shadow-lg p-6">
                                    {/* Device Frame */}
                                    <div className={`mx-auto transition-all duration-300 ${previewDevice === 'desktop' ? 'max-w-4xl' :
                                            previewDevice === 'tablet' ? 'max-w-2xl' :
                                                'max-w-sm'
                                        }`}>
                                        {/* Device Mockup Header (for mobile/tablet) */}
                                        {(previewDevice === 'tablet' || previewDevice === 'mobile') && (
                                            <div className="bg-gray-200 rounded-t-lg p-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                </div>
                                                {previewDevice === 'tablet' ? (
                                                    <Lucide.Tablet className="text-gray-600" size={16} />
                                                ) : (
                                                    <Lucide.Smartphone className="text-gray-600" size={16} />
                                                )}
                                            </div>
                                        )}

                                        {/* Get the banner data from the correct structure */}
                                            {(() => {
                                                const bannerData = previewBanners.data[openPreview.imageKey];

                                                // Parse mobileRows if it's a string
                                                const parsedMobileRows = (() => {
                                                    const value = bannerData.mobileRows;

                                                    if (!value) return [];

                                                    // Already array
                                                    if (Array.isArray(value)) return value;

                                                    // String case
                                                    if (typeof value === "string") {
                                                        try {
                                                            // Try JSON parse (for "[0,1]")
                                                            return JSON.parse(value);
                                                        } catch {
                                                            // Fallback for "0,1"
                                                            return value.split(',').map(v => v.trim());
                                                        }
                                                    }

                                                    return [];
                                                })();

                                                // Ensure visibleCount is properly extracted
                                                const visibleCount = bannerData.visibleCount || {
                                                    desktop: 1,
                                                    tablet: 1,
                                                    mobile: 1
                                                };

                                                // Create proper layout objects for GridBanner
                                                const createLayoutFromColumns = (columns, isMobile = false) => {
                                                    if (!columns) return null;

                                                    // Handle different column formats
                                                    let columnArray;
                                                    if (typeof columns === 'string') {
                                                        // Handle formats like "1" or "2,1,1"
                                                        columnArray = columns.split(',').map(c => parseInt(c.trim()) || 1);
                                                    } else if (Array.isArray(columns)) {
                                                        columnArray = columns;
                                                    } else {
                                                        columnArray = [1]; // Default to 1 column
                                                    }

                                                    return {
                                                        columns: columnArray,
                                                        rows: 1 // Default rows
                                                    };
                                                };

                                                // Transform the banner data into the expected format
                                                const transformedBanner = {
                                                    imageKey: bannerData.imageKey,
                                                    title: bannerData.title,
                                                    description: bannerData.description,
                                                    gap: bannerData.gap,
                                                    mobileGap: bannerData.mobileGap,
                                                    centered: bannerData.centered,
                                                    full: bannerData.full,
                                                    backgroundColor: bannerData.backgroundColor,
                                                    isVisible: bannerData.isVisible,
                                                    dots: bannerData.dots,
                                                    isGrid: bannerData.isGrid,
                                                    desktopColumns: bannerData.desktopColumns,
                                                    mobileColumns: bannerData.mobileColumns,
                                                    mobileRows: parsedMobileRows,
                                                    displayOrder: bannerData.displayOrder,
                                                    autoscroll: bannerData.autoscroll,
                                                    scrollable: bannerData.scrollable,
                                                    infinite: bannerData.infinite,
                                                    visibleCount: visibleCount,
                                                    scrollInterval: bannerData.scrollInterval || 3000,
                                                    desktopLayout: bannerData.desktopLayout,
                                                    mobileLayout: bannerData.mobileLayout,
                                                    desktopRatio: bannerData.desktopRatio || "16/9",
                                                    mobileRatio: bannerData.mobileRatio || "5/4",
                                                    images: bannerData.images.map(img => ({
                                                        isSingle: img.isSingle || false,
                                                        url: img.url || '',
                                                        link: img.link || '',
                                                        ratio: img.ratio || '16/9'
                                                    }))
                                                };

                                                // Create layout objects for GridBanner
                                                const desktopLayoutObj = createLayoutFromColumns(
                                                    transformedBanner.desktopColumns || "1",
                                                    false
                                                );

                                                const mobileLayoutObj = createLayoutFromColumns(
                                                    transformedBanner.mobileColumns || "1",
                                                    true
                                                );

                                                // Log to debug
                                                console.log('Visible Count:', transformedBanner.visibleCount);
                                                console.log('Preview Device:', previewDevice);
                                                console.log('Desktop Layout:', desktopLayoutObj);
                                                console.log('Mobile Layout:', mobileLayoutObj);

                                                // Determine which props to use based on preview device
                                                const getDeviceSpecificProps = () => {
                                                    // Get the correct visible count based on device
                                                    let visibleCountValue;
                                                    switch (previewDevice) {
                                                        case 'mobile':
                                                            visibleCountValue = transformedBanner.visibleCount?.mobile ?? 1;
                                                            break;
                                                        case 'tablet':
                                                            visibleCountValue = transformedBanner.visibleCount?.tablet ?? 1;
                                                            break;
                                                        case 'desktop':
                                                        default:
                                                            visibleCountValue = transformedBanner.visibleCount?.desktop ?? 1;
                                                            break;
                                                    }

                                                    console.log(`${previewDevice} visible count:`, visibleCountValue);

                                                    switch (previewDevice) {
                                                        case 'mobile':
                                                            return {
                                                                defaultRatio: transformedBanner.mobileRatio,
                                                                gap: transformedBanner.mobileGap ?? transformedBanner.gap,
                                                                mobileRows: transformedBanner.mobileRows,
                                                                visibleCount: visibleCountValue,
                                                                layout: mobileLayoutObj, // Use mobile layout for mobile preview
                                                                isMobilePreview: true,
                                                                isTabletPreview: false,
                                                                isDesktopPreview: false
                                                            };
                                                        case 'tablet':
                                                            return {
                                                                defaultRatio: transformedBanner.desktopRatio,
                                                                gap: transformedBanner.gap,
                                                                mobileRows: null,
                                                                visibleCount: visibleCountValue,
                                                                layout: desktopLayoutObj, // Use desktop layout for tablet (or create tablet-specific)
                                                                isMobilePreview: false,
                                                                isTabletPreview: true,
                                                                isDesktopPreview: false
                                                            };
                                                        case 'desktop':
                                                        default:
                                                            return {
                                                                defaultRatio: transformedBanner.desktopRatio,
                                                                gap: transformedBanner.gap,
                                                                mobileRows: null,
                                                                visibleCount: visibleCountValue,
                                                                layout: desktopLayoutObj,
                                                                isMobilePreview: false,
                                                                isTabletPreview: false,
                                                                isDesktopPreview: true
                                                            };
                                                    }
                                                };

                                                const deviceProps = getDeviceSpecificProps();

                                                return transformedBanner.isGrid ? (
                                                    <GridBanner
                                                        key={transformedBanner.imageKey}
                                                        title={transformedBanner.title}
                                                        description={transformedBanner.description}
                                                        images={transformedBanner.images || []}
                                                        // Pass the appropriate layout based on preview device
                                                        desktopLayout={deviceProps.layout}
                                                        mobileLayout={mobileLayoutObj}
                                                        gap={deviceProps.gap}
                                                        centered={transformedBanner.centered}
                                                        full={transformedBanner.full}
                                                        backgroundColor={transformedBanner.backgroundColor}
                                                        previewDevice={previewDevice}
                                                        isMobilePreview={deviceProps.isMobilePreview}
                                                        isTabletPreview={deviceProps.isTabletPreview}
                                                        isDesktopPreview={deviceProps.isDesktopPreview}
                                                    />
                                                ) : (
                                                    <HeroBanner
                                                        key={transformedBanner.imageKey}
                                                        title={transformedBanner.title}
                                                        description={transformedBanner.description}
                                                        images={transformedBanner.images || []}
                                                        defaultRatio={deviceProps.defaultRatio}
                                                        mobileRatio={transformedBanner.mobileRatio}
                                                        gap={deviceProps.gap}
                                                        mobileGap={transformedBanner.mobileGap}
                                                        centered={transformedBanner.centered}
                                                        full={transformedBanner.full}
                                                        backgroundColor={transformedBanner.backgroundColor}
                                                        mobileRows={previewDevice === 'mobile' ? transformedBanner.mobileRows : null}
                                                        desktopColumns={transformedBanner.desktopColumns || 'auto'}
                                                        autoScroll={transformedBanner.autoscroll || false}
                                                        scrollable={transformedBanner.scrollable || false}
                                                        visibleCount={deviceProps.visibleCount}
                                                        scrollInterval={transformedBanner.scrollInterval || 3000}
                                                        infinite={transformedBanner.infinite || false}
                                                        dots={transformedBanner.dots || false}
                                                        previewDevice={previewDevice}
                                                        isMobilePreview={deviceProps.isMobilePreview}
                                                        isTabletPreview={deviceProps.isTabletPreview}
                                                        isDesktopPreview={deviceProps.isDesktopPreview}
                                                    />
                                                );
                                            })()}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                                    <Lucide.ImageOff className="text-gray-400 mx-auto mb-4" size={48} />
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Banners Found</h3>
                                    <p className="text-gray-500">
                                        No banners available for the image key: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{openPreview.imageKey}</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Banner Settings Summary */}
                        <div className="p-2 border-t border-gray-200 bg-gray-50">
                            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                <Lucide.Settings size={16} />
                                Current Settings
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 text-xs">
                                <div className="bg-white p-2 rounded border border-gray-200">
                                    <span className="text-gray-500 block">Desktop Ratio</span>
                                    <span className="font-medium">{openPreview.desktopRatio}</span>
                                </div>
                                <div className="bg-white p-2 rounded border border-gray-200">
                                    <span className="text-gray-500 block">Mobile Ratio</span>
                                    <span className="font-medium">{openPreview.mobileRatio}</span>
                                </div>
                                <div className="bg-white p-2 rounded border border-gray-200">
                                    <span className="text-gray-500 block">Desktop Columns</span>
                                    <span className="font-medium">{openPreview.desktopColumns}</span>
                                </div>
                                <div className="bg-white p-2 rounded border border-gray-200">
                                    <span className="text-gray-500 block">Mobile Rows</span>
                                    <span className="font-medium">{openPreview.mobileRows || 'N/A'}</span>
                                </div>
                                {!openPreview.isGrid && (
                                    <>
                                        <div className="bg-white p-2 rounded border border-gray-200">
                                            <span className="text-gray-500 block">Visible Count (D/T/M)</span>
                                            <span className="font-medium">
                                                {openPreview.visibleCountDesktop}/{openPreview.visibleCountTablet}/{openPreview.visibleCountMobile}
                                            </span>
                                        </div>
                                        <div className="bg-white p-2 rounded border border-gray-200">
                                            <span className="text-gray-500 block">Auto Scroll</span>
                                            <span className="font-medium">{openPreview.autoscroll ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div className="bg-white p-2 rounded border border-gray-200">
                                            <span className="text-gray-500 block">Scroll Interval</span>
                                            <span className="font-medium">{openPreview.scrollInterval ? `${openPreview.scrollInterval / 1000}s` : 'N/A'}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageBannerSettings;