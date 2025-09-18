import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useCreateEmployee } from '../../../hooks/employee/useCreateEmployee';
import {
    Box, Typography, TextField, Button, Card, CardContent, Alert,
    FormControl, InputLabel, Select, MenuItem, Stack, InputAdornment, CircularProgress
} from '@mui/material';
import { CheckCircle as CheckIcon, Error as ErrorIcon, Add as AddIcon, Person as PersonIcon , } from '@mui/icons-material';
import { MyContext } from '../../../context/themeContext/themeContext';
import './AddEmployee.css';

const AddEmployee = () => {
    const { themeMode } = useContext(MyContext);
    const navigate = useNavigate();
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const isSmallScreen = useMediaQuery({ query: '(max-width: 480px)' });
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
        } else if (!/^\d{10}$/.test(formData.contactNumber)) {
            newErrors.contactNumber = 'Enter a valid 10-digit phone number';
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
                    setTimeout(() => navigate('/admin/employee/manage'), 2000);
                },
                onError: (err) => {
                    console.error('Create employee error:', err);
                }
            });
        }
    };

    return (
        <div className={`add-employee-container ${themeMode}`}>
            <Card className="form-card">
                <CardContent>
                    <Box className="header-section" mb={3}>
                        <Typography variant={isSmallScreen ? 'h6' : 'h4'} className="header-title">
                            Add New Employee
                        </Typography>
                        <Typography variant="body2" className="header-subtitle">
                            Create a new employee account for the platform with comprehensive details
                        </Typography>
                    </Box>

                    {isError && (
                        <Alert
                            severity="error"
                            icon={<ErrorIcon />}
                            className="alert error"
                            onClose={() => { }}
                        >
                            {error?.message || 'Failed to create employee'}
                        </Alert>
                    )}

                    {isSuccess && (
                        <Alert
                            severity="success"
                            icon={<CheckIcon />}
                            className="alert success"
                            onClose={() => { }}
                        >
                            Employee created successfully!
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <Box className="input-container">
                                <Typography variant="body2" className="input-label">
                                    Username <span className="required">*</span>
                                </Typography>
                                <TextField
                                    placeholder="Enter username"
                                    value={formData.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    className="form-input"
                                    error={!!errors.username}
                                    helperText={errors.username}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon className="input-icon" />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Box>

                            <Box className="input-container">
                                <Typography variant="body2" className="input-label">
                                    Email <span className="required">*</span>
                                </Typography>
                                <TextField
                                    placeholder="Enter email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    className="form-input"
                                    error={!!errors.email}
                                    helperText={errors.email}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon className="input-icon" />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Box>

                            <Box className="input-container">
                                <Typography variant="body2" className="input-label">
                                    Password <span className="required">*</span>
                                </Typography>
                                <TextField
                                    placeholder="Enter password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    className="form-input"
                                    error={!!errors.password}
                                    helperText={errors.password}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon className="input-icon" />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Box>

                            <Box className="input-container">
                                <Typography variant="body2" className="input-label">
                                    Contact Number <span className="required">*</span>
                                </Typography>
                                <TextField
                                    placeholder="Enter contact number"
                                    value={formData.contactNumber}
                                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    className="form-input"
                                    error={!!errors.contactNumber}
                                    helperText={errors.contactNumber}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon className="input-icon" />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Box>

                            <Box className="input-container">
                                <Typography variant="body2" className="input-label">
                                    Role <span className="required">*</span>
                                </Typography>
                                <FormControl fullWidth variant="outlined" className="form-input" error={!!errors.roles}>
                                    <InputLabel shrink={!!formData.roles}>Select role</InputLabel>
                                    <Select
                                        value={formData.roles}
                                        onChange={(e) => handleInputChange('roles', e.target.value)}
                                        label="Select role"
                                    >
                                        <MenuItem value="ROLE_ADMIN">Admin</MenuItem>
                                        <MenuItem value="ROLE_EMPLOYEE">Employee</MenuItem>
                                    </Select>
                                    {errors.roles && (
                                        <Typography variant="caption" className="error-text">
                                            {errors.roles}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Box>

                            <Box className="action-buttons" display="flex" justifyContent="center" gap={2}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/admin/employee/manage')}
                                    disabled={isLoading}
                                    className="btn secondary"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    startIcon={isLoading ? <CircularProgress size={16} /> : <AddIcon />}
                                    className="btn primary"
                                >
                                    {isLoading ? 'Creating...' : 'Add Employee'}
                                </Button>
                            </Box>
                        </Stack>
                    </Box>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddEmployee;