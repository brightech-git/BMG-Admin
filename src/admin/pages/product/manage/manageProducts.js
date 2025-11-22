import React, { useState, useEffect, useContext, useMemo } from 'react';
import { ArrowForward } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useFilterItemsQuery } from '../../../hooks/products/useFilterItemsQuery';
import { useFilters } from '../../../context/product/FilterContext';
import { MyContext } from '../../../context/themeContext/themeContext';
import FilterSection from '../../../components/product/FilterSection';

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

// Skeleton Card Component
const SkeletonCard = ({ themeMode, isMobileView }) => (
    isMobileView ? (
        <tr className={`${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'} animate-pulse`}>
            <td className="px-1 py-1 border border-gray-300">
                <div className="h-6 bg-gray-300 rounded w-8 mx-auto"></div>
            </td>
            <td className="px-1 py-1 border border-gray-300">
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            </td>
            <td className="px-1 py-1 border border-gray-300">
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            </td>
            <td className="px-1 py-1 border border-gray-300">
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            </td>
            <td className="px-1 py-1 border border-gray-300">
                <div className="h-6 bg-gray-300 rounded w-6 mx-auto"></div>
            </td>
        </tr>
    ) : (
        <tr className={`${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'} animate-pulse`}>
            <td className="px-1 py-1 border border-gray-300">
                <div className="h-6 bg-gray-300 rounded w-8 mx-auto"></div>
            </td>
            <td className="px-3 py-1 border border-gray-300">
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            </td>
            <td className="px-2 py-1 border border-gray-300">
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            </td>
            <td className="px-1 py-1 border border-gray-300">
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            </td>
            <td className="px-2 py-1 border border-gray-300">
                <div className="h-6 bg-gray-300 rounded w-6 mx-auto"></div>
            </td>
        </tr>
    )
);

// Media Display Component
const MediaDisplay = ({ product, navigate }) => {
    const images = constructImageUrls(product.ImagePath);
    const videos = constructVideoUrls(product.VideoPath);
    console.log(videos ,'vidoes')

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
                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/40?text=No+Img')}
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

// Mobile Media Display Component
const MobileMediaDisplay = ({ product, navigate }) => {
    const images = constructImageUrls(product.ImagePath);
    const videos = constructVideoUrls(product.VideoPath);
    const hasImages = images.length > 0;
    const hasVideos = videos.length > 0;

    if (!hasImages && !hasVideos) {
        return (
            <button
                onClick={() =>
                    navigate(`/admin/product/add`, {
                        state: { tagkey: product.TAGKEY, itemName: product.ITEMNAME, subItemName: product.SUBITEMNAME },
                    })
                }
                className="text-red-500 border border-red-400 border-solid text-xs px-1 py-0.5 rounded hover:bg-red-50 transition"
            >
                Need to Add
            </button>
        );
    }

    return (
        <div className="flex gap-1 items-center">
            {hasImages && (
                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {images.length}
                </span>
            )}
            {hasVideos && (
                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                    {videos.length}
                </span>
            )}
        </div>
    );
};

// ProductList Component
const ProductList = ({ products, isMobileView, themeMode, themeColor, isFetching, isInitialFetch }) => {
    const navigate = useNavigate();

    // Show skeletons during initial fetch
    if (isFetching && isInitialFetch) {
        return (
            <div className="overflow-x-auto mt-4">
                <table className={`min-w-full border border-gray-300 table-auto text-sm`}>
                    <thead className={`bg-gray-100 ${themeMode === 'dark' ? 'bg-gray-700 text-white' : ''}`}>
                        <tr>
                            <th className="px-1 py-1 border border-gray-300 text-center">S.No</th>
                            <th className="px-3 py-1 border border-gray-300 text-center">Product</th>
                            <th className="px-2 py-1 border border-gray-300">Product Key</th>
                            <th className="px-2 py-1 border border-gray-300">Media</th>
                            <th className="px-2 py-1 border border-gray-300 text-center">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} themeMode={themeMode} isMobileView={isMobileView} />
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    // Handle empty product list
    if (!products.length) {
        return (
            <div className="text-center mt-8">
                <p className="text-lg font-bold">No Products Found</p>
                <p className="text-sm text-gray-500">No products match the current filters.</p>
            </div>
        );
    }

    // Desktop Table
    if (!isMobileView) {
        return (
            <div className="overflow-x-auto mt-4">
                <table className={`min-w-full border border-gray-300 table-auto text-sm`}>
                    <thead className={`bg-gray-100 ${themeMode === 'dark' ? 'bg-gray-700 text-white' : ''}`}>
                        <tr>
                            <th className="px-1 py-1 border border-gray-300 text-center">S.No</th>
                            <th className="px-3 py-1 border border-gray-300 text-center">Product</th>
                            <th className="px-2 py-1 border border-gray-300">Product Key</th>
                            <th className="px-2 py-1 border border-gray-300">Media</th>
                            <th className="px-2 py-1 border border-gray-300 text-center">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p, index) => (
                            <tr key={p.TAGKEY} className={`${themeMode === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                                <td className="px-1 py-1 border border-gray-300 text-center w-13">{index + 1}</td>
                                <td className="px-3 py-1 border border-gray-300 truncate text-xs w-30">{p.ITEMNAME} - {p.SUBITEMNAME}</td>
                                <td className="px-2 py-1 border border-gray-300 truncate w-30">{p.TAGKEY}</td>
                                <td className="px-1 py-1 border border-gray-300 w-30">
                                    <MediaDisplay product={p} navigate={navigate} />
                                </td>
                                <td className="px-2 py-1 border border-gray-300 text-center">
                                    <ArrowForward
                                        className="text-black-300 cursor-pointer mx-auto"
                                        style={{ fontSize: 16 }}
                                        onClick={() =>
                                            navigate(`/admin/product/manage/single`, { state: { tagKey: p.TAGKEY } })
                                        }
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    // Mobile Table
    return (
        <div className="overflow-x-auto mt-4">
            <table className="min-w-full border border-gray-300 divide-y divide-gray-300 table-auto text-xs">
                <thead className={`bg-gray-100 ${themeMode === 'dark' ? 'bg-gray-700 text-white' : ''}`}>
                    <tr>
                        <th className="px-1 py-1 border border-gray-300 text-center">S.No</th>
                        <th className="px-1 py-1 border border-gray-300">Product Key</th>
                        <th className="px-1 py-1 border border-gray-300 text-center">Product</th>
                        <th className="px-1 py-1 border border-gray-300">Media</th>
                        <th className="px-1 py-1 border border-gray-300 text-center">Details</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p, index) => (
                        <tr key={p.TAGKEY} className={`${themeMode === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} hover:bg-gray-50`}>
                            <td className="px-1 py-1 border border-gray-300 text-center">{index + 1}</td>
                            <td className="px-1 py-1 border border-gray-300 truncate">{p.TAGKEY}</td>
                            <td className="px-1 py-1 border border-gray-300 truncate" style={{ textTransform: 'lowercase' }}>
                                {p.ITEMNAME} - {p.SUBITEMNAME}
                            </td>
                            <td className="px-1 py-1 border border-gray-300">
                                <MobileMediaDisplay product={p} navigate={navigate} />
                            </td>
                            <td className="px-1 py-1 border border-gray-300 text-center">
                                <ArrowForward
                                    className="text-black cursor-pointer mx-auto"
                                    style={{ fontSize: 10 }}
                                    onClick={() =>
                                        navigate(`/admin/product/manage/single`, { state: { tagKey: p.TAGKEY } })
                                    }
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Main ManageProduct Component
const ManageProduct = () => {
    const { filters, updateFilter } = useFilters();
    const { themeMode, themeColor } = useContext(MyContext);
    const navigate = useNavigate();

    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
    const [pageSize, setPageSize] = useState(filters.pageSize || 20);
    const [visibleCount, setVisibleCount] = useState(pageSize);
    const [allProducts, setAllProducts] = useState([]); // Store all loaded products
    const [isInitialFetch, setIsInitialFetch] = useState(true); // Track initial fetch

    // Handle window resize for mobile view
    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle navigation events (e.g., back/forward navigation)
    useEffect(() => {
        const handlePopstate = () => {
            // Reset state to trigger a fresh fetch when navigating back
            setAllProducts([]);
            setIsInitialFetch(true);
            setPageSize(filters.pageSize || 20);
            setVisibleCount(filters.pageSize || 20);
        };

        window.addEventListener('popstate', handlePopstate);
        return () => window.removeEventListener('popstate', handlePopstate);
    }, [filters.pageSize]);

    const activeFilters = useMemo(() => getActiveFilters({ ...filters, pageSize }), [filters, pageSize]);
    const { data, isFetching, isError } = useFilterItemsQuery(activeFilters);

    const prevFiltersRef = React.useRef(activeFilters);

    // Update products when new data is fetched
    useEffect(() => {
        if (!data?.data) return;

        const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(activeFilters);

        if (filtersChanged || isInitialFetch) {
            setAllProducts(data.data); // Reset products on filter change or initial fetch
        } else {
            setAllProducts((prev) => {
                const newProducts = data.data.filter(
                    (newProduct) => !prev.some((existing) => existing.TAGKEY === newProduct.TAGKEY)
                );
                return [...prev, ...newProducts];
            });
        }

        prevFiltersRef.current = activeFilters;
        setIsInitialFetch(false);
    }, [data, activeFilters, isInitialFetch]);

    const totalCount = data?.totalProducts || allProducts.length;
    const hasMore = data?.hasMore || allProducts.length < totalCount;

    const handleLoadMore = () => {
        const newSize = pageSize + 10;
        setPageSize(newSize);
        setVisibleCount(newSize);
        updateFilter('pageSize', newSize);
    };

    const handlePageSizeChange = (event) => {
        const newSize = Number(event.target.value);
        setPageSize(newSize);
        setVisibleCount(newSize);
        updateFilter('pageSize', newSize);
        setAllProducts([]); // Reset products when changing page size
        setIsInitialFetch(true); // Treat as initial fetch
    };

    return (
        <div className="p-3 mt-4">
            <div className="p-2 border ">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="p-1">
                    <ol className="breadcrumb flex gap-2 text-xs">
                        <li>
                            <Link to="/" className="text-blue-500 text-xs">
                                Dashboard
                            </Link>
                        </li>
                        <li className='text-xs'>/ Manage Products</li>
                    </ol>
                </nav>

                {/* Filters */}
                <FilterSection />

                {/* Product List */}
                <ProductList
                    products={allProducts.slice(0, visibleCount)}
                    isMobileView={isMobileView}
                    themeMode={themeMode}
                    themeColor={themeColor}
                    isFetching={isFetching}
                    isInitialFetch={isInitialFetch}
                />

                {/* Pagination / Load More */}
                <div className="flex flex-wrap justify-between items-center mt-2 gap-2 text-sm">
                    {/* Showing text */}
                    <p className="order-1 sm:order-1 text-xs sm:text-xs mt-3">
                        Showing {Math.min(visibleCount, allProducts.length)} of {totalCount} products
                    </p>

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="w-full flex justify-center">
                            <button
                                className="bg-blue-500 text-white px-2 sm:px-4 sm:py-1.5 rounded-full hover:bg-blue-600 transition text-xs sm:text-sm"
                                onClick={handleLoadMore}
                            >
                                <span className="sm:hidden text-xs">Load More</span>
                                <span className="hidden sm:inline text-xs">Load More Products</span>
                            </button>
                        </div>
                    )}

                    {/* Rows per page */}
                    <div className="flex items-center gap-1 sm:gap-2 order-3 sm:order-3 ml-auto">
                        <span className="text-xs sm:text-sm whitespace-nowrap ">Rows per page:</span>
                        <select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            className="border border-gray-300 rounded px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm text-black"
                        >
                            {[10, 20, 30, 50, 100].map((size) => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {isError && <p className="mt-4 text-red-500">Failed to load products. Please try again.</p>}
            </div>
        </div>
    );
};

export default ManageProduct;