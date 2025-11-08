// 📁 src/components/common/FileUploader.js
import { useState, useRef ,useEffect } from 'react';
import { Box, Typography, Button, Chip, CircularProgress } from '@mui/material';
import { CloudUpload as UploadIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import { styled } from '@mui/system';

const UploadArea = styled(Box)(({ theme }) => ({
    borderRadius: '12px',
    border: '2px dashed rgba(235, 167, 72, 0.3)',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
        borderColor: '#eba748',
        backgroundColor: 'rgba(235, 167, 72, 0.05)',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 16px rgba(235, 167, 72, 0.15)',
    },
}));

export default function FileUploader({
    accept = 'image/jpeg, image/png, image/webp',
    maxSizeMB = 5,
    onFileSelect,
    initialPreview = null,
    selectedFile,
    height = 300,
    loading = false,
    error = null,
    width = '100%',
}) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(initialPreview);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!selectedFile) {
            setFile(null);
            setPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, [selectedFile]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (!selectedFile.type.match('image.*')) {
            onFileSelect(null, 'Please select an image file (JPEG, PNG, etc.)');
            return;
        }

        if (selectedFile.size > maxSizeMB * 1024 * 1024) {
            onFileSelect(null, `File size should be less than ${maxSizeMB}MB`);
            return;
        }

        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(selectedFile);

        if (onFileSelect) {
            onFileSelect(selectedFile, null);
        }
    };

    const removeFile = () => {
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onFileSelect) onFileSelect(null, null);
    };

    return (
        <Box>
            {!preview ? (
                <UploadArea onClick={() => fileInputRef.current?.click()}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        disabled={loading}
                    />
                    {loading ? (
                        <CircularProgress size={48} color="primary" sx={{ mb: 2 }} />
                    ) : (
                        <>
                            <UploadIcon sx={{ fontSize: 48, color: '#eba748', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E1E2C' }}>
                                Click or drag image here
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                Select {accept.split(',').join(' or ')} file (Max {maxSizeMB}MB)
                            </Typography>
                        </>
                    )}
                </UploadArea>
            ) : (
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '2px solid rgba(59, 143, 243, 0.2)',
                        background: '#fff',
                    }}
                >
                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            width: '100%',
                            height: `${height}px`,
                            objectFit: 'cover',
                            display: 'block',
                        }}
                    />
                    <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1 }}>
                        <Chip
                            label={loading ? 'Uploading...' : 'Image Selected'}
                            color={loading ? 'default' : 'primary'}
                            sx={{
                                backgroundColor: loading
                                    ? 'rgba(0, 0, 0, 0.1)'
                                    : 'rgba(59, 143, 243, 0.9)',
                                color: 'white',
                                fontWeight: 600,
                            }}
                        />
                        <Button
                            size="small"
                            variant="contained"
                            onClick={removeFile}
                            disabled={loading}
                            sx={{
                                backgroundColor: 'rgba(220, 53, 69, 0.9)',
                                color: 'white',
                                minWidth: 'auto',
                                px: 1,
                                '&:hover': { backgroundColor: 'rgba(200, 35, 51, 0.9)' },
                                '&:disabled': { backgroundColor: 'rgba(0, 0, 0, 0.12)' },
                            }}
                        >
                            Remove
                        </Button>
                    </Box>
                </Box>
            )}

            {file && (
                <Box
                    sx={{
                        mt: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        background: 'linear-gradient(135deg, #f0f6ff 0%, #e6f3ff 100%)',
                        borderRadius: '12px',
                        border: '1px solid rgba(59, 143, 243, 0.2)',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #3B8FF3 0%, #34B1AA 100%)',
                            }}
                        >
                            <CheckIcon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E1E2C' }}>
                                {loading ? 'Uploading File...' : 'File Ready'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </Typography>
                        </Box>
                    </Box>
                    <Chip
                        label={loading ? 'Processing...' : '1 file selected'}
                        sx={{
                            backgroundColor: 'rgba(59, 143, 243, 0.1)',
                            color: '#3B8FF3',
                            fontWeight: 600,
                        }}
                    />
                </Box>
            )}
        </Box>
    );
}