import React,{ useState, useContext, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import {
    Box, Button, TextField, Typography, Card, CardContent, CardActions, Grid,
    Chip, CircularProgress, Divider, Avatar, Stack, Dialog, DialogTitle,
    DialogContent, DialogActions, FormControlLabel, Checkbox, Snackbar, Alert, Fade, Slide,IconButton
} from '@mui/material';
import {
    Delete, Edit, Add, Home, Phone, LocationOn, CheckCircle, Error, PersonPin,
} from '@mui/icons-material';
import { useAddressQuery } from '../../hooks/address/useAddressQuery';
import { MyContext } from '../../context/themeContext/themeContext';
import './ManageAddress.css';


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ManageAddress = () => {
    const { themeMode } = useContext(MyContext);
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const isSmallScreen = useMediaQuery({ query: '(max-width: 480px)' });
    const { useGetAllAddresses, useAddAddress, useUpdateAddress, useDeleteAddress } = useAddressQuery();

    const { data: addresses, isLoading } = useGetAllAddresses();
    console.log(addresses ,'address bmg')
    const addAddressMutation = useAddAddress();
    const updateAddressMutation = useUpdateAddress();
    const deleteAddressMutation = useDeleteAddress();

    const [address,setAddress] =useState([]);

useEffect(()=>{
    setAddress(addresses)
},[addresses]);
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

    return (
        <div className={`manage-address-container ${themeMode}`}>
            <Card className="header-card">
                <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar className="header-avatar">
                            <Home />
                        </Avatar>
                        <Box>
                            <Typography variant={isSmallScreen ? 'h6' : 'h4'} className="header-title">
                                Manage Addresses
                            </Typography>
                            <Typography variant="body2" className="header-subtitle">
                                Add, edit, and manage your delivery addresses
                            </Typography>
                        </Box>
                    </Stack>
                    <Box mt={2}>
                        <Button
                            variant="contained"
                            onClick={() => handleOpen()}
                            startIcon={<Add />}
                            className="btn primary"
                        >
                            Add New Address
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {isLoading ? (
                <Card className="loading-card">
                    <CardContent className="loading-content">
                        <CircularProgress size={48} />
                        <Typography variant="h6" className="loading-text">
                            Loading your addresses...
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={2}>
                        {Array.isArray(address) && address.length > 0 ? (
                            address.map((address, index) => (
                            <Grid size={{xs:12,sm:6,md:4}} key={address.id}>
                                <Fade in={true} timeout={300 + index * 100}>
                                    <Card className={`address-card ${address.isDefault ? 'default' : ''}`}>
                                        <CardContent>
                                            <Stack spacing={2}>
                                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <PersonPin className="icon" />
                                                        <Typography variant="h6" className="address-name">
                                                            {address.name}
                                                        </Typography>
                                                    </Stack>
                                                    {address.isDefault && (
                                                        <Chip
                                                            label="Default"
                                                            size="small"
                                                            icon={<CheckCircle />}
                                                            className="chip default"
                                                        />
                                                    )}
                                                </Stack>
                                                <Divider />
                                                <Stack spacing={1}>
                                                    <Stack direction="row" spacing={1}>
                                                        <LocationOn className="icon" />
                                                        <Typography variant="body2" className="address-text">
                                                            {address.addressLine1}
                                                            {address.addressLine2 && `, ${address.addressLine2}`}
                                                        </Typography>
                                                    </Stack>
                                                    <Typography variant="body2" className="address-text" sx={{ ml: 3 }}>
                                                        {address.city}, {address.state}
                                                    </Typography>
                                                    <Typography variant="body2" className="address-text" sx={{ ml: 3 }}>
                                                        {address.country} - {address.pincode}
                                                    </Typography>
                                                    <Stack direction="row" spacing={1}>
                                                        <Phone className="icon" />
                                                        <Typography variant="body2" className="address-text">
                                                            {address.phone}
                                                            {address.alternatePhone && ` | ${address.alternatePhone}`}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                        <Divider />
                                        <CardActions className="card-actions">
                                            <IconButton
                                                onClick={() => handleOpen(address)}
                                                className="icon-btn edit"
                                                size="small"
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDelete(address.id, address.name)}
                                                className="icon-btn delete"
                                                size="small"
                                                disabled={deleteAddressMutation.isLoading}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </CardActions>
                                    </Card>
                                </Fade>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Card className="no-address-card">
                                <CardContent className="no-address-content">
                                    <Home className="no-address-icon" />
                                    <Typography variant="h6" className="no-address-title">
                                        No addresses found
                                    </Typography>
                                    <Typography variant="body2" className="no-address-text">
                                        Start by adding your first delivery address
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleOpen()}
                                        startIcon={<Add />}
                                        className="btn secondary"
                                    >
                                        Add Your First Address
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            )}

            <Dialog
                open={open}
                onClose={handleClose}
                TransitionComponent={Transition}
                fullWidth
                maxWidth="md"
                fullScreen={isMobile}
                PaperProps={{ className: 'dialog-paper' }}
            >
                <DialogTitle>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar className={isEditMode ? 'avatar edit' : 'avatar add'}>
                            {isEditMode ? <Edit /> : <Add />}
                        </Avatar>
                        <Box>
                            <Typography variant={isSmallScreen ? 'h6' : 'h5'} className="dialog-title">
                                {isEditMode ? 'Edit Address' : 'Add New Address'}
                            </Typography>
                            <Typography variant="body2" className="dialog-subtitle">
                                {isEditMode ? 'Update your address details' : 'Fill in your address information'}
                            </Typography>
                        </Box>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid size={{xs:12 ,md:6}}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                size="small"
                                className="form-input"
                                error={!!formErrors.name}
                                helperText={formErrors.name}
                                InputProps={{
                                    startAdornment: <PersonPin className="input-icon" />
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                size="small"
                                className="form-input"
                                error={!!formErrors.phone}
                                helperText={formErrors.phone}
                                InputProps={{
                                    startAdornment: <Phone className="input-icon" />
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Alternate Phone"
                                name="alternatePhone"
                                value={formData.alternatePhone}
                                onChange={handleInputChange}
                                variant="outlined"
                                size="small"
                                className="form-input"
                                error={!!formErrors.alternatePhone}
                                helperText={formErrors.alternatePhone}
                                InputProps={{
                                    startAdornment: <Phone className="input-icon" />
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Address Line 1"
                                name="addressLine1"
                                value={formData.addressLine1}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                size="small"
                                className="form-input"
                                multiline
                                rows={2}
                                error={!!formErrors.addressLine1}
                                helperText={formErrors.addressLine1}
                                InputProps={{
                                    startAdornment: <LocationOn className="input-icon" sx={{ mt: 1 }} />
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Address Line 2 (Optional)"
                                name="addressLine2"
                                value={formData.addressLine2}
                                onChange={handleInputChange}
                                variant="outlined"
                                size="small"
                                className="form-input"
                                multiline
                                rows={1}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Pincode"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                size="small"
                                className="form-input"
                                error={!!formErrors.pincode}
                                helperText={formErrors.pincode}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="City"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                size="small"
                                className="form-input"
                                error={!!formErrors.city}
                                helperText={formErrors.city}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="State"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                size="small"
                                className="form-input"
                                error={!!formErrors.state}
                                helperText={formErrors.state}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Country"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                size="small"
                                className="form-input"
                                error={!!formErrors.country}
                                helperText={formErrors.country}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.isDefault}
                                        onChange={handleCheckboxChange}
                                        name="isDefault"
                                        className="checkbox"
                                    />
                                }
                                label="Set as default address"
                                className="checkbox-label"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className="dialog-actions">
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        disabled={isFormLoading}
                        className="btn secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={isFormLoading}
                        startIcon={isFormLoading ? <CircularProgress size={16} /> : null}
                        className="btn primary"
                    >
                        {isEditMode ? 'Update Address' : 'Save Address'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    className={`alert ${snackbar.severity}`}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ManageAddress;