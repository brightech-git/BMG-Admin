import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Checkbox,
    CircularProgress,
    useMediaQuery,
    useTheme,
    Snackbar,
    Alert,
    Card,
    CardContent,
    CardActions,
    Chip,
    LinearProgress,
    Fade,
    Slide,
    Divider,
    Avatar,
    Stack,
} from '@mui/material';
import {
    Delete,
    Edit,
    Add,
    Home,
    Phone,
    LocationOn,
    CheckCircle,
    Error,
    PersonPin,
} from '@mui/icons-material';
import { useAddressQuery } from '../../hooks/address/useAddressQuery';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ManageAddress = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { useGetAllAddresses, useAddAddress, useUpdateAddress, useDeleteAddress } = useAddressQuery();

    const { data: addresses, isLoading } = useGetAllAddresses();
    const addAddressMutation = useAddAddress();
    const updateAddressMutation = useUpdateAddress();
    const deleteAddressMutation = useDeleteAddress();

    const [open, setOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentAddressId, setCurrentAddressId] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
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
        isDefault: false,
    });

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
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
                isDefault: false,
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentAddressId(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e) => {
        setFormData((prev) => ({ ...prev, isDefault: e.target.checked }));
    };

    const handleSubmit = async () => {
        try {
            if (isEditMode) {
                await updateAddressMutation.mutateAsync({
                    id: currentAddressId,
                    updatedAddress: formData,
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
            showSnackbar(`Address for ${name} deleted successfully!`, 'delete'); // ✅ changed to 'delete'
        } catch (error) {
            console.error('Error deleting address:', error);
            showSnackbar('Failed to delete address. Please try again.', 'error');
        }
    };


    const isFormLoading = addAddressMutation.isLoading || updateAddressMutation.isLoading;

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: isMobile ? 2 : 4 }}>
            {/* Header Section */}
            <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                        <Home fontSize="large" />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight={600} color="text.primary">
                            Manage Addresses
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Add, edit, and manage your delivery addresses
                        </Typography>
                    </Box>
                </Stack>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpen()}
                    startIcon={<Add />}
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        boxShadow: 3,
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 6,
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    Add New Address
                </Button>
            </Paper>

            {/* Loading State */}
            {isLoading ? (
                <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                    <CircularProgress size={48} sx={{ mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        Loading your addresses...
                    </Typography>
                </Paper>
            ) : (
                /* Address Cards */
                <Grid container spacing={3}>
                    {addresses && addresses.length > 0 ? (
                        addresses.map((address, index) => (
                            <Grid item xs={12} md={6} lg={4} key={address.id}>
                                <Fade in={true} timeout={300 + index * 100}>
                                    <Card
                                        elevation={3}
                                        sx={{
                                            height: '100%',
                                            borderRadius: 3,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: 8,
                                            },
                                            border: address.isDefault ? '2px solid' : '1px solid',
                                            borderColor: address.isDefault ? 'primary.main' : 'divider',
                                        }}
                                    >
                                        <CardContent sx={{ p: 3 }}>
                                            <Stack spacing={2}>
                                                {/* Header with name and default badge */}
                                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <PersonPin color="primary" />
                                                        <Typography variant="h6" fontWeight={600}>
                                                            {address.name}
                                                        </Typography>
                                                    </Stack>
                                                    {address.isDefault && (
                                                        <Chip
                                                            label="Default"
                                                            size="small"
                                                            icon={<CheckCircle />}
                                                            color="primary"
                                                            variant="filled"
                                                        />
                                                    )}
                                                </Stack>

                                                <Divider />

                                                {/* Address Details */}
                                                <Stack spacing={1}>
                                                    <Stack direction="row" spacing={1}>
                                                        <LocationOn color="action" fontSize="small" />
                                                        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                                                            {address.addressLine1}
                                                            {address.addressLine2 && `, ${address.addressLine2}`}
                                                        </Typography>
                                                    </Stack>

                                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                                                        {address.city}, {address.state}
                                                    </Typography>

                                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                                                        {address.country} - {address.pincode}
                                                    </Typography>

                                                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                                        <Phone color="action" fontSize="small" />
                                                        <Typography variant="body2" color="text.secondary">
                                                            {address.phone}
                                                            {address.alternatePhone && ` | ${address.alternatePhone}`}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                            </Stack>
                                        </CardContent>

                                        <Divider />

                                        <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                                            <Box sx={{ flexGrow: 1 }} />
                                            <Stack direction="row" spacing={1}>
                                                <IconButton
                                                    onClick={() => handleOpen(address)}
                                                    sx={{
                                                        color: 'primary.main',
                                                        '&:hover': {
                                                            backgroundColor: 'primary.light',
                                                            color: 'white',
                                                        },
                                                    }}
                                                    size="small"
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDelete(address.id, address.name)}
                                                    sx={{
                                                        color: 'error.main',
                                                        '&:hover': {
                                                            backgroundColor: 'error.light',
                                                            color: 'white',
                                                        },
                                                    }}
                                                    size="small"
                                                    disabled={deleteAddressMutation.isLoading}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        </CardActions>
                                    </Card>
                                </Fade>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 6,
                                    textAlign: 'center',
                                    borderRadius: 3,
                                    bgcolor: 'grey.50',
                                }}
                            >
                                <Home sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No addresses found
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Start by adding your first delivery address
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => handleOpen()}
                                    startIcon={<Add />}
                                >
                                    Add Your First Address
                                </Button>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Address Form Dialog */}
            <Dialog
                open={open}
                onClose={handleClose}
                TransitionComponent={Transition}
                fullWidth
                maxWidth="md"
                fullScreen={isMobile}
                PaperProps={{
                    sx: { borderRadius: isMobile ? 0 : 3 },
                }}
            >
                {isFormLoading && <LinearProgress />}

                <DialogTitle sx={{ pb: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: isEditMode ? 'warning.main' : 'primary.main' }}>
                            {isEditMode ? <Edit /> : <Add />}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight={600}>
                                {isEditMode ? 'Edit Address' : 'Add New Address'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isEditMode ? 'Update your address details' : 'Fill in your address information'}
                            </Typography>
                        </Box>
                    </Stack>
                </DialogTitle>

                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                InputProps={{
                                    startAdornment: <PersonPin color="action" sx={{ mr: 1 }} />,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                InputProps={{
                                    startAdornment: <Phone color="action" sx={{ mr: 1 }} />,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Alternate Phone"
                                name="alternatePhone"
                                value={formData.alternatePhone}
                                onChange={handleInputChange}
                                variant="outlined"
                                InputProps={{
                                    startAdornment: <Phone color="action" sx={{ mr: 1 }} />,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address Line 1"
                                name="addressLine1"
                                value={formData.addressLine1}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                multiline
                                rows={2}
                                InputProps={{
                                    startAdornment: <LocationOn color="action" sx={{ mr: 1, mt: 1 }} />,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address Line 2 (Optional)"
                                name="addressLine2"
                                value={formData.addressLine2}
                                onChange={handleInputChange}
                                variant="outlined"
                                multiline
                                rows={1}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Pincode"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="City"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="State"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Country"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.isDefault}
                                        onChange={handleCheckboxChange}
                                        name="isDefault"
                                        color="primary"
                                    />
                                }
                                label="Set as default address"
                                sx={{ mt: 1 }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        disabled={isFormLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={isFormLoading}
                        sx={{ minWidth: 120 }}
                    >
                        {isFormLoading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            isEditMode ? 'Update Address' : 'Save Address'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success/Error Snackbar */}
          

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={
                        snackbar.severity === 'update'
                            ? 'warning'
                            : snackbar.severity === 'delete'
                                ? 'error'
                                : snackbar.severity
                    }
                    variant="filled"
                    sx={{
                        width: '100%',
                        backgroundColor: {
                            success: 'green',
                            update: 'orange',
                            delete: 'red',
                        }[snackbar.severity] || undefined,
                        color: '#fff',
                    }}
                    icon={{
                        success: <CheckCircle />,
                        delete: <Error />,
                        update: <Edit />,
                    }[snackbar.severity] || undefined}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </Box>
    );
};

export default ManageAddress;