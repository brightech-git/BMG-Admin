import { useState, useContext, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { useUploadOccasionBannerMutation  ,useUpdateOccasionBannerMutation} from '../../../hooks/banners/occasionBanner/useUploadOccasionBanner';
import FileUploader from '../../../components/banner/FileUploader';
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Alert,
    CircularProgress,
    MenuItem,
    Select
} from '@mui/material';
import { CloudUpload as UploadIcon, CheckCircle as CheckIcon, Error as ErrorIcon, Add as AddIcon } from '@mui/icons-material';
import { MyContext } from '../../../context/themeContext/themeContext';
import './AddOccasionBanner.css';
import { useEcomMarketingAttributes } from '../../../hooks/market-options/useEcomMarketingAttributes';
import BackdropProgress from '../../../components/backDrop/BackdropProgress';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    useBannersQuery,
} from '../../../hooks/banners/occasionBanner/useOccasionBannerQuery';
import { useItemNames } from '../../../hooks/itemName/useItemNames';

// const AddOccasionBanner = () => {
//     const { themeMode } = useContext(MyContext);
//     const [image, setImage] = useState(null);
//     const [title, setTitle] = useState('');
//     const [subtitle, setSubtitle] = useState('');
//     const [occasion, setOccasion] = useState('');
//     const [gender, setGender] = useState('');
//     const [error, setError] = useState(null);
//     const [success, setSuccess] = useState(null);
//     const { mutate, isPending } = useUploadOccasionBannerMutation();
//     const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

//     const [openBackdrop, setOpenBackdrop] = useState(false);
//     const [progress, setProgress] = useState(0);


//     const { attributes } = useEcomMarketingAttributes();

//     const genderAttribute = attributes.find(attr => attr.description === "Gender");

//     // Parse the valuesJson to an array
//     const genderOptions = genderAttribute ? JSON.parse(genderAttribute.valuesJson) : [];
//     const occasionsAttribute = attributes.find(attr => attr.description === "Occasion");
//     const occasionsFromAttributes = occasionsAttribute ? JSON.parse(occasionsAttribute.valuesJson) : [];
//     const occasionOptions = occasionsFromAttributes;
//     const handleFileSelect = (file, error) => {
//         setImage(file);
//         setError(error);
//         setSuccess(null);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError(null);
//         setSuccess(null);

//         if (!image) {
//             setError('Please select a valid image file (JPEG, PNG, WEBP, max 5MB).');
//             return;
//         }

//         if (!title.trim()) {
//             setError('Please enter a title for the banner.');
//             return;
//         }

//         if (!occasion) {
//             setError('Please select an occasion.');
//             return;
//         }

//         if (!gender) {
//             setError('Please select a gender.');
//             return;
//         }

//         const payload = { image, title, subtitle: subtitle || null, occasion, gender };

//         setOpenBackdrop(true);
//         setProgress(10);

//         mutate(payload, {
//             onSuccess: () => {
//                 setProgress(100);
//                 setSuccess('Occasion Banner uploaded successfully!');
//                 setImage(null); // clear the uploaded image
//                 setTitle('');
//                 setSubtitle('');
//                 setOccasion('');
//                 setGender('');

//                 setTimeout(() => {
//                     setOpenBackdrop(false);
//                     setProgress(0);
//                     setSuccess(null);
//                 }, 1500);
//             },
//             onError: (err) => {
//                 setOpenBackdrop(false);
//                 setProgress(0);
//                 setError(err.message || 'Failed to upload occasion banner.');
//             }
//         });
//     };


//     return (
//         <div className={`add-occasion-banner-container ${themeMode}`}>
//             <Card className="add-occasion-banner-card">
//                 <CardContent>
//                     <Box className="header-section" mb={3}>
//                         <Typography variant={isMobile ? 'h6' : 'h4'} className="header-title">
//                             Add New Occasion Banner
//                         </Typography>
//                         <Typography variant="body1" className="header-subtitle">
//                             Upload a new occasion banner with title, occasion, and gender
//                         </Typography>
//                     </Box>

//                     <Box mb={3}>
//                         <Box className="form-section">
//                             <Typography className="form-label">
//                                 Banner Title <span className="required">*</span>
//                             </Typography>
//                             <TextField
//                                 placeholder="Enter banner title"
//                                 value={title}
//                                 onChange={(e) => setTitle(e.target.value)}
//                                 variant="outlined"
//                                 fullWidth
//                                 className="form-input"
//                             />

//                             <Typography className="form-label" mt={2}>
//                                 Banner Subtitle (optional)
//                             </Typography>
//                             <TextField
//                                 placeholder="Enter banner subtitle"
//                                 value={subtitle}
//                                 onChange={(e) => setSubtitle(e.target.value)}
//                                 variant="outlined"
//                                 fullWidth
//                                 className="form-input"
//                             />
//                             <Typography className="form-label" mt={2}>
//                                 Occasion <span className="required">*</span>
//                             </Typography>
//                             <Select
//                                 value={occasion}
//                                 onChange={(e) => setOccasion(e.target.value)}
//                                 displayEmpty
//                                 fullWidth
//                                 variant="outlined"
//                                 className="form-input"
//                                 renderValue={(selected) => {
//                                     if (!selected) {
//                                         return <span style={{ color: '#999' }}>Select an occasion</span>;
//                                     }
//                                     return selected
//                                         .replace(/_/g, ' ')
//                                         .toLowerCase()
//                                         .replace(/\b\w/g, (c) => c.toUpperCase());
//                                 }}
//                             >
//                                 <MenuItem value="" disabled>
//                                     Select an occasion
//                                 </MenuItem>
//                                 {occasionOptions.map((opt) => (
//                                     <MenuItem key={opt} value={opt}>
//                                         {opt
//                                             .replace(/_/g, ' ')
//                                             .toLowerCase()
//                                             .replace(/\b\w/g, (c) => c.toUpperCase())}
//                                     </MenuItem>
//                                 ))}
//                             </Select>

//                             <Typography className="form-label" mt={2}>
//                                 Gender <span className="required">*</span>
//                             </Typography>
//                             <Select
//                                 value={gender}
//                                 onChange={(e) => setGender(e.target.value)}
//                                 displayEmpty
//                                 fullWidth
//                                 variant="outlined"
//                                 className="form-input"
//                                 renderValue={(selected) => {
//                                     if (!selected) {
//                                         return <span style={{ color: '#999' }}>Select gender</span>;
//                                     }
//                                     return selected.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
//                                 }}
//                             >
//                                 <MenuItem value="" disabled>
//                                     Select gender
//                                 </MenuItem>
//                                 {genderOptions.map((opt) => (
//                                     <MenuItem key={opt} value={opt}>
//                                         {opt.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
//                                     </MenuItem>
//                                 ))}
//                             </Select>


//                         </Box>
//                     </Box>

//                     <Box mb={3}>
//                         <Box className="form-section">
//                             <Typography className="form-label">
//                                 Banner Image <span className="required">*</span>
//                             </Typography>
//                             <Typography className="form-hint">
//                                 Select a banner image (JPG, PNG, WEBP - Max 5MB)
//                             </Typography>
//                             <FileUploader
//                                 onFileSelect={handleFileSelect}
//                                 loading={isPending}
//                                 height={300}
//                             />
//                         </Box>
//                     </Box>

//                     <AnimatePresence>
//                         {error && (
//                             <motion.div
//                                 initial={{ opacity: 0, height: 0 }}
//                                 animate={{ opacity: 1, height: 'auto' }}
//                                 exit={{ opacity: 0, height: 0 }}
//                                 transition={{ duration: 0.2 }}
//                             >
//                                 <Alert severity="error" icon={<ErrorIcon />} className="alert error">
//                                     {error}
//                                 </Alert>
//                             </motion.div>
//                         )}
//                         {success && (
//                             <motion.div
//                                 initial={{ opacity: 0, height: 0 }}
//                                 animate={{ opacity: 1, height: 'auto' }}
//                                 exit={{ opacity: 0, height: 0 }}
//                                 transition={{ duration: 0.2 }}
//                             >
//                                 <Alert severity="success" icon={<CheckIcon />} className="alert success">
//                                     {success}
//                                 </Alert>
//                             </motion.div>
//                         )}
//                     </AnimatePresence>

//                     <Box className="action-buttons">
//                         <Button
//                             onClick={handleSubmit}
//                             variant="contained"
//                             disabled={isPending || !image || !title.trim() || !occasion || !gender}
//                             startIcon={isPending ? <CircularProgress size={24} /> : <AddIcon />}
//                             className="btn primary"
//                         >
//                             {isPending ? 'Uploading...' : 'Upload Banner'}
//                         </Button>
//                     </Box>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// };

const AddOccasionBanner = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state || {};

    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [itemname, setItemname] = useState('');
    const [file, setFile] = useState(null);
    const [existingImagePath, setExistingImagePath] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const isEdit = state?.mode === "edit";
    const editId = state?.id ?? null;

    const { data: bannerData, isLoading, isError } = useBannersQuery();
    const updateMutation = useUpdateOccasionBannerMutation();
    const uploadMutation = useUploadOccasionBannerMutation();

    const { items: itemNames = [] } = useItemNames();

    // Safely extract banners array
    const banners = useMemo(() => {
        if (!bannerData) return [];

        // Handle different possible response structures
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

    const currentBanner = useMemo(() => {
        if (!isEdit) return null;
        return banners.find((b) => Number(b.id) === Number(editId)) || null;
    }, [isEdit, editId, banners]);

    useEffect(() => {
        if (isEdit && currentBanner) {
            setTitle(currentBanner.title ?? "");
            setSubtitle(currentBanner.subtitle ?? "");
            setItemname(currentBanner.occasion ?? "");
            setExistingImagePath(currentBanner.image_path ?? null);
        }
    }, [isEdit, currentBanner]);

    const onFileChange = (e) => {
        setError("");
        const f = e.target.files?.[0] ?? null;
        if (!f) {
            setFile(null);
            return;
        }
        if (!f.type.startsWith("image/")) {
            setError("Only image files are allowed (jpg, png, webp).");
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            setError("Image must be smaller than 5 MB.");
            return;
        }
        setFile(f);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validation
        // if (!title.trim()) {
        //     setError("Please enter a title.");
        //     return;
        // }
        // if (!subtitle.trim()) {
        //     setError("Please enter a subtitle.");
        //     return;
        // }
        if (!itemname) {
            setError("Please select an item category.");
            return;
        }
        // For Add: image required. For Edit: optional
        if (!isEdit && !file) {
            setError("Please choose an image for the banner.");
            return;
        }

        // Build payload (FormData if file present)
        const payload = new FormData();
        if (isEdit) {
            // console.log(editId, title, subtitle, itemname, 'formdata');
            payload.append("id", editId);
            // Only append image if user selected a new one
            if (file instanceof File) payload.append("image", file);
            // payload.append("title", title);
            // payload.append("subtitle", subtitle);
            payload.append("occasion", itemname);
            // payload.append('gender' )
        } else {
            // Add
            payload.append("image", file);
            // payload.append("title", title);
            // payload.append("subtitle", subtitle);
            payload.append("occasion", itemname);
        }

        // Call correct mutation - FIXED: Check if mutate function exists
        if (isEdit) {
            // Check if updateMutation has mutate function
            if (updateMutation && typeof updateMutation.mutate === 'function') {
                updateMutation.mutate(payload, {
                    onSuccess: () => {
                        setSuccess("Banner updated successfully.");
                        setTimeout(() => {
                            navigate("/occasionbanner/manage");
                        }, 700);
                    },
                    onError: (err) => {
                        const msg = err?.response?.data?.error || err?.message || "Update failed.";
                        setError(msg);
                    },
                });
            } else {
                console.error('updateMutation.mutate is not a function', updateMutation);
                setError("Update functionality is not available. Please check the mutation hook.");
            }
        } else {
            // Check if uploadMutation has mutate function
            if (uploadMutation && typeof uploadMutation.mutate === 'function') {
                uploadMutation.mutate(payload, {
                    onSuccess: () => {
                        setSuccess("Banner uploaded successfully.");
                        // Clear form
                        setTitle("");
                        setSubtitle("");
                        setItemname("");
                        setFile(null);
                        setExistingImagePath(null);
                        setTimeout(() => {
                            navigate("/occasionbanner/manage");
                        }, 700);
                    },
                    onError: (err) => {
                        const msg = err?.response?.data?.error || err?.message || "Upload failed.";
                        setError(msg);
                    },
                });
            } else {
                console.error('uploadMutation.mutate is not a function', uploadMutation);
                setError("Upload functionality is not available. Please check the mutation hook.");
            }
        }
    };

    // Get loading states safely
    const isUploading = updateMutation?.isLoading || false;
    const isUpdating = uploadMutation?.isLoading || false;

    return (
        <div className="max-w-7xl mx-auto mt-8 p-2 border">
            <div className="">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold mb-1">
                        {isEdit ? "Edit Banner" : "Add New Banner"}
                    </h2>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-2 py-1.5 rounded-md border text-xs bg-white dark:bg-slate-700"
                        disabled={isUploading || isUpdating}
                    >
                        Back
                    </button>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-1 text-xs text-red-700 bg-red-50 p-3 rounded">{error}</div>
                )}
                {success && (
                    <div className="mb-1 text-xs text-green-700 bg-green-50 p-3 rounded">{success}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-2">
                    {/* Title */}
                    {/* <div>
                        <label className="block text-xs font-medium mb-1">
                            Banner Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border px-2 py-1.5 text-xs"
                            placeholder="Enter banner title"
                            disabled={isUploading || isUpdating}
                        />
                    </div> */}

                    {/* Subtitle */}
                    {/* <div>
                        <label className="block text-xs font-medium mb-1">
                            Banner Subtitle <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            className="w-full border px-2 py-1.5 text-xs"
                            placeholder="Enter banner subtitle"
                            disabled={isUploading || isUpdating}
                        />
                    </div> */}

                    {/* Item Category */}
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Item Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={itemname}
                            onChange={(e) => setItemname(e.target.value)}
                            className="w-full border px-2 py-1.5 text-xs"
                            disabled={isUploading || isUpdating}
                        >
                            <option value="" disabled>Select item category</option>
                            {Array.isArray(itemNames) && itemNames.map((it) => (
                                <option key={it.ITEMCTRID} value={it.ITEMCTRNAME}>
                                    {it.ITEMCTRNAME}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Image */}
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                            Banner Image {isEdit ? "(optional - leave to keep current)" : "*"}
                        </label>

                        <div className="flex items-center gap-2">
                            {/* Preview */}
                            <div className="w-30 h-20 bg-slate-50 dark:bg-slate-700 rounded overflow-hidden border">
                                {file ? (
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt="preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : existingImagePath ? (
                                    <img
                                        src={`${existingImagePath.startsWith("http") ? "" : "https://app.bmgjewellers.com"}${existingImagePath}`}
                                        alt="current"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-sm text-slate-400">
                                        No image
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <input
                                    id="banner-file"
                                    type="file"
                                    accept="image/*"
                                    onChange={onFileChange}
                                    disabled={isUploading || isUpdating}
                                    className="text-xs"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Accepts JPG, PNG or WEBP. Max 5MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setTitle("");
                                    setSubtitle("");
                                    setItemname("");
                                    setFile(null);
                                    setError("");
                                    setSuccess("");
                                }}
                                className="px-2 py-1.5 rounded-md border text-xs bg-white dark:bg-slate-700"
                                disabled={isUploading || isUpdating}
                            >
                                Clear
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-2 py-1.5 rounded-md border text-xs bg-white dark:bg-slate-700"
                                disabled={isUploading || isUpdating}
                            >
                                Cancel
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isUploading || isUpdating}
                            className={`px-4 py-2 rounded-md text-white text-sm ${isUploading || isUpdating ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"
                                }`}
                        >
                            {(isUploading || isUpdating) ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-2 h-2 animate-spin" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                    </svg>
                                    {isUploading ? "Uploading..." : "Updating..."}
                                </span>
                            ) : (
                                <span className="text-xs">{isEdit ? "Update Banner" : "Upload Banner"}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddOccasionBanner;