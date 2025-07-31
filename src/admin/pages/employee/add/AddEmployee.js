import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateEmployee } from '../../../hooks/employee/useCreateEmployee';
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Alert,
    Chip,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Add as AddIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { styled } from '@mui/system';

// ========== ENHANCED STYLED COMPONENTS ==========
const ModernCard = styled(Card)(() => ({
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    boxShadow: '0 4px 20px rgba(30, 30, 44, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    marginBottom: '24px',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #3B8FF3 0%, #F29F67 50%, #34B1AA 100%)',
    },
}));

const ModernButton = styled(Button)(({ variant: buttonVariant, color }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    padding: '12px 24px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: buttonVariant === 'contained' ? '0 4px 16px rgba(0, 0, 0, 0.1)' : 'none',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: buttonVariant === 'contained' ? '0 6px 20px rgba(0, 0, 0, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    ...(color === 'primary' && {
        background: 'linear-gradient(135deg, #3B8FF3 0%, #2a7bd9 100%)',
        '&:hover': {
            background: 'linear-gradient(135deg, #2a7bd9 0%, #1e5fb8 100%)',
        }
    }),
    ...(color === 'secondary' && {
        background: 'linear-gradient(135deg, #F29F67 0%, #e08f5a 100%)',
        '&:hover': {
            background: 'linear-gradient(135deg, #e08f5a 0%, #cc7a45 100%)',
        }
    }),
}));

const FormField = styled(TextField)(() => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: '#fff',
        fontSize: '1rem',
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3B8FF3',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3B8FF3',
            borderWidth: '2px',
        },
    },
    '& .MuiInputLabel-root': {
        color: '#6B7280',
        fontWeight: 500,
    },
}));

const StyledSelect = styled(FormControl)(() => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: '#fff',
        fontSize: '1rem',
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3B8FF3',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3B8FF3',
            borderWidth: '2px',
        },
    },
    '& .MuiInputLabel-root': {
        color: '#6B7280',
        fontWeight: 500,
    },
}));

const AddEmployee = () => {
    const navigate = useNavigate();
    const { mutate: createEmployee, isLoading, isError, error, isSuccess } = useCreateEmployee();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        contactNumber: '',
        roles: ''
    });

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.contactNumber.trim()) {
            newErrors.contactNumber = 'Contact number is required';
        }

        if (!formData.roles) {
            newErrors.roles = 'Role is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            createEmployee(formData, {
                onSuccess: () => {
                    setFormData({
                        username: '',
                        email: '',
                        password: '',
                        contactNumber: '',
                        roles: ''
                    });
                },
                onError: (err) => {
                    console.error('Create employee error:', err);
                },
            });
        }
    };

    return (
        <Box
            p={3}
            sx={{
                backgroundColor: '#f8f9fa',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <ModernCard sx={{ maxWidth: 800, width: '100%' }}>
                <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                    {/* Header Section */}
                    <Box textAlign="center" mb={4}>
                        <Typography 
                            variant="h4" 
                            sx={{ color: '#1E1E2C', fontWeight: 700, mb: 1 }}
                        >
                            Add New Employee
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ color: '#6B7280', fontSize: '1.1rem' }}
                        >
                            Create a new employee account for the platform
                        </Typography>
                    </Box>

                    {/* Error Messages */}
                    {isError && (
                        <Box mb={3}>
                            <Alert
                                severity="error"
                                icon={<ErrorIcon />}
                                sx={{
                                    borderRadius: '12px',
                                    backgroundColor: '#fff5f5',
                                    color: '#d32f2f',
                                    '& .MuiAlert-icon': { color: '#d32f2f' }
                                }}
                            >
                                {error?.message || 'Failed to create employee'}
                            </Alert>
                        </Box>
                    )}

                    {/* Success Messages */}
                    {isSuccess && (
                        <Box mb={3}>
                            <Alert
                                severity="success"
                                icon={<CheckIcon />}
                                sx={{
                                    borderRadius: '12px',
                                    backgroundColor: '#f0f9ff',
                                    color: '#0d9488',
                                    '& .MuiAlert-icon': { color: '#0d9488' }
                                }}
                            >
                                Employee created successfully!
                            </Alert>
                        </Box>
                    )}

                    {/* Form */}
                    <Box component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            {/* Username */}
                            <Grid item xs={12} md={6}>
                                <Typography
                                    variant="body2"
                                    sx={{ color: '#1E1E2C', fontWeight: 600, mb: 1, fontSize: '0.95rem' }}
                                >
                                    Username
                                    <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
                                </Typography>
                                <FormField
                                    placeholder="Enter username"
                                    value={formData.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    error={!!errors.username}
                                    helperText={errors.username}
                                />
                            </Grid>

                            {/* Email */}
                            <Grid item xs={12} md={6}>
                                <Typography
                                    variant="body2"
                                    sx={{ color: '#1E1E2C', fontWeight: 600, mb: 1, fontSize: '0.95rem' }}
                                >
                                    Email
                                    <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
                                </Typography>
                                <FormField
                                    placeholder="Enter email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    error={!!errors.email}
                                    helperText={errors.email}
                                />
                            </Grid>

                            {/* Password */}
                            <Grid item xs={12} md={6}>
                                <Typography
                                    variant="body2"
                                    sx={{ color: '#1E1E2C', fontWeight: 600, mb: 1, fontSize: '0.95rem' }}
                                >
                                    Password
                                    <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
                                </Typography>
                                <FormField
                                    placeholder="Enter password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    error={!!errors.password}
                                    helperText={errors.password}
                                />
                            </Grid>

                            {/* Contact Number */}
                            <Grid item xs={12} md={6}>
                                <Typography
                                    variant="body2"
                                    sx={{ color: '#1E1E2C', fontWeight: 600, mb: 1, fontSize: '0.95rem' }}
                                >
                                    Contact Number
                                    <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
                                </Typography>
                                <FormField
                                    placeholder="Enter contact number"
                                    value={formData.contactNumber}
                                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    error={!!errors.contactNumber}
                                    helperText={errors.contactNumber}
                                />
                            </Grid>

                            {/* Role */}
                            <Grid item xs={12} md={6}>
                                <Typography
                                    variant="body2"
                                    sx={{ color: '#1E1E2C', fontWeight: 600, mb: 1, fontSize: '0.95rem' }}
                                >
                                    Role
                                    <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
                                </Typography>
                                <StyledSelect fullWidth variant="outlined" error={!!errors.roles}>
                                    <InputLabel>Select role</InputLabel>
                                    <Select
                                        value={formData.roles}
                                        onChange={(e) => handleInputChange('roles', e.target.value)}
                                        label="Select role"
                                    >
                                        <MenuItem value="ROLE_ADMIN">Admin</MenuItem>
                                        <MenuItem value="ROLE_EMPLOYEE">Employee</MenuItem>
                                    </Select>
                                </StyledSelect>
                                {errors.roles && (
                                    <Typography variant="caption" sx={{ color: '#d32f2f', mt: 0.5 }}>
                                        {errors.roles}
                                    </Typography>
                                )}
                            </Grid>
                        </Grid>

                        {/* Employee Summary */}
                        {(formData.username || formData.email || formData.roles) && (
                            <Box mt={3}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 2,
                                    background: 'linear-gradient(135deg, #f0f6ff 0%, #e6f3ff 100%)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(59, 143, 243, 0.2)',
                                    boxShadow: '0 2px 8px rgba(59, 143, 243, 0.1)'
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)',
                                            boxShadow: '0 4px 12px rgba(59, 143, 243, 0.3)'
                                        }}>
                                            <PersonIcon sx={{ color: 'white', fontSize: 24 }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" sx={{ 
                                                color: '#1E1E2C', 
                                                fontWeight: 600,
                                                mb: 0.5
                                            }}>
                                                Employee Summary
                                            </Typography>
                                            <Typography variant="body2" sx={{ 
                                                color: '#6B7280',
                                                fontSize: '0.875rem'
                                            }}>
                                                {formData.username && `Username: ${formData.username}`} {formData.username && formData.email && '•'} {formData.email && `Email: ${formData.email}`} {formData.roles && `• Role: ${formData.roles === 'ROLE_ADMIN' ? 'Admin' : 'Employee'}`}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {formData.username && (
                                            <Chip
                                                label={formData.username}
                                                color="primary"
                                                size="small"
                                                sx={{
                                                    backgroundColor: 'rgba(59, 143, 243, 0.1)',
                                                    color: '#3B8FF3',
                                                    fontWeight: 600
                                                }}
                                            />
                                        )}
                                        {formData.roles && (
                                            <Chip
                                                label={formData.roles === 'ROLE_ADMIN' ? 'Admin' : 'Employee'}
                                                color="secondary"
                                                size="small"
                                                sx={{
                                                    backgroundColor: 'rgba(242, 159, 103, 0.1)',
                                                    color: '#F29F67',
                                                    fontWeight: 600
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        {/* Action Buttons */}
                        <Box display="flex" justifyContent="center" gap={2} mt={4}>
                            <ModernButton
                                variant="outlined"
                                onClick={() => navigate('/admin/employee/manage')}
                                disabled={isLoading}
                                sx={{
                                    minWidth: '120px',
                                    height: '48px',
                                    borderColor: '#6B7280',
                                    color: '#6B7280',
                                    '&:hover': {
                                        borderColor: '#4B5563',
                                        color: '#4B5563',
                                    },
                                }}
                            >
                                Cancel
                            </ModernButton>

                            <ModernButton
                                onClick={handleSubmit}
                                variant="contained"
                                color="primary"
                                disabled={isLoading || !formData.username || !formData.email || !formData.password || !formData.contactNumber || !formData.roles}
                                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                                sx={{
                                    minWidth: '200px',
                                    height: '48px',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 50%, #F29F67 100%)',
                                    boxShadow: '0 8px 24px rgba(59, 143, 243, 0.25)',
                                    textTransform: 'none',
                                    letterSpacing: '0.5px',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #2a7bd9 0%, #2a9891 50%, #e08f5a 100%)',
                                        transform: 'translateY(-3px)',
                                        boxShadow: '0 12px 32px rgba(59, 143, 243, 0.4)',
                                    },
                                    '&:disabled': {
                                        background: 'linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%)',
                                        color: '#9e9e9e',
                                        transform: 'none',
                                        boxShadow: 'none',
                                    },
                                    '& .MuiButton-startIcon': {
                                        marginRight: '8px',
                                    },
                                }}
                            >
                                {isLoading ? 'Creating...' : 'Add Employee'}
                            </ModernButton>
                        </Box>
                    </Box>
                </CardContent>
            </ModernCard>
        </Box>
    );
};

export default AddEmployee;
