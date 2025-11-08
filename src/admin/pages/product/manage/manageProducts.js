import React, { useState, useEffect, useContext, useMemo } from 'react';
import { ArrowForward } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useFilterItemsQuery } from '../../../hooks/products/useFilterItemsQuery';
import { useFilters } from '../../../context/product/FilterContext';
import { MyContext } from '../../../context/themeContext/themeContext';
import FilterSection from '../../../components/product/FilterSection';
import './ManageProduct.css';



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
                            <th className="px-2 py-1 border border-gray-300">Images</th>
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
                            <th className="px-2 py-1 border border-gray-300">Images</th>
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
                                    <div className="flex gap-1">
                                        {constructImageUrls(p.ImagePath).length > 0 ? (
                                            constructImageUrls(p.ImagePath).slice(0, 3).map((img, i) => (
                                                <img
                                                    key={i}
                                                    src={img}
                                                    alt="product"
                                                    className="w-8 h-8 rounded object-cover"
                                                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/40?text=No+Img')}
                                                />
                                            ))
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    navigate(`/admin/product/add`, {
                                                        state: { tagkey: p.TAGKEY, itemName: p.ITEMNAME, subItemName: p.SUBITEMNAME },
                                                    })
                                                }
                                                className="text-red-500 border border-red-400 border-dashed text-xs px-1 py-0.5 rounded hover:bg-red-50 transition"
                                            >
                                                Need to Add
                                            </button>
                                        )}
                                    </div>
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
                        <th className="px-1 py-1 border border-gray-300">Images</th>
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
                                <div className="flex gap-1 flex-wrap">
                                    {constructImageUrls(p.ImagePath).length > 0 ? (
                                        <span className="px-2 py-0.5 text-xs text-center bg-green-100 rounded">Available</span>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                navigate(`/add-product?tagkey=${p.TAGKEY}`, {
                                                    state: { tagkey: p.TAGKEY, itemName: p.ITEMNAME, subItemName: p.SUBITEMNAME },
                                                })
                                            }
                                            className="text-red-500 border border-red-400 border-solid text-xs px-1 py-0.5 rounded hover:bg-red-50 transition"
                                        >
                                            Need to Add
                                        </button>
                                    )}
                                </div>
                            </td>
                            <td className="px-1 py-1 border border-gray-300 text-center">
                                <ArrowForward className="text-black cursor-pointer mx-auto" style={{ fontSize: 10 }} />
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
        <div className={`product-container ${themeMode === 'dark' ? 'text-white bg-gray-900' : 'text-black bg-white'}`}>
            <div className="p-4 sm:p-6 lg:p-8">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="p-2">
                    <ol className="breadcrumb flex gap-2 text-sm">
                        <li>
                            <Link to="/" className="text-blue-500">
                                Dashboard
                            </Link>
                        </li>
                        <li>/ Manage Products</li>
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
                <div className="flex flex-wrap justify-between items-center mt-4 gap-2 text-sm">
                    {/* Showing text */}
                    <p className="order-1 sm:order-1 text-xs sm:text-sm mt-3">
                        Showing {Math.min(visibleCount, allProducts.length)} of {totalCount} products
                    </p>

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="w-full flex justify-center">
                            <button
                                className="bg-blue-500 text-white px-3 sm:px-4 sm:py-1.5 rounded-full hover:bg-blue-600 transition text-xs sm:text-sm"
                                onClick={handleLoadMore}
                            >
                                <span className="sm:hidden">Load More</span>
                                <span className="hidden sm:inline">Load More Products</span>
                            </button>
                        </div>
                    )}

                    {/* Rows per page */}
                    <div className="flex items-center gap-1 sm:gap-2 order-3 sm:order-3 ml-auto">
                        <span className="text-xs sm:text-sm whitespace-nowrap">Rows per page:</span>
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