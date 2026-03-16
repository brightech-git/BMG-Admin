// import React, { useState, useCallback, useRef, useContext, useEffect } from 'react';
// import { useProductContext } from '../../../context/product/productContext';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { MyContext } from '../../../context/themeContext/themeContext';
// import { useEcomMarketingAttributes } from '../../../hooks/market-options/useEcomMarketingAttributes';

// const AddProducts = () => {
//     const location = useLocation();
//     const { tagkey, itemName, subItemName } = location.state || {};
//     console.log("Received:", tagkey, itemName, subItemName);

//     const { uploadImages, createFormData, loading, error, setError } = useProductContext();
//     const { themeMode } = useContext(MyContext);
//     const navigate = useNavigate();
//     const fileInputRef = useRef(null);
//     const { attributes } = useEcomMarketingAttributes();

//     const [dynamicOptions, setDynamicOptions] = useState({});
//     const [formData, setFormData] = useState({
//         tagKey: tagkey || '',
//         description: '',
//         selectedFiles: [],
//         trendingOptions: { topTrending: false, featuredProducts: false, bestDesign: false },
//         productAttributes: {},
//     });

//     useEffect(() => {
//         if (attributes?.length) {
//             const options = {};
//             const initialAttributes = {};
//             attributes.forEach(attr => {
//                 if (attr.active && attr.description) {
//                     options[attr.description] = JSON.parse(attr.valuesJson || '[]');
//                     initialAttributes[attr.description] = '';
//                 }
//             });
//             setDynamicOptions(options);
//             setFormData(prev => ({ ...prev, productAttributes: initialAttributes }));
//             console.log("Initial Attributes:", initialAttributes);
//             console.log("Initial Options:", options);
//             console.log("Initial Form Data:", formData);
//         }
//     }, [attributes]);

//     const [uiState, setUiState] = useState({
//         feedback: { error: '', success: '', info: '' },
//         showAllFiles: false,
//         isDragOver: false,
//         snackbarOpen: false,
//         uploadProgress: 0,
//         isUploading: false,
//     });

//     const CONFIG = {
//         validTypes: ['image/jpeg', 'image/png', 'image/webp'],
//         maxSize: 10 * 1024 * 1024,
//         maxFiles: 10,
//         minFiles: 3,
//         minTagLength: 3,
//         minDescriptionLength: 10,
//     };

//     const clearAllFeedback = useCallback(() => {
//         setUiState(prev => ({ ...prev, feedback: { error: '', success: '', info: '' } }));
//         setError(null);
//     }, [setError]);

//     const setFeedback = useCallback((type, message, duration = 3000) => {
//         clearAllFeedback();
//         setUiState(prev => ({ ...prev, feedback: { ...prev.feedback, [type]: message } }));
//         if (type === 'success' || type === 'info') {
//             setTimeout(() => setUiState(prev => ({ ...prev, feedback: { ...prev.feedback, [type]: '' } })), duration);
//         }
//     }, [clearAllFeedback]);

//     const validateFiles = useCallback(files => {
//         if (!files || files.length === 0) return { isValid: false, error: 'Select at least one image.' };
//         if (files.length > CONFIG.maxFiles) return { isValid: false, error: `Maximum ${CONFIG.maxFiles} files allowed.` };
//         if (files.length < CONFIG.minFiles) return { isValid: false, error: `Minimum ${CONFIG.minFiles} files required.` };
//         for (let file of files) {
//             if (!CONFIG.validTypes.includes(file.type)) return { isValid: false, error: `Invalid file format: ${file.name}. Only JPG, PNG, WEBP allowed.` };
//             if (file.size > CONFIG.maxSize) return { isValid: false, error: `${file.name} exceeds 10MB limit.` };
//         }
//         return { isValid: true };
//     }, []);

//     const handleDragEnter = useCallback(e => { e.preventDefault(); setUiState(prev => ({ ...prev, isDragOver: true })); }, []);
//     const handleDragLeave = useCallback(e => { e.preventDefault(); setUiState(prev => ({ ...prev, isDragOver: false })); }, []);
//     const handleDragOver = useCallback(e => { e.preventDefault(); }, []);
//     const handleDrop = useCallback(e => {
//         e.preventDefault();
//         setUiState(prev => ({ ...prev, isDragOver: false }));
//         processFiles(Array.from(e.dataTransfer.files));
//     }, []);

//     const processFiles = useCallback(files => {
//         clearAllFeedback();
//         const validation = validateFiles(files);
//         if (!validation.isValid) {
//             setFeedback('error', validation.error);
//             return;
//         }
//         setFormData(prev => ({ ...prev, selectedFiles: files }));
//         setFeedback('success', `${files.length} file(s) selected successfully.`, 2000);
//     }, [validateFiles, clearAllFeedback, setFeedback]);

//     const handleFileChange = useCallback(e => processFiles(Array.from(e.target.files || [])), [processFiles]);

//     const removeFile = useCallback(index => {
//         setFormData(prev => ({ ...prev, selectedFiles: prev.selectedFiles.filter((_, i) => i !== index) }));
//         setFeedback('info', 'File removed successfully.', 1500);
//     }, [setFeedback]);

//     const handleInputChange = useCallback((field, value) => {
//         setFormData(prev => ({ ...prev, [field]: value }));
//         console.log(prev => ({ ...prev, [field]: value }) ,'change')
//         clearAllFeedback();
//     }, [clearAllFeedback]);

//     const handleTrendingChange = useCallback(e => {
//         const { name, checked } = e.target;
//         setFormData(prev => ({ ...prev, trendingOptions: { ...prev.trendingOptions, [name]: checked } }));
//     }, []);

//     const validateForm = useCallback(() => {
//         const errors = [];
//         const { tagKey, description, selectedFiles } = formData;

//         if (!tagKey.trim()) {
//             errors.push('Tag Key is required');
//         } else if (tagKey.trim().length < CONFIG.minTagLength) {
//             errors.push(`Tag Key must be at least ${CONFIG.minTagLength} characters`);
//         }

//         if (description.trim() && description.trim().length < CONFIG.minDescriptionLength) {
//             errors.push(`Description must be at least ${CONFIG.minDescriptionLength} characters if provided`);
//         }

//         if (selectedFiles.length > 0) {
//             const fileValidation = validateFiles(selectedFiles);
//             if (!fileValidation.isValid) errors.push(fileValidation.error);
//         }

//         return { isValid: errors.length === 0, errors };
//     }, [formData, validateFiles]);

//     // resetForm MOVED UP — before handleUpload
//     const resetForm = useCallback(() => {
//         setFormData({
//             tagKey: '',
//             description: '',
//             selectedFiles: [],
//             trendingOptions: { topTrending: false, featuredProducts: false, bestDesign: false },
//             productAttributes: Object.keys(dynamicOptions).reduce((acc, key) => {
//                 acc[key] = '';
//                 return acc;
//             }, {}),
//         });
//         setUiState({
//             feedback: { error: '', success: '', info: '' },
//             showAllFiles: false,
//             isDragOver: false,
//             snackbarOpen: false,
//             uploadProgress: 0,
//             isUploading: false
//         });
//         if (fileInputRef.current) fileInputRef.current.value = '';
//     }, [dynamicOptions]);

//     // Now handleUpload can safely use resetForm
//     const handleUpload = useCallback(async () => {
//         clearAllFeedback();
//         const validation = validateForm();
//         if (!validation.isValid) {
//             setFeedback('error', `Please fix the following: ${validation.errors.join(', ')}`);
//             return;
//         }

//         setUiState(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }));
//         let progressInterval;

//         try {
//             const uploadFormData = createFormData(
//                 formData.tagKey.trim(),
//                 formData.selectedFiles,
//                 formData.description.trim(),
//                 formData.trendingOptions,
//                 formData.productAttributes
//             );

//             // uploadFormData.append('timestamp', new Date().toISOString());
//             // uploadFormData.append('fileCount', formData.selectedFiles.length);

//             // console.log('FormData contents:');
//             // for (let [key, value] of uploadFormData.entries()) {
//             //     if (value instanceof File) {
//             //         console.log(`${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`);
//             //     } else {
//             //         console.log(`${key}: ${value}`);
//             //     }
//             // }

//             progressInterval = setInterval(() => {
//                 setUiState(prev => ({
//                     ...prev,
//                     uploadProgress: Math.min(prev.uploadProgress + 10, 90)
//                 }));
//             }, 200);

//             await uploadImages(uploadFormData);

//             clearInterval(progressInterval);
//             setUiState(prev => ({ ...prev, uploadProgress: 100, snackbarOpen: true }));
//             setFeedback('success', 'Product uploaded successfully!');
//             localStorage.setItem('productTagkey', formData.tagKey);

//             resetForm(); // Now safe

//             setTimeout(() => {
//                 navigate(`/admin/product/manage/single`, { state: { tagkey: formData.tagKey } });
//             }, 1500);

//         } catch (err) {
//             if (progressInterval) clearInterval(progressInterval);
//             setUiState(prev => ({ ...prev, isUploading: false, uploadProgress: 0 }));

//             let errorMessage = 'Upload failed. Please try again.';
//             if (err.name === 'NetworkError' || err.message?.toLowerCase().includes('network')) {
//                 errorMessage = 'Network issue. Please check your connection.';
//             } else if (err.response?.status === 413) {
//                 errorMessage = 'Files too large. Please reduce file sizes.';
//             } else if (err.response?.status === 400) {
//                 errorMessage = err.response?.data?.message || 'Invalid data provided.';
//             } else if (err.response?.status === 500) {
//                 errorMessage = 'Server error. Please try again later.';
//             } else if (err.response?.status === 429) {
//                 errorMessage = 'Too many requests. Please wait a moment.';
//             } else if (err.message) {
//                 errorMessage = err.message;
//             }

//             setFeedback('error', errorMessage);
//         }
//     }, [
//         formData,
//         validateForm,
//         createFormData,
//         uploadImages,
//         clearAllFeedback,
//         setFeedback,
//         navigate,
//         resetForm
//     ]);

//     const getCompletionStatus = useCallback(() => {
//         const { tagKey, description, selectedFiles } = formData;
//         const requiredFields = [
//             !!tagKey.trim() && tagKey.trim().length >= CONFIG.minTagLength,
//             !!description.trim() && description.trim().length >= CONFIG.minDescriptionLength,
//             selectedFiles.length >= CONFIG.minFiles,
//         ];
//         const completed = requiredFields.filter(Boolean).length;
//         const total = requiredFields.length;

//         return {
//             status: completed === total ? 'complete' : completed === 0 ? 'incomplete' : 'partial',
//             text: completed === total ? 'Ready to Upload' : completed === 0 ? 'Not Started' : 'In Progress',
//             count: `${completed}/${total}`,
//         };
//     }, [formData]);

//     const completionStatus = getCompletionStatus();

//     const getStatusStyles = (status) => {
//         const baseStyles = "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border";
//         switch (status) {
//             case 'complete': return `${baseStyles} bg-green-50 text-green-700 border-green-200`;
//             case 'incomplete': return `${baseStyles} bg-red-50 text-red-700 border-red-200`;
//             case 'partial': return `${baseStyles} bg-yellow-50 text-yellow-700 border-yellow-200`;
//             default: return baseStyles;
//         }
//     };

//     const getStatusIcon = (status) => {
//         switch (status) {
//             case 'complete':
//                 return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
//             case 'incomplete':
//                 return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
//             case 'partial':
//                 return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;
//             default: return null;
//         }
//     };

//     return (
//         <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
//             {/* Upload Progress Overlay */}
//             {uiState.isUploading && (
//                 <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
//                     <div className="bg-white rounded-2xl p-8 text-center max-w-md w-full mx-4">
//                         <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//                         <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploading Product Images...</h3>
//                         <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
//                             <div
//                                 className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                                 style={{ width: `${uiState.uploadProgress}%` }}
//                             ></div>
//                         </div>
//                         <p className="text-sm text-gray-600">{uiState.uploadProgress}% Complete</p>
//                     </div>
//                 </div>
//             )}

//             {/* Main Content */}
//             <div className="max-w-8xl mx-auto mt-2">
//                 <div className="rounded-xl shadow-lg border border-gray-200 overflow-hidden">
//                     <div className="p-2 sm:p-8">
//                         {/* Header */}
//                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-1">
//                             <div>
//                                 <h1 className="text-xl sm:text-xl font-bold text-600 mb-1">Add Product Images</h1>
//                                 <p className="text-sm">Upload images and specifications for a product</p>
//                             </div>
//                             <div className={getStatusStyles(completionStatus.status)}>
//                                 {getStatusIcon(completionStatus.status)}
//                                 {completionStatus.text} ({completionStatus.count})
//                             </div>
//                         </div>

//                         {/* Feedback */}
//                         <div className="space-y-1 mb-2">
//                             {uiState.feedback.error && (
//                                 <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-center">
//                                     <div className="flex items-center gap-3">
//                                         <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
//                                             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                                         </svg>
//                                         <span className="text-red-700 font-medium">{uiState.feedback.error}</span>
//                                     </div>
//                                     <button onClick={() => setUiState(prev => ({ ...prev, feedback: { ...prev.feedback, error: '' } }))} className="text-red-600 hover:text-red-800">
//                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                         </svg>
//                                     </button>
//                                 </div>
//                             )}
//                             {uiState.feedback.success && (
//                                 <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-center">
//                                     <div className="flex items-center gap-3">
//                                         <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
//                                             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                                         </svg>
//                                         <span className="text-green-700 font-medium">{uiState.feedback.success}</span>
//                                     </div>
//                                     <button onClick={() => setUiState(prev => ({ ...prev, feedback: { ...prev.feedback, success: '' } }))} className="text-green-600 hover:text-green-800">
//                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                         </svg>
//                                     </button>
//                                 </div>
//                             )}
//                             {uiState.feedback.info && (
//                                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
//                                     <div className="flex items-center gap-3">
//                                         <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
//                                             <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//                                         </svg>
//                                         <span className="text-blue-700 font-medium">{uiState.feedback.info}</span>
//                                     </div>
//                                     <button onClick={() => setUiState(prev => ({ ...prev, feedback: { ...prev.feedback, info: '' } }))} className="text-blue-600 hover:text-blue-800">
//                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                         </svg>
//                                     </button>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Form Sections */}
//                         <div className="space-y-2">
//                             {/* Basic Info + Images */}
//                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                                 {/* Basic Info */}
//                                 <div className="border border-gray-200 rounded-lg p-2 hover:border-blue-500 transition-all duration-300">
//                                     <div className="flex items-center gap-2 mb-4">
//                                         <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                         </svg>
//                                         <h2 className="text-lg font-semibold">Basic Information</h2>
//                                     </div>
//                                     <div className="space-y-4">
//                                         <div>
//                                             <label className="block text-sm font-medium mb-1">Product Tag Key *</label>
//                                             <input
//                                                 type="text"
//                                                 placeholder="e.g., GOLD-EARRINGS-001"
//                                                 value={formData.tagKey}
//                                                 onChange={e => handleInputChange('tagKey', e.target.value)}
//                                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black transition-colors duration-200"
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="block text-sm font-medium">Product Description</label>
//                                             <textarea
//                                                 placeholder="Provide a detailed description..."
//                                                 value={formData.description}
//                                                 onChange={e => handleInputChange('description', e.target.value)}
//                                                 rows={4}
//                                                 className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Image Upload */}
//                                 <div className="border border-gray-200 rounded-lg p-2 hover:border-blue-500 transition-all duration-300">
//                                     <div className="flex items-center gap-2 mb-2">
//                                         <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                                         </svg>
//                                         <h2 className="text-lg font-semibold">Product Images</h2>
//                                     </div>
//                                     <div className="space-y-4">
//                                         <div
//                                             className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${uiState.isDragOver
//                                                 ? 'border-blue-500 bg-blue-50'
//                                                 : formData.selectedFiles.length > 0
//                                                     ? 'border-green-500 bg-green-50'
//                                                     : 'border-gray-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50'
//                                                 }`}
//                                             onClick={() => fileInputRef.current?.click()}
//                                             onDragEnter={handleDragEnter}
//                                             onDragLeave={handleDragLeave}
//                                             onDragOver={handleDragOver}
//                                             onDrop={handleDrop}
//                                         >
//                                             <input
//                                                 ref={fileInputRef}
//                                                 type="file"
//                                                 accept="image/jpeg,image/png,image/webp"
//                                                 multiple
//                                                 onChange={handleFileChange}
//                                                 className="hidden"
//                                             />
//                                             {formData.selectedFiles.length > 0 ? (
//                                                 <>
//                                                     <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
//                                                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                                                     </svg>
//                                                     <h3 className="text-lg font-semibold text-gray-900 mb-1">{formData.selectedFiles.length} Files Selected</h3>
//                                                     <p className="text-gray-600 text-sm">Click or drag to add more</p>
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <svg className="w-12 h-12 text-blue-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                                                     </svg>
//                                                     <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload Product Images</h3>
//                                                     <p className="text-gray-600 text-sm">JPG, PNG, WEBP • 3-10 files • Max 10MB each</p>
//                                                 </>
//                                             )}
//                                         </div>

//                                         {formData.selectedFiles.length > 0 && (
//                                             <div>
//                                                 <h4 className="text-sm font-semibold text-900 mb-1">Selected Files ({formData.selectedFiles.length})</h4>
//                                                 <div className={`flex flex-wrap gap-2 ${uiState.showAllFiles ? '' : 'max-h-48 overflow-y-auto'}`}>
//                                                     {(uiState.showAllFiles ? formData.selectedFiles : formData.selectedFiles.slice(0, 8)).map((file, index) => (
//                                                         <div key={index} className="flex items-center justify-between px-2 py-1 border border-gray-200 rounded-lg bg-gray-50">
//                                                             <span className="text-xs sm:text-sm text-gray-700 truncate max-w-[120px] sm:max-w-[200px]">{file.name}</span>
//                                                             <button onClick={() => removeFile(index)} className="text-red-600 hover:text-red-800 ml-2 p-1">
//                                                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                                                 </svg>
//                                                             </button>
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                                 {formData.selectedFiles.length > 8 && (
//                                                     <button onClick={() => setUiState(prev => ({ ...prev, showAllFiles: !prev.showAllFiles }))} className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2">
//                                                         {uiState.showAllFiles ? 'Show Less' : `View All ${formData.selectedFiles.length} Files`}
//                                                     </button>
//                                                 )}
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Product Specifications */}
//                             <div className="border border-gray-200 rounded-lg p-2 transition-all duration-300">
//                                 <div className="flex items-center gap-2 mb-2">
//                                     <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
//                                     </svg>
//                                     <h2 className="text-lg font-semibold text-900">Product Specifications</h2>
//                                 </div>
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
//                                     {Object.keys(dynamicOptions).map(attr => (
//                                         <div key={attr}>
//                                             <label className="block text-sm font-medium text-700 capitalize">
//                                                 {attr.replace(/([A-Z])/g, ' $1').trim()}
//                                             </label>
//                                             <select
//                                                 name={attr}
//                                                 value={formData.productAttributes[attr] || ''}
//                                                 onChange={e => {
//                                                     const { value } = e.target;
//                                                     setFormData(prev => ({
//                                                         ...prev,
//                                                         productAttributes: {
//                                                             ...prev.productAttributes,
//                                                             [attr]: value
//                                                         }
//                                                     }));
//                                                 }}
//                                                 className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
//                                             >
//                                                 <option value="">Select</option>
//                                                 {dynamicOptions[attr].map(option => (
//                                                     <option key={option} value={option}>{option}</option>
//                                                 ))}
//                                             </select>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>

//                             {/* Marketing Options */}
//                             <div className="border border-gray-200 rounded-lg p-2 hover:border-blue-500 transition-all duration-300">
//                                 <div className="flex items-center gap-2 mb-2">
//                                     <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//                                     </svg>
//                                     <h2 className="text-lg font-semibold text-900">Marketing Options</h2>
//                                 </div>
//                                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
//                                     {['topTrending', 'featuredProducts', 'bestDesign'].map(option => (
//                                         <label key={option} className="flex items-center space-x-3 cursor-pointer">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={formData.trendingOptions[option]}
//                                                 onChange={handleTrendingChange}
//                                                 name={option}
//                                                 className="w-4 h-4 text-600 border-gray-300 rounded focus:ring-blue-500"
//                                             />
//                                             <span className="text-700 font-medium capitalize">
//                                                 {option.replace(/([A-Z])/g, ' $1').trim()}
//                                             </span>
//                                         </label>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Action Buttons */}
//                         <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-4">
//                             <button
//                                 onClick={resetForm}
//                                 disabled={uiState.isUploading}
//                                 className="w-full sm:w-auto px-6 py-2 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
//                             >
//                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                                 </svg>
//                                 Reset Form
//                             </button>
//                             <button
//                                 onClick={handleUpload}
//                                 disabled={uiState.isUploading || completionStatus.status !== 'complete'}
//                                 className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
//                             >
//                                 {uiState.isUploading ? (
//                                     <>
//                                         <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                         Uploading...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                                         </svg>
//                                         Upload Product
//                                     </>
//                                 )}
//                             </button>
//                         </div>

//                         {/* Validation Status */}
//                         <div className="mt-2 text-center">
//                             <h3 className="text-lg font-semibold text-900 mb-1">Validation Status</h3>
//                             <div className="flex flex-wrap gap-2 justify-center">
//                                 {[
//                                     { label: 'Tag Key', valid: formData.tagKey.trim() && formData.tagKey.trim().length >= CONFIG.minTagLength },
//                                     { label: 'Description', valid: formData.description.trim() && formData.description.trim().length >= CONFIG.minDescriptionLength },
//                                     { label: `Images (${formData.selectedFiles.length}/${CONFIG.minFiles}+)`, valid: formData.selectedFiles.length >= CONFIG.minFiles },
//                                 ].map(({ label, valid }, index) => (
//                                     <span
//                                         key={index}
//                                         className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${valid
//                                             ? 'bg-green-100 text-green-800 border border-green-200'
//                                             : 'bg-gray-100 text-gray-600 border border-gray-200'
//                                             }`}
//                                     >
//                                         {valid && (
//                                             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                                                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                                             </svg>
//                                         )}
//                                         {label}
//                                     </span>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Success Snackbar */}
//             {uiState.snackbarOpen && (
//                 <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
//                     <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-300">
//                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                         </svg>
//                         Product uploaded successfully!
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AddProducts;