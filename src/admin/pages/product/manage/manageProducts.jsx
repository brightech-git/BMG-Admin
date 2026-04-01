import React, { useState, useEffect, useContext, useMemo } from 'react';
import { ArrowForward } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useFilterItemsQuery } from '../../../hooks/products/useFilterItemsQuery';
import { useFilters } from '../../../context/product/FilterContext';
import { MyContext } from '../../../context/themeContext/themeContext';
import FilterSection from '../../../components/product/FilterSection';
import AdvancedTable from '../../../components/table/ResponsiveTable';

// Helper to remove empty filters
const getActiveFilters = (filters) =>
    Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '' && v !== undefined && v !== null));

// Construct image URLs
const constructImageUrls = (imagePath, baseUrl = 'https://app.bmgjewellers.com') => {
    if (!imagePath) return [];
    try {
        const images = JSON.parse(imagePath);
        return images.map((img) => (img.startsWith('http') ? img : `${baseUrl}${img}`));
    } catch {
        return [];
    }
};

// Construct video URLs
const constructVideoUrls = (videoPath, baseUrl = 'https://app.bmgjewellers.com') => {
    if (!videoPath) return [];
    try {
        const videos = JSON.parse(videoPath);
        return videos.map((video) => (video.startsWith('http') ? video : `${baseUrl}${video}`));
    } catch {
        return [];
    }
};

// Media Display Component for table cells
const MediaDisplay = ({ product, navigate, themeMode }) => {
    const images = constructImageUrls(product.ImagePath);
    const videos = constructVideoUrls(product.VideoPath);

    const hasImages = images.length > 0;
    const hasVideos = videos.length > 0;
    const totalMedia = images.length + videos.length;

    if (!hasImages && !hasVideos) {
        return (
            <button
                onClick={() =>
                    navigate(`/admin/product/add`, {
                        state: { tagkey: product.TAGKEY, itemName: product.ITEMNAME }
                    })
                }
                className="text-red-500 border border-red-400 border-dashed text-xs px-1 py-0.5 rounded hover:bg-red-50 transition"
            >
                Need to Add
            </button>
        );
    }

    return (
        <div className="flex gap-1 items-center">
            {/* Display first image thumbnail if available */}
            {hasImages && (
                <img
                    src={images[0]}
                    alt="product"
                    className="w-8 h-8 rounded object-cover"
                    onError={(e) => {
                        e.currentTarget.onerror = null; // prevent infinite loop
                        // e.currentTarget.src = "https://via.placeholder.com/40?text=No+Img";
                    }}
                    loading='lazy'
                />
            )}

            {/* Show additional media count if there are more than 1 media items */}
            {(totalMedia >= 1 || (hasImages && hasVideos)) && (
                <div className="flex items-center gap-1">
                    {/* Video indicator if videos exist */}
                    {hasVideos && (
                        <div className="flex items-center gap-0.5">
                            <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            <span className="text-xs text-blue-600 font-small">{videos.length}</span>
                        </div>
                    )}

                    {/* Image count if more than 1 image */}
                    {images.length > 1 && (
                        <div className="flex items-center gap-0.5">
                            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs text-gray-600 font-small">{images.length}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Edit button */}
            <button
                title="Edit media"
                onClick={() =>
                    navigate(`/admin/product/add`, {
                        state: {
                            tagkey: product.TAGKEY,
                            itemName: product.ITEMNAME,
                            subItemName: product.SUBITEMNAME,
                            isUpdate: true,
                        },
                    })
                }
                className="ml-1 p-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition"
            >
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                </svg>
            </button>
        </div>
    );
};

// Custom cell renderer for the table
const renderTableCell = (key, row, themeMode, showNextArrow, navigate) => {
    switch (key) {
        case 'sno':
            return <span>{row._index + 1}</span>;

        case 'product':
            return (
                <span className="truncate" title={`${row.ITEMNAME} - ${row.SUBITEMNAME}`}>
                    {row.ITEMNAME} - {row.SUBITEMNAME}
                </span>
            );

        case 'itemId':
            return <span>{row.ITEMID}</span>;

        case 'tagNo':
            return <span>{row.TAGNO}</span>;

        case 'tagKey':
            return <span className="truncate" title={row.TAGKEY}>{row.TAGKEY}</span>;

        case 'media':
            return <MediaDisplay product={row} navigate={navigate} themeMode={themeMode} />;

    

        case 'actions':
            return (
                <ArrowForward
                    className="text-black-300 cursor-pointer mx-auto"
                    style={{ fontSize: 16 }}
                    onClick={() =>
                        navigate(`/admin/product/manage/single`, { state: { tagKey: row.TAGKEY } })
                    }
                />
            );

        default:
            return row[key] || '-';
    }
};

// Main ManageProduct Component
const ManageProduct = () => {
    const { filters, updateFilter } = useFilters();
    const { themeMode } = useContext(MyContext);
    const navigate = useNavigate();

    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(filters.pageSize || 20);
    const [allProducts, setAllProducts] = useState([]);
    const [isInitialFetch, setIsInitialFetch] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    // Handle window resize for mobile view
    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle navigation events
    useEffect(() => {
        const handlePopstate = () => {
            setAllProducts([]);
            setIsInitialFetch(true);
            setPage(0);
            setPageSize(filters.pageSize || 20);
        };

        window.addEventListener('popstate', handlePopstate);
        return () => window.removeEventListener('popstate', handlePopstate);
    }, [filters.pageSize]);

    const activeFilters = useMemo(() =>
        getActiveFilters({ ...filters, page, pageSize }),
        [filters, page, pageSize]
    );

    const { data, isFetching, isError, refetch, error } = useFilterItemsQuery(activeFilters);

    // Update products when new data is fetched
    useEffect(() => {
        if (!data?.data) return;

        // Always replace products with new data (no appending)
        setAllProducts(data.data.map((item, index) => ({ ...item, _index: index })));
        setTotalCount(data.totalProducts || data.data.length);
        setIsInitialFetch(false);

    }, [data]);

    // Handle page change with next/previous buttons
    const handleNextPage = () => {
        if ((page + 1) * pageSize < totalCount) {
            setPage(prev => prev + 1);
            setAllProducts([]); // Clear current products
            setIsInitialFetch(true);
        }
    };

    const handlePrevPage = () => {
        if (page > 0) {
            setPage(prev => prev - 1);
            setAllProducts([]); // Clear current products
            setIsInitialFetch(true);
        }
    };

    // Handle page size change
    const handlePageSizeChange = (event) => {
        const newSize = Number(event.target.value);
        setPageSize(newSize);
        setPage(0); // Reset to first page
        updateFilter('pageSize', newSize);
        setAllProducts([]);
        setIsInitialFetch(true);
    };

    // Calculate pagination info
    const startItem = page * pageSize + 1;
    const endItem = Math.min((page + 1) * pageSize, totalCount);

    // Table headers configuration
    const tableHeaders = [
        { key: 'sno', label: 'S.No', align: 'center' },
        { key: 'product', label: 'Product', align: 'left' },
        { key: 'itemId', label: 'Item ID', align: 'left' },
        { key: 'tagNo', label: 'Tag No', align: 'left' },
        { key: 'tagKey', label: 'Tag Key', align: 'left' },
        { key: 'media', label: 'Media', align: 'left' },
        { key: 'actions', label: 'Full Details', align: 'center' },
    ];

    // Mobile view headers (fewer columns)
    const mobileHeaders = [
        { key: 'sno', label: 'S.No', align: 'center' },
        { key: 'tagKey', label: 'Tag Key', align: 'left' },
        { key: 'product', label: 'Product', align: 'left' },
        { key: 'media', label: 'Media', align: 'left' },
        { key: 'details', label: 'Full Details', align: 'center' },
        { key: 'actions', label: 'Details', align: 'center' },
    ];

    return (
        <div className="p-2 mt-2">
            <div className="p-2 border">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="p-1 m-0">
                    <ol className="breadcrumb flex gap-2 text-xs">
                        <li>
                            <Link to="/" className="text-blue-500 text-xs m-0">
                                Dashboard
                            </Link>
                        </li>
                        <li className='text-xs m-0'>/ Manage Products</li>
                    </ol>
                </nav>

                {/* Filters */}
                <FilterSection />

                {/* Advanced Table - Just for display with fixed height */}
                <div className="mt-4">
                    <AdvancedTable
                        headers={isMobileView ? mobileHeaders : tableHeaders}
                        data={allProducts}
                        isLoading={isInitialFetch && isFetching}
                        isLoadingMore={false} // Disable loading more
                        isError={isError}
                        error={error}
                        onRetry={refetch}
                        renderCell={(key, row, themeMode, showNextArrow) =>
                            renderTableCell(key, row, themeMode, showNextArrow, navigate)
                        }
                        themeMode={themeMode}
                        maxHeight="600px" // Fixed height for scrolling
                        // Removed hasMore and onScrollEnd props to disable scroll loading
                        emptyMessage="No products found matching your filters"

                        // Styling props
                        headerBg={themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}
                        headerText={themeMode === 'dark' ? 'text-white' : 'text-gray-800'}
                        rowBg={themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'}
                        rowText={themeMode === 'dark' ? 'text-white' : 'text-gray-900'}
                        rowHoverBg={themeMode === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}
                        fontSizeHeader="text-xs"
                        fontSizeRow="text-xs"
                        actionColumn
                    />
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
                    {/* Showing text */}
                    <p className="text-xs">
                        Showing {allProducts.length > 0 ? startItem : 0} to {endItem} of {totalCount} products
                    </p>

                    {/* Pagination buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={page === 0 || isFetching}
                            className={`px-3 py-1 text-xs rounded ${page === 0 || isFetching
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                        >
                            Previous
                        </button>
                        <span className="text-xs">
                            Page {page + 1} of {Math.ceil(totalCount / pageSize) || 1}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={(page + 1) * pageSize >= totalCount || isFetching}
                            className={`px-3 py-1 text-xs rounded ${(page + 1) * pageSize >= totalCount || isFetching
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                        >
                            Next
                        </button>
                    </div>

                    {/* Rows per page */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs">Rows per page:</span>
                        <select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            className="border border-gray-300 rounded px-2 py-1 text-xs text-black"
                            disabled={isFetching}
                        >
                            {[10, 20, 30, 50, 100].map((size) => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {isError && !isFetching && (
                    <p className="mt-4 text-red-500 text-center">
                        Failed to load products. Please try again.
                    </p>
                )}
            </div>
        </div>
    );
};

export default ManageProduct;