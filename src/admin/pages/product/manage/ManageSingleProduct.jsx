import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProductContext } from "../../../context/product/productContext";
import { MyContext } from "../../../context/themeContext/themeContext";

const BASE_URL = "https://app.bmgjewellers.com";

const parseImagePath = (imagePath) => {
    try {
        const paths = typeof imagePath === "string" ? JSON.parse(imagePath) : imagePath;
        if (!Array.isArray(paths)) return [];
        return paths.map((p) => `${BASE_URL}${p.startsWith("/") ? p : `/${p}`}`);
    } catch {
        return [];
    }
};

// Parse video paths if available
const parseVideoPath = (videoPath) => {
    try {
        const paths = typeof videoPath === "string" ? JSON.parse(videoPath) : videoPath;
        if (!Array.isArray(paths)) return [];
        return paths.map((p) => `${BASE_URL}${p.startsWith("/") ? p : `/${p}`}`);
    } catch {
        return [];
    }
};

const InfoRow = ({ icon, label, value, colorClass = "text-gray-900 dark:text-gray-900" }) => (
    <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="min-w-[100px] font-medium text-sm text-gray-900 dark:text-gray-900">{label}:</span>
        <span className={`text-sm ${colorClass}`}>{value || "N/A"}</span>
    </div>
);

function ManageSingleProduct() {

    const location = useLocation();
    const navigate = useNavigate();
    const { themeMode } = useContext(MyContext);
    const { getProductDetails} = useProductContext();


    const [product ,setProduct] = useState();

    const tagKey = location.state?.tagKey || location.state?.tagkey || location.state?.TAGKEY || localStorage.getItem("productTagkey");


    const [mainMedia, setMainMedia] = useState("");
    const [mediaType, setMediaType] = useState("image"); // 'image' or 'video'
    const [imageError, setImageError] = useState(false);

    const [isFetching ,setIsFetching] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!tagKey) return;

        let isMounted = true; // Prevent state updates if component unmounts

        const fetchProduct = async () => {
            setIsFetching(true);
            setError(null); // Clear previous errors

            try {
                const productData = await getProductDetails(tagKey);

                // Only update state if component is still mounted
                if (isMounted) {
                    setProduct(productData);
                }
            } catch (err) {
                console.error("Failed to fetch product details:", err);

                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Failed to fetch product details");
                    setProduct(null); // Clear product data on error
                }
            } finally {
                if (isMounted) {
                    setIsFetching(false);
                }
            }
        };

        fetchProduct();

        // Cleanup function to prevent state updates on unmounted component
        return () => {
            isMounted = false;
        };
    }, [tagKey]); 

   
    // Parse images and videos from product data
    const images = parseImagePath(product?.ImagePath || []);
    const videos = parseVideoPath(product?.VideoPath || []); // Assuming VideoPath field exists

    // Combine all media for display
    const allMedia = [
        ...images.map(img => ({ type: 'image', url: img })),
        ...videos.map(video => ({ type: 'video', url: video }))
    ];

    // Set initial main media
    useEffect(() => {
        if (allMedia.length > 0 && !mainMedia) {
            setMainMedia(allMedia[0].url);
            setMediaType(allMedia[0].type);
        }
    }, [allMedia, mainMedia]);

    // Calculate discount percentage if needed
    const discountPercentage = product?.MRP && product?.GrandTotal
        ? Math.round(((product.MRP - product.GrandTotal) / product.MRP) * 100)
        : 0;

    const handleMediaClick = (media) => {
        setMainMedia(media.url);
        setMediaType(media.type);
    };

    const handleImageError = () => {
        setImageError(true);
    };

    if (isFetching) {
        return (
            <div className="p-4 md:p-6 max-w-7xl mx-auto font-primary">
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="space-y-4">
                        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        <div className="h-36 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 md:p-6 max-w-7xl mx-auto font-primary">
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-4">
                    Error loading product: {error}
                </div>
                <button
                    onClick={() => navigate('/admin/product/manage')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Manage Products
                </button>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="p-4 md:p-6 max-w-7xl mx-auto text-center font-primary">
                <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded-lg mb-4">
                    Product not found
                </div>
                <button
                    onClick={() => navigate('/admin/product/manage')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Manage Products
                </button>
            </div>
        );
    }

    return (
        <div className={`p-6 md:p-6 mt-3 max-w-7lg mx-auto font-primary ${themeMode === 'dark' ? 'dark' : ''}`}>
            {/* Breadcrumbs and Header */}
            <div className="mb-2">
                <nav className="text-sm mb-3">
                    <span
                        className="cursor-pointer hover:underline"
                        onClick={() => navigate('/admin/product/manage')}
                    >
                        Manage Products
                    </span>
                    <span className="mx-1">/</span>
                    <span className="text-gray-600 dark:text-gray-600">Product Details</span>
                </nav>
                <h1 className="text-2xl font-semibold ">Product Details</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Media Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Product Media</h2>
                        {(videos.length > 0 || images.length > 0) && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {images.length} images {videos.length > 0 ? `, ${videos.length} videos` : ''}
                            </span>
                        )}
                    </div>

                    {/* Product Badges */}
                    {(product.NewArrival || product.Top_Trending || discountPercentage > 0) && (
                        <div className="product-badges mb-4">
                            {product.NewArrival && (
                                <span className="badge new-arrival">New</span>
                            )}
                            {product.Top_Trending && (
                                <span className="badge trending">Trending</span>
                            )}
                            {discountPercentage > 0 && (
                                <span className="badge discount">-{discountPercentage}%</span>
                            )}
                        </div>
                    )}

                    {/* Main Media Display */}
                    {/* Main Media Display */}
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            {mainMedia ? ( // ✅ Only render if mainMedia exists and is not empty
                                mediaType === 'image' ? (
                                    <img
                                        src={mainMedia}
                                        alt={product.SUBITEMNAME}
                                        onError={handleImageError}
                                        className="w-64 h-64 md:w-80 md:h-80 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                                    />
                                ) : (
                                    <div className="w-64 h-64 md:w-80 md:h-80 bg-black rounded-lg flex items-center justify-center">
                                        <video
                                            key={mainMedia}
                                            className="w-full h-full object-contain rounded-lg"
                                            controls
                                            playsInline
                                            preload="metadata"
                                        >
                                            <source src={mainMedia} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                                            VIDEO
                                        </div>
                                    </div>
                                )
                            ) : (
                                // ✅ Show placeholder when no media
                                <div className="w-64 h-64 md:w-80 md:h-80 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-400">No media available</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Media Thumbnails */}
                    {allMedia.length > 1 && (
                        <>
                            <hr className="my-4 border-gray-200 dark:border-gray-700" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                Click to view different media ({allMedia.length} items)
                            </p>
                            <div className="flex gap-2 overflow-x-auto justify-center">
                                {allMedia.map((media, i) => (
                                    <div
                                        key={i}
                                        onClick={() => handleMediaClick(media)}
                                        className={`relative w-16 h-16 rounded-md cursor-pointer border-2 ${media.url === mainMedia ? 'border-primary' : 'border-gray-200 dark:border-gray-700'}`}
                                    >
                                        {media.type === 'image' ? (
                                            <img
                                                src={media.url}
                                                alt={`thumbnail-${i}`}
                                                onError={handleImageError}
                                                className="w-full h-full object-cover rounded-md"
                                            />
                                        ) : (
                                            <>
                                                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white px-1 py-0.5 rounded text-xs">
                                                    VID
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Fallback for when no media is available */}
                    {allMedia.length === 0 && (
                        <div className="flex justify-center items-center h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            <div className="text-center">
                                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No media available</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Product Details Section */}
                <div className="space-y-2">
                    {/* Basic Information Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {product.ITEMNAME} - {product.SUBITEMNAME}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                            {product.Description || "No description available"}
                        </p>
                        <div className="mb-3">
                            <span className="text-2xl font-bold text-primary">₹{product.GrandTotal?.toLocaleString()}</span>
                            {product.MRP && product.MRP > product.GrandTotal && (
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-gray-500 line-through">₹{product.MRP?.toLocaleString()}</span>
                                    <span className="text-sm font-medium text-green-600">Save {discountPercentage}%</span>
                                </div>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400">Inclusive of all taxes</p>
                        </div>
                        <hr className="my-3 border-gray-200 dark:border-gray-700" />
                        <div className="flex flex-wrap gap-2">
                            {product.CollectionType && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900 text-primary border border-primary">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    {product.CollectionType}
                                </span>
                            )}
                            {product.MaterialFinish && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">
                                    {product.MaterialFinish}
                                </span>
                            )}
                            {product.PURITY && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 border border-green-300 dark:border-green-700">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-10 7-5-5" />
                                    </svg>
                                    {product.PURITY}% Purity
                                </span>
                            )}
                            {product.ColorAccents && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">
                                    {product.ColorAccents}
                                </span>
                            )}
                            {product.Gender && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 border border-purple-300 dark:border-purple-700">
                                    {product.Gender}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Specifications Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-4m6 2l3.999 11.999M18 5l-3 9m0 0l3.999 11.999" />
                            </svg>
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Product Specifications</h2>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Weight Details</h3>
                                <InfoRow
                                    icon={
                                        <svg
                                            className="w-4 h-4 text-amber-600 dark:text-amber-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-4m6 2l3.999 11.999M18 5l-3 9m0 0l3.999 11.999"
                                            />
                                        </svg>
                                    }
                                    label="Gross Weight"
                                    value={`${product.GRSWT} g`}
                                    className="text-sm font-medium text-gray-600 dark:text-gray-300"

                                />
                                <InfoRow
                                    icon={
                                        <svg
                                            className="w-4 h-4 text-amber-600 dark:text-amber-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-4m6 2l3.999 11.999M18 5l-3 9m0 0l3.999 11.999"
                                            />
                                        </svg>
                                    }
                                    label="Net Weight"
                                    value={`${product.NETWT} g`}
                                    className="text-sm font-medium text-gray-600 dark:text-gray-300"
                                />
                            </div>
                            <hr className="border-gray-200 dark:border-gray-700" />
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tax & Identification</h3>
                                <InfoRow
                                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>}
                                    label="GST"
                                    value={`${product.GSTPer}`}

                                />
                                <InfoRow
                                    label="Tag Key"
                                    value={product.TAGKEY}
                                    colorClass="text-primary"
                                />
                            </div>
                            {product.Occasion && (
                                <>
                                    <hr className="border-gray-200 dark:border-gray-700" />
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Occasion</h3>
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900 text-primary border border-primary">
                                            {product.Occasion.replace("_", " ")}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Media Information Card */}
                    {(images.length > 0 || videos.length > 0) && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Media Information</h2>
                            </div>
                            <div className="space-y-2">
                                <InfoRow
                                    label="Total Images"
                                    value={images.length}
                                    colorClass="text-blue-600"
                                />
                                <InfoRow
                                    label="Total Videos"
                                    value={videos.length}
                                    colorClass="text-green-600"
                                />
                                <InfoRow
                                    label="Total Media"
                                    value={images.length + videos.length}
                                    colorClass="text-purple-600 font-medium"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ManageSingleProduct;