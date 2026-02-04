import React, { useState, useContext, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useAddressQuery } from '../../hooks/address/useAddressQuery';
import { MyContext } from '../../context/themeContext/themeContext';
import './ManageAddress.css';
import {
    FaTrash,      // delete
    FaEdit,       // edit
    FaPlus,       // add
    FaHome,       // home
    FaPhone,      // phone
    FaMapMarkerAlt, // location_on
    FaCheckCircle,  // check_circle
    FaExclamationCircle, // error
    FaUserAlt,     // person_pin
    FaTimes
} from "react-icons/fa";

const ManageAddress = () => {
    const { themeMode } = useContext(MyContext);
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const isSmallScreen = useMediaQuery({ query: '(max-width: 480px)' });
    const { useGetAllAddresses, useAddAddress, useUpdateAddress, useDeleteAddress } = useAddressQuery();

    const { data: addresses, isLoading } = useGetAllAddresses();
    const addAddressMutation = useAddAddress();
    const updateAddressMutation = useUpdateAddress();
    const deleteAddressMutation = useDeleteAddress();

    const [address, setAddress] = useState([]);

    useEffect(() => {
        setAddress(addresses);
    }, [addresses]);

    const [open, setOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentAddressId, setCurrentAddressId] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        alternatePhone: '',
        addressLine1: '',
        addressLine2: '',
        pincode: '',
        city: '',
        state: '',
        country: '',
        isDefault: false
    });
    const [formErrors, setFormErrors] = useState({});

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Full Name is required';
        if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone)) errors.phone = 'Valid 10-digit phone number is required';
        if (formData.alternatePhone && !/^\d{10}$/.test(formData.alternatePhone)) errors.alternatePhone = 'Valid 10-digit alternate phone number is required';
        if (!formData.addressLine1.trim()) errors.addressLine1 = 'Address Line 1 is required';
        if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode)) errors.pincode = 'Valid 6-digit pincode is required';
        if (!formData.city.trim()) errors.city = 'City is required';
        if (!formData.state.trim()) errors.state = 'State is required';
        if (!formData.country.trim()) errors.country = 'Country is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });

        // Auto close after 3 seconds
        setTimeout(() => {
            setSnackbar(prev => ({ ...prev, open: false }));
        }, 3000);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleOpen = (address = null) => {
        if (address) {
            setIsEditMode(true);
            setCurrentAddressId(address.id);
            setFormData(address);
        } else {
            setIsEditMode(false);
            setFormData({
                name: '',
                phone: '',
                alternatePhone: '',
                addressLine1: '',
                addressLine2: '',
                pincode: '',
                city: '',
                state: '',
                country: '',
                isDefault: false
            });
        }
        setFormErrors({});
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentAddressId(null);
        setFormErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e) => {
        setFormData((prev) => ({ ...prev, isDefault: e.target.checked }));
    };

    const handleSubmit = async () => {
        
        if (!validateForm()) {
            showSnackbar('Please correct the form errors.', 'error');
            return;
        }
        try {
            if (isEditMode) {
                await updateAddressMutation.mutateAsync({
                    id: currentAddressId,
                    updatedAddress: formData
                });
                showSnackbar('Address updated successfully!', 'success');
            } else {
                await addAddressMutation.mutateAsync({ address: formData });
                showSnackbar('Address added successfully!', 'success');
            }
            handleClose();
        } catch (error) {
            console.error('Error saving address:', error);
            showSnackbar('Failed to save address. Please try again.', 'error');
        }
    };

    const handleDelete = async (id, name) => {
        try {
            await deleteAddressMutation.mutateAsync({ id });
            showSnackbar(`Address for ${name} deleted successfully!`, 'error');
        } catch (error) {
            console.error('Error deleting address:', error);
            showSnackbar('Failed to delete address. Please try again.', 'error');
        }
    };

    const isFormLoading = addAddressMutation.isLoading || updateAddressMutation.isLoading;

    // Icons as components since we removed MUI
    const Icon = ({ children, className = '' }) => (
        <span className={`material-icons ${className}`}>{children}</span>
    );

    const DeleteIcon = () => <FaTrash />;
    const EditIcon = () => <FaEdit />;
    const AddIcon = () => <FaPlus />;
    const HomeIcon = () => <FaHome />;
    const PhoneIcon = () => <FaPhone /> ;
    const LocationOnIcon = () => <FaMapMarkerAlt />;
    const CheckCircleIcon = () => <FaCheckCircle />;
    const ErrorIcon = () => <FaExclamationCircle />;
    const PersonPinIcon = () => <FaUserAlt/>;

    return (
        <div className={`manage-address-container ${themeMode} min-h-screen bg-background p-4 md:p-6`}>
            {/* Header Card */}
            <div className=" mb-2 p-2">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-2 md:space-y-0">
                    <div className="flex items-center space-x-1">
                      
                        <div>
                            <h1 className={`text-sm font-bold text-primaryText`}>
                                Manage Addresses
                            </h1>
                            <p className="text-secondaryText text-xs">
                                Add, edit, and manage your delivery addresses
                            </p>
                        </div>
                    </div>
                    <div className="flex-1">
                        <button
                            onClick={() => handleOpen()}
                            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center space-x-2 w-full md:w-auto justify-center"
                        >
                            <AddIcon />
                            <span className='text-xs'>Add New Address</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="bg-card rounded-lg shadow-md p-8 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-primaryText font-semibold">Loading your addresses...</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                    {Array.isArray(address) && address.length > 0 ? (
                        address.map((address, index) => (
                            <div
                                key={address.id}
                                className={`bg-card rounded-lg shadow-md border-2 transition-all duration-300 ${address.isDefault ? 'border-primary shadow-lg' : 'border-transparent'
                                    }`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 ">
                                                <PersonPinIcon className="text-primary w-3 h-3" />
                                                <h3 className="font-semibold text-xs text-primaryText">{address.name}</h3>
                                            </div>
                                            {address.isDefault && (
                                                <span className="bg-success text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                                                    <CheckCircleIcon className="text-xs" />
                                                    <span>Default</span>
                                                </span>
                                            )}
                                        </div>
                                        <div className="border-t border-border"></div>
                                        <div className="space-y-1">
                                            <div className="flex items-start space-x-1">
                                                <LocationOnIcon className="text-primary mt-0.5 flex-shrink-0" />
                                                <p className="text-secondaryText text-sm">
                                                    {address.addressLine1}
                                                    {address.addressLine2 && `, ${address.addressLine2}`}
                                                </p>
                                            </div>
                                            <p className="text-secondaryText text-xs ml-6">
                                                {address.city}, {address.state}
                                            </p>
                                            <p className="text-secondaryText text-xs ml-6">
                                                {address.country} - {address.pincode}
                                            </p>
                                            <div className="flex items-center space-x-2 ml-6">
                                                <PhoneIcon className="text-primary" />
                                                <p className="text-secondaryText text-xs m-2">
                                                    {address.phone}
                                                    {address.alternatePhone && ` | ${address.alternatePhone}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t border-border"></div>
                                <div className="p-2 flex justify-end space-x-2">
                                    <button
                                        onClick={() => handleOpen(address)}
                                        className="p-2 text-primary hover:bg-primary hover:bg-opacity-10 rounded-lg transition-colors"
                                    >
                                        <EditIcon />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(address.id, address.name)}
                                        className="p-2 text-red-500 hover:bg-error hover:bg-opacity-10 rounded-lg transition-colors"
                                        disabled={deleteAddressMutation.isLoading}
                                    >
                                        <DeleteIcon />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <div className="bg-card rounded-lg shadow-md p-8 text-center">
                                <div className="flex flex-col items-center space-y-4">
                                    <HomeIcon className="text-4xl text-primary" />
                                    <h3 className="text-sm font-semibold text-primaryText">No addresses found</h3>
                                    <p className="text-secondaryText">Start by adding your first delivery address</p>
                                    <button
                                        onClick={() => handleOpen()}
                                        className="border border-primary text-primary hover:bg-primary hover:bg-opacity-10 px-4 py-2 rounded-lg flex items-center space-x-2"
                                    >
                                        <AddIcon />
                                        <span>Add Your First Address</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Dialog */}
            {open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className={`bg-white rounded-lg shadow-xl w-full max-w-2xl mt-5 max-h-[90vh] overflow-y-auto ${isMobile ? 'h-full' : ''}`}>
                        {/* Dialog Header */}
                        <div className="p-2 border-b border-border gap-2">
                            <div className="flex items-center space-x-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${isEditMode ? 'bg-warning' : 'bg-success'
                                    }`}>
                                    {isEditMode ? <EditIcon /> : <AddIcon />}
                                </div>
                                <div>
                                    <h2 className={`text-sm font-bold text-primaryText`}>
                                        {isEditMode ? 'Edit Address' : 'Add New Address'}
                                    </h2>
                                    <p className="text-secondaryText text-sm">
                                        {isEditMode ? 'Update your address details' : 'Fill in your address information'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Dialog Content */}
                        <div className="p-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {/* Name Field */}
                                <div className="md:col-span-2 lg:col-span-1">
                                    <label className="block text-xs font-medium text-primaryText mb-1">
                                        Full Name *
                                    </label>
                                    <div className="relative">
                                        {/* <PersonPinIcon className="absolute left-4 top-2 transform -translate-y-1/2 text-primary" /> */}
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`w-full pl-1 text-xs  py-1.5 border y ${formErrors.name ? 'border-error' : 'border-border'
                                                }`}
                                            placeholder="Enter full name"
                                        />
                                    </div>
                                    {formErrors.name && (
                                        <p className="text-red-500 text-xs  mt-1">{formErrors.name}</p>
                                    )}
                                </div>

                                {/* Phone Field */}
                                <div className="md:col-span-2 lg:col-span-1">
                                    <label className="block text-xs  font-medium text-primaryText mb-1">
                                        Phone Number *
                                    </label>
                                    <div className="relative">
                                        {/* <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" /> */}
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className={`w-full pl-1 py-1.5 text-xs  border  ${formErrors.phone ? 'border-error' : 'border-border'
                                                }`}
                                            placeholder="10-digit phone number"
                                        />
                                    </div>
                                    {formErrors.phone && (
                                        <p className="text-red-500 text-xs  mt-1">{formErrors.phone}</p>
                                    )}
                                </div>

                                {/* Alternate Phone Field */}
                                <div className="md:col-span-2 lg:col-span-1">
                                    <label className="block text-xs  font-medium text-primaryText mb-1">
                                        Alternate Phone
                                    </label>
                                    <div className="relative">
                                        {/* <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" /> */}
                                        <input
                                            type="text"
                                            name="alternatePhone"
                                            value={formData.alternatePhone}
                                            onChange={handleInputChange}
                                            className={`w-full pl-1  py-1.5 text-xs  border  ${formErrors.alternatePhone ? 'border-error' : 'border-border'
                                                }`}
                                            placeholder="10-digit alternate phone"
                                        />
                                    </div>
                                    {formErrors.alternatePhone && (
                                        <p className="text-red-500 text-xs  mt-1">{formErrors.alternatePhone}</p>
                                    )}
                                </div>

                                {/* Address Line 1 */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs  font-medium text-primaryText mb-1">
                                        Address Line 1 *
                                    </label>
                                    <div className="relative">
                                        {/* <LocationOnIcon className="absolute left-3 top-3 text-primary" /> */}
                                        <textarea
                                            name="addressLine1"
                                            value={formData.addressLine1}
                                            onChange={handleInputChange}
                                            rows={2}
                                            className={`w-full pl-1 py-1.5 text-xs  border ${formErrors.addressLine1 ? 'border-error' : 'border-border'
                                                }`}
                                            placeholder="Enter address line 1"
                                        />
                                    </div>
                                    {formErrors.addressLine1 && (
                                        <p className="text-red-500 text-xs  mt-1">{formErrors.addressLine1}</p>
                                    )}
                                </div>

                                {/* Address Line 2 */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs  font-medium text-primaryText mb-1">
                                        Address Line 2 (Optional)
                                    </label>
                                    <textarea
                                        name="addressLine2"
                                        value={formData.addressLine2}
                                        onChange={handleInputChange}
                                        rows={1}
                                        className="w-full px-1 py-1.5 text-xs  border border-border "
                                        placeholder="Enter address line 2"
                                    />
                                </div>

                                {/* Pincode */}
                                <div>
                                    <label className="block text-xs  font-medium text-primaryText mb-1">
                                        Pincode *
                                    </label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        className={`w-full px-1 py-1.5 text-xs  border  ${formErrors.pincode ? 'border-error' : 'border-border'
                                            }`}
                                        placeholder="6-digit pincode"
                                    />
                                    {formErrors.pincode && (
                                        <p className="text-red-500 text-xs  mt-1">{formErrors.pincode}</p>
                                    )}
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block text-xs  font-medium text-primaryText mb-1">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className={`w-full px-1 text-xs  py-1.5 border ${formErrors.city ? 'border-error' : 'border-border'
                                            }`}
                                        placeholder="Enter city"
                                    />
                                    {formErrors.city && (
                                        <p className="text-red-500 text-xs  mt-1">{formErrors.city}</p>
                                    )}
                                </div>

                                {/* State */}
                                <div>
                                    <label className="block text-xs  font-medium text-primaryText mb-1">
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 text-xs  border ${formErrors.state ? 'border-error' : 'border-border'
                                            }`}
                                        placeholder="Enter state"
                                    />
                                    {formErrors.state && (
                                        <p className="text-red-500 text-xs  mt-1">{formErrors.state}</p>
                                    )}
                                </div>

                                {/* Country */}
                                <div>
                                    <label className="block text-xs font-medium text-primaryText mb-1">
                                        Country *
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 text-xs  border ${formErrors.country ? 'border-error' : 'border-border'
                                            }`}
                                        placeholder="Enter country"
                                    />
                                    {formErrors.country && (
                                        <p className="text-red-500 text-red text-xs mt-1">{formErrors.country}</p>
                                    )}
                                </div>

                                {/* Default Address Checkbox */}
                                <div className="md:col-span-2">
                                    <label className="flex items-center space-x-1">
                                        <input
                                            type="checkbox"
                                            name="isDefault"
                                            checked={formData.isDefault}
                                            onChange={handleCheckboxChange}
                                            className="w-3 h-3 text-primary border-border"
                                        />
                                        <span className="text-primaryText text-xs ">Set as default address</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Dialog Actions */}
                        <div className="p-2 border-t border-border flex justify-end space-x-1">
                            <button
                                onClick={handleClose}
                                disabled={isFormLoading}
                                className="px-2 py-1.5 border border-primary text-xs text-primary rounded-lg hover:bg-primary hover:bg-opacity-10 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isFormLoading}
                                className="px-2 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-primary-dark disabled:opacity-50 flex items-center space-x-2"
                            >
                                {isFormLoading && (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                )}
                                <span>{isEditMode ? 'Update Address' : 'Save Address'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Snackbar */}
            {snackbar.open && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
                    <div className={`px-2 py-1.5  shadow-lg ${snackbar.severity === 'success' ? 'bg-success text-white' :
                            snackbar.severity === 'error' ? 'bg-error text-white' :
                                'bg-warning text-primaryText'
                        }`}>
                        <div className="flex items-center space-x-2">
                            {snackbar.severity === 'success' ? <CheckCircleIcon size={14} /> : <ErrorIcon size={14} />}
                            <span className='text-xs'>{snackbar.message}</span>
                            <button
                                onClick={handleCloseSnackbar}
                                className="ml-4 hover:opacity-70"
                            >
                                <FaTimes size={14}/>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageAddress;