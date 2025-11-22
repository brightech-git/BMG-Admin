
import { useState, useMemo ,useEffect } from 'react';
import {useLocation ,useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUploadMenuItem, useMenu ,useUpdateMenuItem } from '../../../hooks/navItems/useHeaderNavItems';
import { useItemNames } from '../../../hooks/itemName/useItemNames';
import './AddMenuItemPage.css';

const AddMenuItemPage = () => {
    // const { themeMode } = useContext(MyContext);
    // const [formData, setFormData] = useState({
    //     label: '',
    //     name: '',
    //     name: '',
    //     keyName: ''
    // });
    // const [selectedFile, setSelectedFile] = useState(null);
    // const [error, setError] = useState(null);
    // const [success, setSuccess] = useState(null);
    // const { mutate: uploadMenuItem, isLoading } = useUploadMenuItem();

    // const handleInputChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData((prev) => ({ ...prev, [name]: value }));
    //     setError(null);
    //     setSuccess(null);
    // };

    // const handleFileChange = (e) => {
    //     setError(null);
    //     setSuccess(null);

    //     const file = e.target.files[0];
    //     const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    //     const maxSize = 5 * 1024 * 1024; // 5MB

    //     if (!file) return;

    //     if (!validTypes.includes(file.type)) {
    //         setError('Only JPG, PNG, and WEBP formats are allowed.');
    //         return;
    //     }

    //     if (file.size > maxSize) {
    //         setError('File must be less than 5MB.');
    //         return;
    //     }

    //     setSelectedFile(file);
    // };

    // const removeFile = () => {
    //     setSelectedFile(null);
    //     document.getElementById('fileInput').value = '';
    // };

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     setError(null);
    //     setSuccess(null);

    //     const { label, name, name, keyName } = formData;

    //     if (!label.trim() || !name.trim() || !name.trim() || !keyName.trim()) {
    //         setError('Section Label, Name, Key Name, and Key Value are required.');
    //         return;
    //     }

    //     if (!/^[a-zA-Z0-9\s]+$/.test(label) || !/^[a-zA-Z0-9\s]+$/.test(name)) {
    //         setError('Section Label and Name can only contain letters, numbers, and spaces.');
    //         return;
    //     }

    //     if (!selectedFile) {
    //         setError('An image is required.');
    //         return;
    //     }

    //     const formDataToSend = new FormData();
    //     formDataToSend.append('label', label.trim());
    //     formDataToSend.append('name', name.trim());
    //     formDataToSend.append('name', name.trim());
    //     formDataToSend.append('keyName', keyName.trim());
    //     formDataToSend.append('image', selectedFile);

    //     uploadMenuItem(formDataToSend, {
    //         onSuccess: (data) => {
    //             setSuccess(data.message || 'Menu item uploaded successfully!');
    //             setTimeout(() => {
    //                 setFormData({ label: '', name: '', name: '', keyName: '' });
    //                 setSelectedFile(null);
    //                 document.getElementById('fileInput').value = '';
    //                 setSuccess(null);
    //             }, 3000);
    //         },
    //         onError: (err) => {
    //             setError(err.response?.data?.error || 'Failed to upload menu item.');
    //         }
    //     });
    // };

    // return (
    //     <div className={`add-menu-item-container ${themeMode}`}>
    //         <Card className="add-menu-item-card">
    //             <CardContent>
    //                 <Box textAlign="center" mb={3}>
    //                     <Typography variant="h4" className="header-name">
    //                         Add New Menu Item
    //                     </Typography>
    //                     <Typography variant="body1" className="header-keyName">
    //                         Create a new menu item for the header navigation
    //                     </Typography>
    //                 </Box>

    //                 <Box mb={4}>
    //                     <Box className="form-section">
                          
    //                         <Box display="grid" gap={2} className="form-grid">
    //                             <TextField
    //                                 name="label"
    //                                 placeholder="Enter section label"
    //                                 value={formData.label}
    //                                 onChange={handleInputChange}
    //                                 variant="outlined"
    //                                 fullWidth
    //                                 label="Section Label"
    //                                 className="form-inputs"
    //                                 InputProps={{
    //                                     startAdornment: (
    //                                         <InputAdornment position="start">
    //                                             <AddIcon />
    //                                         </InputAdornment>
    //                                     )
    //                                 }}
    //                             />
    //                             <TextField
    //                                 name="name"
    //                                 placeholder="Enter name (e.g., keyValue, gender)"
    //                                 value={formData.name}
    //                                 onChange={handleInputChange}
    //                                 variant="outlined"
    //                                 fullWidth
    //                                 label="Name"
    //                                 className="form-inputs"
    //                                 InputProps={{
    //                                     startAdornment: (
    //                                         <InputAdornment position="start">
    //                                             <AddIcon />
    //                                         </InputAdornment>
    //                                     )
    //                                 }}
    //                             />
    //                             <TextField
    //                                 name="name"
    //                                 placeholder="Enter key name"
    //                                 value={formData.name}
    //                                 onChange={handleInputChange}
    //                                 variant="outlined"
    //                                 fullWidth
    //                                 label="Key Name"
    //                                 className="form-inputs"
    //                                 InputProps={{
    //                                     startAdornment: (
    //                                         <InputAdornment position="start">
    //                                             <AddIcon />
    //                                         </InputAdornment>
    //                                     )
    //                                 }}
    //                             />
    //                             <TextField
    //                                 name="keyName"
    //                                 placeholder="Enter key value"
    //                                 value={formData.keyName}
    //                                 onChange={handleInputChange}
    //                                 variant="outlined"
    //                                 fullWidth
    //                                 label="Key Value"
    //                                 className="form-inputs"
    //                                 InputProps={{
    //                                     startAdornment: (
    //                                         <InputAdornment position="start">
    //                                             <AddIcon />
    //                                         </InputAdornment>
    //                                     )
    //                                 }}
    //                             />
    //                         </Box>
    //                         <Typography variant="caption" className="form-caption">
    //                             Only letters, numbers, and spaces are allowed
    //                         </Typography>
    //                     </Box>
    //                 </Box>

    //                 <Box mb={4}>
    //                     <Box className="form-section">
    //                         <Typography variant="body2" className="section-name">
    //                             <UploadIcon /> Menu Item Image <span className="required">*</span>
    //                         </Typography>
    //                         <Typography variant="body2" className="form-caption">
    //                             Select an image (JPG, PNG, WEBP - Max 5MB)
    //                         </Typography>
    //                         <Box
    //                             className="upload-area"
    //                             onClick={() => document.getElementById('fileInput').click()}
    //                         >
    //                             <input
    //                                 id="fileInput"
    //                                 type="file"
    //                                 accept="image/jpeg,image/png,image/webp"
    //                                 onChange={handleFileChange}
    //                                 style={{ display: 'none' }}
    //                             />
    //                             <UploadIcon />
    //                             <Typography variant="h6" className="upload-name">
    //                                 {selectedFile ? selectedFile.name : 'Click or drag image here'}
    //                             </Typography>
    //                             <Typography variant="body2" className="upload-keyName">
    //                                 Select JPG/PNG/WEBP file (Max 5MB)
    //                             </Typography>
    //                             {selectedFile && (
    //                                 <Chip
    //                                     label={`${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`}
    //                                     onDelete={removeFile}
    //                                     className="image-chip"
    //                                 />
    //                             )}
    //                         </Box>
    //                     </Box>
    //                 </Box>

    //                 <AnimatePresence>
    //                     {(error || success) && (
    //                         <motion.div
    //                             initial={{ opacity: 0, y: -10 }}
    //                             animate={{ opacity: 1, y: 0 }}
    //                             exit={{ opacity: 0, y: -10 }}
    //                             transition={{ duration: 0.2 }}
    //                         >
    //                             {error && (
    //                                 <Alert
    //                                     severity="error"
    //                                     icon={<ErrorIcon />}
    //                                     onClose={() => setError(null)}
    //                                     className="alert error"
    //                                 >
    //                                     {error}
    //                                 </Alert>
    //                             )}
    //                             {success && (
    //                                 <Alert
    //                                     severity="success"
    //                                     icon={<CheckIcon />}
    //                                     onClose={() => setSuccess(null)}
    //                                     className="alert success"
    //                                 >
    //                                     {success}
    //                                 </Alert>
    //                             )}
    //                         </motion.div>
    //                     )}
    //                 </AnimatePresence>

    //                 <Box display="flex" justifyContent="center" gap={2} mt={4}>
    //                     <Button
    //                         variant="outlined"
    //                         onClick={() => {
    //                             setFormData({ label: '', name: '', name: '', keyName: '' });
    //                             setSelectedFile(null);
    //                             document.getElementById('fileInput').value = '';
    //                         }}
    //                         disabled={isLoading}
    //                         className="btn secondary"
    //                     >
    //                         Clear
    //                     </Button>
    //                     <Button
    //                         variant="contained"
    //                         onClick={handleSubmit}
    //                         disabled={isLoading || !formData.label.trim() || !formData.name.trim() || !formData.name.trim() || !formData.keyName.trim() || !selectedFile}
    //                         startIcon={isLoading ? <CircularProgress size={24} /> : <AddIcon />}
    //                         className="btn primary"
    //                     >
    //                         {isLoading ? 'Uploading...' : 'Upload Menu Item'}
    //                     </Button>
    //                 </Box>
    //             </CardContent>
    //         </Card>
    //     </div>
    // );
    
    
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state || {};
    const isEdit = state?.mode === "edit" ;
    const editId = state?.id ?? null;

    // queries / mutations
    const { data: bannersData, isLoading: bannersLoading } = useMenu();

    const banners = useMemo(() => bannersData?.menuSections || [], [bannersData]);

    const { items: keyValues = [] } = useItemNames();

    const uploadMutation = useUploadMenuItem();
    const updateMutation = useUpdateMenuItem();
    const isUploading = uploadMutation.isPending || uploadMutation.isLoading;
    const isUpdating = updateMutation.isPending || updateMutation.isLoading;


    const labels = ["Shop by Occasion" ,"Shop by Gender","Shop by Price" ,"Shop by Category"]
    // form state
    const [label , setLabel] =useState("");
    const [name, setName] = useState("");
    const [keyName, setKeyName] = useState("");
    const [keyValue, setKeyValue] = useState("");
    const [file, setFile] = useState(null); // new File
    const [existingKeyValue ,setExistingKeyValue] = useState('')
    const [existingImagePath, setExistingImagePath] = useState(null); // show existing image for edit
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    const allBanners = useMemo(() => {
        if (!banners || banners.length === 0) return [];
        return banners.flatMap(category =>
            category.items.map(item => item.keyValue) // or keyValue
        );
    }, [banners]);
    console.log(allBanners ,'AllbannerinHeader')

    // find banner for edit (if editing)
    const currentBanner = useMemo(() => {
        if (!isEdit) return null;

        return banners
            .flatMap(category =>
                category.items.map(item => ({
                    ...item,
                    label: category.label, 
                    
                }))
            )
            .find(b => (b.id) === (editId)) || null;
    }, [isEdit, editId, banners]);


    // pre-fill on load when editing
    useEffect(() => {
        if (isEdit && currentBanner) {
            setLabel(currentBanner.label);
            setName(currentBanner.name ?? "");
            setKeyName(currentBanner.keyName ?? "");
            setKeyValue(currentBanner.keyValue ?? "");
            setExistingKeyValue(currentBanner.keyValue ?? '');
            setExistingImagePath(currentBanner.image ?? null);
        }
    }, [isEdit, currentBanner]);
    // File input handlers
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

        // validation
        if(!label.trim()){
            setError ( "Please Choose the Label.")
            return;
        }
        if (!name.trim()) {
            setError("Please enter a name.");
            return;
        }
        if (!keyName.trim()) {
            setError("Please enter a keyName.");
            return;
        }
        if ( !keyValue ) {
            setError("Please select an item category.");
            return;
        }
        if (!isEdit && allBanners.includes(keyValue)) {
            setError("This item category already exists.");
            return;
        }
        // For Add: image required. For Edit: optional
        if (!isEdit && !file) {
            setError("Please choose an image for the banner.");
            return;
        }

        // build payload (FormData if file present)
        const payload = new FormData();
        if (isEdit) {

            payload.append("id", editId);
            // only append image if user selected a new one
            if (file instanceof File) payload.append("image", file);
            payload.append("label" ,label)
            payload.append("name", name);
            payload.append("title", keyName);
            payload.append("subtitle", keyValue);
            // omit gender as requested
        } else {
            // Add
            payload.append("label" , label)
            payload.append("image", file);
            payload.append("name", name);
            payload.append("title", keyName);
            payload.append("subtitle", keyValue);
        }

        // call correct mutation
        if (isEdit) {
            updateMutation.mutate(payload, {
                onSuccess: () => {
                    setSuccess("Banner updated successfully.");
                    setTimeout(() => {
                        navigate("/header/manage"); // go back to list (change if needed)
                    }, 700);
                },
                onError: (err) => {
                    const msg = err?.response?.data?.error || err?.message || "Update failed.";
                    setError(msg);
                },
            });
        } else {
            uploadMutation.mutate(payload, {
                onSuccess: () => {
                    setSuccess("Banner uploaded successfully.");
                    // clear form
                    setName("");
                    setKeyName("");
                    setKeyValue("");
                    setFile(null);
                    setExistingImagePath(null);
                    setTimeout(() => {
                        navigate("/header/manage"); // go back to list
                    }, 700);
                },
                onError: (err) => {
                    const msg = err?.response?.data?.error || err?.message || "Upload failed.";
                    setError(msg);
                },
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto mt-8 p-2 border">
            <div className="">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold mb-1">
                        {isEdit ? "Edit Header Banner" : "Add New Header Banner"}
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
                {/* messages */}
                {error && (
                    <div className="mb-1 text-xs text-red-700 bg-red-50 p-3 rounded">{error}</div>
                )}
                {success && (
                    <div className="mb-1 text-xs text-green-700 bg-green-50 p-3 rounded">{success}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-2">
                    {/* label */}
                    <div>
                        <label className="block text-xs font-medium  mb-1">
                            Label <span className="text-red-500">*</span>
                        </label>
                        <select value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="w-full border px-2 py-1.5 text-xs"
                            disabled={isUploading || isUpdating} >
                            <option value="">Select Label</option>
                            {labels.map((it) => (
                                <option key={it} value={it}>
                                    {it}
                                </option>
                            ))}
                        </select>
                        {/* <input
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="w-full border px-2 py-1.5 text-xs"
                            placeholder="Enter name"
                            disabled={isUploading || isUpdating}
                        /> */}
                    </div>
                    {/* name */}
                    <div>
                        <label className="block text-xs font-medium  mb-1">
                             name <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border px-2 py-1.5 text-xs"
                            placeholder="Enter name"
                            disabled={isUploading || isUpdating}
                        />
                    </div>

                    {/* keyName */}
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            keyName <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={keyName}
                            onChange={(e) => setKeyName(e.target.value)}
                            className="w-full border px-2 py-1.5 text-xs"
                            placeholder="Enter keyName"
                            disabled={isUploading || isUpdating}
                        />
                    </div>

                    {/* keyvalue */}
                    <div>
                        <label className="block text-xs font-medium  mb-1">
                            keyValue <span className="text-red-500">*</span>
                        </label>
                        {label.toLowerCase() != 'shop by price' ? (
                            <select
                            value={keyValue}
                            onChange={(e) => setKeyValue(e.target.value)}
                            className="w-full border px-2 py-1.5 text-xs"
                            disabled={isUploading || isUpdating}
                        >
                            <option value="" disabled>Select item category</option>
                            {keyValues.map((it) => (
                                <option key={it.ITEMCTRID} value={it.ITEMCTRNAME}>
                                    {it.ITEMCTRNAME}
                                </option>
                            ))}
                        </select>
                        ) : (
                            <input
                            type='number'
                            value={keyValue}
                            onChange={(e) => setKeyValue(e.target.value)}
                            className="w-full border px-2 py-1.5 text-xs"
                            disabled={isUploading || isUpdating}
                        />
                            
                  
                    ) }
                        
                    </div>

                    {/* Image */}
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                            Image {isEdit ? "(optional - leave to keep current)" : "*"}
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
                                    setName("");
                                    setKeyName("");
                                    setKeyValue("");
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
                                <span className="flex items-center gap-2 ">
                                    <svg className="w-2 h-2 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                                    {isUploading ? "Uploading..." : "Updating..."}
                                </span>
                            ) : (
                                <span className="text-xs" >{isEdit ? "Update Banner" : "Upload Banner"}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMenuItemPage;