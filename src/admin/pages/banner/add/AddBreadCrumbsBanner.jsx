import { useState, useEffect, useMemo } from 'react';
import { useBreadCrumbUploadMutation, useBreadCrumbUpdateMutation } from '../../../hooks/banners/breadcrumbBanner/useBreadCrumbBanner';
import { useBannersQuery } from '../../../hooks/banners/breadcrumbBanner/useBreadCrumbBannerQuery';
import { useNavigate, useLocation } from 'react-router-dom';
import { useItemNames } from '../../../hooks/itemName/useItemNames';
import SelectField from '../../../components/ui/Select';
import SelectComboBox from '../../../components/ui/ComboBoxField';

const PAGE_OPTIONS = [
    { label: 'products-page', value: 'products-page' },
    { label: 'product-detail', value: 'product-detail' },
    { label: 'cart', value: 'cart' },
    { label: 'wishlist', value: 'wishlist' },
    { label: 'account', value: 'account' },
    { label: 'contact', value: 'contact' },
];

const AddBreadCrumbBanner = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state || {};
    const isEdit = state?.mode === 'edit' && state?.id;
    const editId = state?.id ?? null;

    const { data: bannersData } = useBannersQuery();
    const banners = useMemo(() => bannersData?.data?.categories || [], [bannersData]);
    const { items: itemNames = [] } = useItemNames();

    const uploadMutation = useBreadCrumbUploadMutation();
    const updateMutation = useBreadCrumbUpdateMutation();
    const isUploading = uploadMutation.isPending || uploadMutation.isLoading;
    const isUpdating = updateMutation.isPending || updateMutation.isLoading;
    const isBusy = isUploading || isUpdating;

    const [pages, setPages] = useState('');
    const [itemname, setItemname] = useState('');
    const [file, setFile] = useState(null);
    const [existingImagePath, setExistingImagePath] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const currentBanner = useMemo(() => {
        if (!isEdit) return null;
        return banners.find((b) => Number(b.id) === Number(editId)) || null;
    }, [isEdit, editId, banners]);

    useEffect(() => {
        if (isEdit && currentBanner) {
            setPages(currentBanner.pages ?? '');
            setItemname(currentBanner.itemName ?? '');
            setExistingImagePath(currentBanner.image ?? null);
        }
    }, [isEdit, currentBanner]);

    const onFileChange = (e) => {
        setError('');
        const f = e.target.files?.[0] ?? null;
        if (!f) { setFile(null); return; }
        if (!f.type.startsWith('image/')) {
            setError('Only image files are allowed (jpg, png, webp).');
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            setError('Image must be smaller than 5 MB.');
            return;
        }
        setFile(f);
    };

    const handleClear = () => {
        setPages('');
        setItemname('');
        setFile(null);
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!pages.trim()) { setError('Please select a page.'); return; }

        const isAlreadyUsed = banners?.some(
            (b) => b?.itemName?.toLowerCase() === itemname?.toLowerCase()
        );
        if (!isEdit && isAlreadyUsed) {
            setError(`Item category "${itemname}" was already used.`);
            return;
        }

        if (!isEdit && !file) { setError('Please choose an image for the banner.'); return; }

        const payload = new FormData();
        if (isEdit) {
            payload.append('id', editId);
            if (file instanceof File) payload.append('image', file);
            payload.append('pages', pages);
            payload.append('itemName', itemname);
        } else {
            payload.append('image', file);
            payload.append('pages', pages);
            payload.append('itemName', itemname);
        }

        const mutation = isEdit ? updateMutation : uploadMutation;
        const mutateArg = isEdit ? { payload, editId } : payload;

        mutation.mutate(mutateArg, {
            onSuccess: () => {
                setSuccess(isEdit ? 'Banner updated successfully.' : 'Banner uploaded successfully.');
                if (!isEdit) handleClear();
                setTimeout(() => navigate(-1), 700);
            },
            onError: (err) => {
                setError(err?.response?.data?.error || err?.message || (isEdit ? 'Update failed.' : 'Upload failed.'));
            },
        });
    };

    const itemOptions = useMemo(
        () => itemNames.map((i) => ({ label: i.ITEMNAME, value: i.ITEMNAME })),
        [itemNames]
    );

    const previewSrc = file
        ? URL.createObjectURL(file)
        : existingImagePath
            ? `${existingImagePath.startsWith('http') ? '' : 'https://app.bmgjewellers.com'}${existingImagePath}`
            : null;

    return (
        <div className="max-w-7xl mx-auto mt-8 p-2 border">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold">
                    {isEdit ? 'Edit Banner' : 'Add New Banner'}
                </h2>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    disabled={isBusy}
                    className="px-2 py-1.5 rounded-md border text-xs bg-white dark:bg-slate-700 disabled:opacity-50"
                >
                    Back
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="mb-2 text-xs text-red-700 bg-red-50 p-3 rounded">{error}</div>
            )}
            {success && (
                <div className="mb-2 text-xs text-green-700 bg-green-50 p-3 rounded">{success}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Page Name */}
                <SelectField
                    label="Page Name"
                    field="pages"
                    value={pages}
                    onChange={(_, val) => setPages(val)}
                    options={PAGE_OPTIONS}
                    placeholder="Select the page"
                    required
                    disabled={isBusy}
                />

                {/* Item Category */}
                <SelectComboBox
                    label="Item Category"
                    field="itemname"
                    value={itemname}
                    displayValue={itemname}
                    onChange={(_, val) => setItemname(val)}
                    options={itemOptions}
                    placeholder="Search item category…"
                    required
                    disabled={isBusy}
                    clearable
                />

                {/* Banner Image */}
                <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                        Banner Image{' '}
                        <span className="text-slate-400 font-normal">
                            {isEdit ? '(optional – leave to keep current)' : '*'}
                        </span>
                    </label>
                    <div className="flex items-center gap-3">
                        <div className="w-28 h-20 bg-slate-50 dark:bg-slate-700 rounded overflow-hidden border flex-shrink-0">
                            {previewSrc ? (
                                <img src={previewSrc} alt="preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-xs text-slate-400">
                                    No image
                                </div>
                            )}
                        </div>
                        <div>
                            <input
                                id="banner-file"
                                type="file"
                                accept="image/*"
                                onChange={onFileChange}
                                disabled={isBusy}
                                className="text-xs"
                            />
                            <p className="text-xs text-slate-500 mt-1">Accepts JPG, PNG or WEBP. Max 5 MB.</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleClear}
                            disabled={isBusy}
                            className="px-2 py-1.5 rounded-md border text-xs bg-white dark:bg-slate-700 disabled:opacity-50"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            disabled={isBusy}
                            className="px-2 py-1.5 rounded-md border text-xs bg-white dark:bg-slate-700 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isBusy}
                        className={`px-4 py-2 rounded-md text-white text-xs ${isBusy ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {isBusy ? (
                            <span className="flex items-center gap-2">
                                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                                {isUploading ? 'Uploading…' : 'Updating…'}
                            </span>
                        ) : (
                            isEdit ? 'Update Banner' : 'Upload Banner'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddBreadCrumbBanner;
