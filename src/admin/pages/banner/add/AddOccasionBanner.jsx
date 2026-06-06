import React, { useState, useMemo, useEffect } from 'react';
import { useUploadOccasionBannerMutation, useUpdateOccasionBannerMutation } from '../../../hooks/banners/occasionBanner/useUploadOccasionBanner';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBannersQuery } from '../../../hooks/banners/occasionBanner/useOccasionBannerQuery';
import { useItemNames } from '../../../hooks/itemName/useItemNames';
// import HeroBannerForm from '../../../components/banner/BannerForm'

const AddOccasionBanner = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state || {};

    const isEdit = state?.mode === "edit";
    const editId = state?.id ?? null;

    const { data: bannerData } = useBannersQuery();
    const updateMutation = useUpdateOccasionBannerMutation();
    const uploadMutation = useUploadOccasionBannerMutation();
    const { items: itemNames = [] } = useItemNames();

    // Convert itemNames to format expected by HeroBannerForm
    const itemCategories = useMemo(() => {
        return itemNames.map(item => ({
            id: item.ITEMCTRID?.toString() || '',
            name: item.itemName || ''
        }));
    }, [itemNames]);

    // Safely extract banners array
    const banners = useMemo(() => {
        if (!bannerData) return [];

        if (Array.isArray(bannerData)) {
            return bannerData;
        } else if (Array.isArray(bannerData?.data)) {
            return bannerData.data;
        } else if (Array.isArray(bannerData?.banners)) {
            return bannerData.banners;
        } else if (Array.isArray(bannerData?.results)) {
            return bannerData.results;
        }

        console.warn('Unexpected banner data structure:', bannerData);
        return [];
    }, [bannerData]);

    // Get current banner for edit mode
    const currentBanner = useMemo(() => {
        if (!isEdit) return null;
        return banners.find((b) => Number(b.id) === Number(editId)) || null;
    }, [isEdit, editId, banners]);

    // Prepare data for HeroBannerForm
    const prepareFormData = () => {
        if (!currentBanner) return null;

        // Convert your backend format to HeroBannerForm format
        return {
            title: currentBanner.title || '',
            description: currentBanner.subtitle || '',
            defaultRatio: '16/9', // Default values
            mobileRatio: '4/3',
            gap: true,
            centered: true,
            full: false,
            backgroundColor: '#ffffff',
            images: [
                {
                    url: currentBanner.image_path || '',
                    ratio: '16/9',
                    alt: currentBanner.occasion || '',
                    desktop: {
                        url: currentBanner.image_path || '',
                        ratio: '16/9'
                    },
                    mobile: {
                        url: currentBanner.image_path || '',
                        ratio: '4/3'
                    }
                }
            ],
            // Map your occasion to itemname for the form
            itemname: currentBanner.occasion || ''
        };
    };

    // Handle form submission
    const handleSubmit = async (formData) => {
        try {
            const payload = new FormData();

            if (isEdit) {
                payload.append("id", editId);
                payload.append("occasion", formData.itemname || formData.images[0]?.alt || '');

                // If there's a new image (from file input), handle it
                if (formData.images[0]?.desktop?.url &&
                    formData.images[0]?.desktop?.url.startsWith('blob:')) {
                    // This would need file handling - for now we'll skip
                    console.log('New image detected, needs file upload logic');
                }
            } else {
                // For add mode, we need file handling
                payload.append("occasion", formData.itemname || formData.images[0]?.alt || '');
                // File upload logic would go here
            }

            if (isEdit) {
                if (updateMutation && typeof updateMutation.mutate === 'function') {
                    await updateMutation.mutateAsync(payload);
                }
            } else {
                if (uploadMutation && typeof uploadMutation.mutate === 'function') {
                    await uploadMutation.mutateAsync(payload);
                }
            }

            // Navigate back on success
            setTimeout(() => {
                navigate("/occasionbanner/manage");
            }, 1000);

        } catch (error) {
            console.error('Error saving banner:', error);
            throw error;
        }
    };

    const handleCancel = () => {
        navigate("/occasionbanner/manage");
    };

    // Prepare initial form data for edit mode
    const initialFormData = prepareFormData();

    // If you want to keep your simple form but make it animated, here's an alternative:
    if (false) { // Set to false to use HeroBannerForm, true for animated simple form
        return <AnimatedSimpleForm />;
    }

    return (
        <>
            <div className='bg-white rounded-xl shadow-lg p-6 '>

{/*       
        <HeroBannerForm
            mode={isEdit ? 'edit' : 'add'}
            initialData={initialFormData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={updateMutation?.isLoading || uploadMutation?.isLoading}
            itemCategories={itemCategories}
        /> */}
            </div>
        </>
    );
};

// Alternative: Animated version of your current simple form
const AnimatedSimpleForm = () => {
    const navigate = useNavigate();
    const [itemname, setItemname] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);

    return (
        <div className=" bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
            <div className="max-w-md mx-auto">
                <div className={`text-center mb-8 ${isAnimating ? 'animate__animated animate__fadeInDown' : ''}`}>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Add Occasion Banner</h1>
                    <p className="text-gray-600">Simple form for occasion banners</p>
                </div>

                <div className={`bg-white rounded-xl shadow-lg p-6 ${isAnimating ? 'animate__animated animate__fadeInUp' : ''}`}>
                    {error && (
                        <div className={`mb-4 p-3 bg-red-50 border border-red-200 rounded-lg ${isAnimating ? 'animate__animated animate__shakeX' : ''}`}>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Item Category *
                            </label>
                            <select
                                value={itemname}
                                onChange={(e) => setItemname(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            >
                                <option value="">Select item category</option>
                                {/* Map your itemNames here */}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Banner Image *
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-all duration-300">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFile(e.target.files?.[0])}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-gray-600">Click to upload image</p>
                                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP up to 5MB</p>
                                </label>
                            </div>
                            {file && (
                                <div className="mt-2 text-sm text-green-600 animate__animated animate__fadeIn">
                                    ✓ {file.name}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                onClick={() => {
                                    if (!itemname || !file) {
                                        setError('Please fill all fields');
                                        setIsAnimating(true);
                                        setTimeout(() => setIsAnimating(false), 500);
                                        return;
                                    }
                                    // Handle submit
                                }}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
                            >
                                Upload Banner
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddOccasionBanner;