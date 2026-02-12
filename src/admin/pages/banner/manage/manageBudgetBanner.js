import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBannersQuery } from '../../../hooks/banners/budgetBanner/useBudgetBannerQuery';
import { useDeleteBudgetBannerMutation } from '../../../hooks/banners/budgetBanner/useBudgetBanner';
import './ManageBudgetBanner.css';
import 'animate.css';
import BannerTable from '../../../components/banner/manageBannerTable';

import HeroBanner from '../../../components/banner/HeroBanner';
import GridBanner from '../../../components/banner/StackBanner';

const BASE_IMAGE_URL = 'https://app.bmgjewellers.com';

const ManageBudgetBanner = () => {
    const navigate = useNavigate();
    const { data: bannersData, isLoading, error, refetch } = useBannersQuery();
   
    
    const { mutate: deleteBudgetBanner } = useDeleteBudgetBannerMutation();

    const [searchQuery, setSearchQuery] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const banners = useMemo(() => {
        if (!bannersData || !Array.isArray(bannersData.categories)) {
            return [];
        }
        return bannersData.categories;
    }, [bannersData]);

    console.log(banners, 'ManageBudgetBanner')

    const handleRefresh = () => {
        refetch();
        setSearchQuery('');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            deleteBudgetBanner(id, {
                onSuccess: () => {
                    setSuccessMessage('Budget Banner deleted successfully!');
                    setTimeout(() => setSuccessMessage(''), 3000);
                    refetch();
                },
                onError: () => {
                    setSuccessMessage('Failed to delete banner');
                    setTimeout(() => setSuccessMessage(''), 3000);
                },
            });
        }
    };

   
    const handleAdd = () => {
        navigate('/admin/budgetbanner/add');
    };

    const handleEdit = (banner) => {
        // Send full banner details including images array when editing
        navigate('/admin/budgetbanner/add', {
            state: {
                mode: 'edit',
                bannerData: banner // Send entire banner object
            }
        });
    };
    console.log(bannersData,'bannersData')

    // Prepare table data from API response
    const tableData = useMemo(() => {
        return banners.map((banner, idx) => ({
            sno:idx+1,
            id: banner.id,
            imageKey: banner.categoryKey,
            desktopImage: banner.images?.[0]?.desktop?.url || '',
            mobileImage: banner.images?.[0]?.mobile?.url || '',
            desktopLink: banner.images?.[0]?.desktop?.link || '',
            mobileLink: banner.images?.[0]?.mobile?.link || '',
            desktopRatio: banner.images?.[0]?.desktop?.ratio || '',
            mobileRatio: banner.images?.[0]?.mobile?.ratio || '',
            backgroundColor: banner.backgroundColor,
            fullWidth: banner.full ? 'Yes' : 'No',
            hasGap: banner.gap ? 'Yes' : 'No',
            rowSpan:banner.rowSpan?? '',
            isSingle: banner.isSingle ?? false,
            // Store full banner object for actions
            _bannerData: banner
        }));
    }, [banners]);

    console.log(banners,'banners')

    const headers = [
        { key: 'sno', label: 'S.No', width: '80px' },
        { key: 'imageKey', label: 'Image Key' },
        { key: 'desktopImage', label: 'Desktop Image' },
        { key: 'mobileImage', label: 'Mobile Image' },
        { key: 'desktopRatio', label: 'D. Ratio' },
        { key: 'mobileRatio', label: 'M. Ratio' },
        { key: 'actions', label: 'Actions', align: 'center', width: '200px' },
    ];

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 animate__animated animate__shakeX"
            >
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    Failed to load banners. Please try again.
                </div>
                <button
                    onClick={() => refetch()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors animate__animated animate__pulse"
                >
                    Retry
                </button>
            </motion.div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-6 mt-3">
            {/* Success Message */}
            {successMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-2 p-2 rounded-lg ${successMessage.includes('Failed')
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-green-50 text-green-700 border border-green-200'
                        } animate__animated animate__fadeInDown`}
                >
                    {successMessage}
                </motion.div>
            )}

            {/* BannerTable Component */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <BannerTable
                    title="Manage Budget Banners"
                    description={`${banners.length} banner${banners.length !== 1 ? 's' : ''} available`}
                    button='Add Banner'
                    onClick={handleAdd}
                    onRefresh={handleRefresh}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Search by title or image key..."
                    headers={headers}
                    data={tableData}
                    loading={isLoading}
                    emptyMessage="No banners found. Add your first banner to get started."
                    renderCell={(key, row) => {
                        // Image Key column
                        if (key === 'imageKey') {
                            return (
                                <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    {row[key]}
                                </span>
                            );
                        }

                        // Desktop Image column
                        if (key === 'desktopImage') {
                            return row[key] ? (
                                <div className="relative group">
                                    <img
                                        src={`${BASE_IMAGE_URL}${row[key]}`}
                                        alt="Desktop"
                                        className="w-16 h-10 object-cover rounded border cursor-pointer"
                                     
                                    />
                                </div>
                            ) : (
                                <span className="text-gray-400 text-sm">No image</span>
                            );
                        }

                        // Mobile Image column
                        if (key === 'mobileImage') {
                            return row[key] ? (
                                <div className="relative group">
                                    <img
                                        src={`${BASE_IMAGE_URL}${row[key]}`}
                                        alt="Mobile"
                                        className="w-10 h-16 object-cover rounded border cursor-pointer"
                                      
                                    />
                                </div>
                            ) : (
                                <span className="text-gray-400 text-sm">No image</span>
                            );
                        }

                        // Ratio columns
                        if (key === 'desktopRatio' || key === 'mobileRatio') {
                            return (
                                <span className={`px-2 py-1 text-xs rounded ${row[key] === '21/9' || row[key] === '4/3'
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                    }`}>
                                    {row[key]}
                                </span>
                            );
                        }

                        // Actions column
                        if (key === 'actions') {
                            return (
                                <div className="flex gap-2 justify-center animate__animated animate__fadeIn">
                                    <button
                                        onClick={() => handleEdit(row._bannerData)}
                                        className="text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm flex items-center gap-1 animate__animated animate__pulse animate__infinite"
                                        title="Edit Banner"
                                    >
                                        <span>✏️</span> 
                                    </button>
                                    <button
                                        onClick={() => handleDelete(row.id)}
                                        className="text-red-50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-sm flex items-center gap-1"
                                        title="Delete Banner"
                                    >
                                        <span>🗑️</span> 
                                    </button> 
                                </div>
                            );
                        }

                        // Default rendering
                        return <span className="text-gray-800 dark:text-gray-200">{row[key]}</span>;
                    }}
                />
            </motion.div>

            
        </div>
    );
};

export default ManageBudgetBanner;