import React, { useEffect, useState, useContext } from "react";
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Chip,
    Divider,
    Stack,
    Breadcrumbs,
    Button,
    Skeleton,
    Alert,
    Tooltip,
    Grid
} from "@mui/material";
import {
    ArrowBack,
   
    Image,
    Inventory2,
    Scale,
    LocalOffer,
    Category,
    
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useProductContext } from "../../../context/product/productContext";
import { MyContext } from "../../../context/themeContext/themeContext";

const BASE_URL = "https://app.bmgjewellers.com";

const parseImagePath = (imagePath) => {
    try {
        const paths = typeof imagePath === "string" ? JSON.parse(imagePath) : imagePath;
        if (!Array.isArray(paths)) return [];
        return paths.map((p) => `${BASE_URL}${p.startsWith("/") ? p : `/${p}`}`);
    } catch {
        return [];
    }
};

const InfoRow = ({ icon, label, value, color = "text.primary" }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        {icon}
        <Typography variant="body2" sx={{ minWidth: 120, fontWeight: 500 }}>
            {label}:
        </Typography>
        <Typography variant="body2" color={color}>
            {value || "N/A"}
        </Typography>
    </Box>
);

function ManageSingleProduct() {
    const location = useLocation();
    const navigate = useNavigate();
    const { themeMode } = useContext(MyContext);
    const { productDetails, getProductDetails, loading, error } = useProductContext();

    const tagKey = location.state?.tagKey || localStorage.getItem("productTagkey");
    const [mainImage, setMainImage] = useState("");
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (tagKey && (!productDetails || productDetails.length === 0)) {
            getProductDetails(tagKey);
        }
    }, [tagKey, getProductDetails]);

    const product = productDetails?.[0];

    if (loading) {
        return <ProductDetailSkeleton />;
    }

    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error loading product: {error}
                </Alert>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/admin/product/manage')}
                    variant="outlined"
                >
                    Back to Manage Products
                </Button>
            </Box>
        );
    }

    if (!product) {
        return (
            <Box sx={{ p: 4, textAlign: "center" }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Product not found
                </Alert>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/admin/product/manage')}
                    variant="outlined"
                >
                    Back to Manage Products
                </Button>
            </Box>
        );
    }

    const images = parseImagePath(product.ImagePath);
    const currentMain = mainImage || images[0];

    const handleImageError = () => {
        setImageError(true);
    };


    return (
        <Box sx={{ p: { xs: 2, md: 4 }, mt: { lg: 4, xs: 4 } }}>
            {/* Breadcrumbs and Action Buttons */}
            <Box sx={{ mb: 4 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }} color={themeMode==='dark'?'#fff':'#000'}>
                   
                    <Typography
                        color={themeMode==='dark'?'#fff':'#000'}
                        onClick={() => navigate('/admin/product/manage')}
                        sx={{ textTransform: 'none' ,cursor:'pointer'}}
                    >
                        Manage Products
                    </Typography>
                    <Typography color={themeMode === 'dark' ? '#fff' : '#000'}>Product Details</Typography>
                </Breadcrumbs>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h5" fontWeight={600}>
                        Product Details
                    </Typography>

                
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Image Section */}
                <Grid size={{xs:12 ,md:6}}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            boxShadow: themeMode === 'dark' ? 3 : 1,
                            overflow: 'hidden',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Image color="primary" />
                                Product Images
                            </Typography>

                            {/* Main Image */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                                <CardMedia
                                    component="img"
                                    image={currentMain}
                                    alt={product.SUBITEMNAME}
                                    onError={handleImageError}
                                    sx={{
                                        width: { xs: 250, md: 350 },
                                        height: { xs: 250, md: 350 },
                                        borderRadius: 2,
                                        objectFit: "contain",
                                        transition: "0.3s ease",
                                        border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                                    }}
                                />
                            </Box>

                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <>
                                    <Divider sx={{ mb: 2 }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        Click to view different angles ({images.length} images)
                                    </Typography>
                                    <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 1, display:'flex',justifyContent:'center'}}>
                                        {images.map((img, i) => (
                                            <Tooltip key={i} title={`Image ${i + 1}`}>
                                                <Box
                                                    component="img"
                                                    src={img}
                                                    alt={`thumbnail-${i}`}
                                                    onClick={() => setMainImage(img)}
                                                    onError={handleImageError}
                                                    sx={{
                                                        width: 80,
                                                        height: 80,
                                                        borderRadius: 1,
                                                        objectFit: "cover",
                                                        border: img === currentMain ?
                                                            "3px solid #1976d2" :
                                                            `2px solid ${themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : '#eee'}`,
                                                        cursor: "pointer",
                                                        transition: "0.3s",
                                                      
                                                    }}
                                                />
                                            </Tooltip>
                                        ))}
                                    </Stack>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Product Details Section */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={3}>
                        {/* Basic Information Card */}
                        <Card sx={{ borderRadius: 2, boxShadow: themeMode === 'dark' ? 3 : 1 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h5" fontWeight={600} gutterBottom>
                                    {product.ITEMNAME} - {product.SUBITEMNAME}
                                </Typography>

                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{
                                        mb: 3,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {product.Description || "No description available"}
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h4" color="primary" fontWeight={700}>
                                        ₹{product.GrandTotal?.toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Inclusive of all taxes
                                    </Typography>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* Category Chips */}
                                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mb: 2 }}>
                                    {product.CollectionType && (
                                        <Chip
                                            icon={<Category />}
                                            label={product.CollectionType}
                                            color="primary"
                                            variant="outlined"
                                        />
                                    )}
                                    {product.MaterialFinish && (
                                        <Chip label={product.MaterialFinish} variant="outlined" />
                                    )}
                                    {product.PURITY && (
                                        <Chip
                                            icon={<Inventory2 />}
                                            label={`${product.PURITY}% Purity`}
                                            color="success"
                                            variant="outlined"
                                        />
                                    )}
                                    {product.ColorAccents && (
                                        <Chip label={product.ColorAccents} variant="outlined" />
                                    )}
                                    {product.Gender && (
                                        <Chip label={product.Gender} color="secondary" variant="outlined" />
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>

                        {/* Specifications Card */}
                        <Card sx={{ borderRadius: 2, boxShadow: themeMode === 'dark' ? 3 : 1 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Scale color="primary" />
                                    Product Specifications
                                </Typography>

                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                            Weight Details
                                        </Typography>
                                        <InfoRow
                                            icon={<Scale fontSize="small" />}
                                            label="Gross Weight"
                                            value={`${product.GRSWT} g`}
                                        />
                                        <InfoRow
                                            icon={<Scale fontSize="small" />}
                                            label="Net Weight"
                                            value={`${product.NETWT} g`}
                                        />
                                    </Box>

                                    <Divider />

                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                            Tax & Identification
                                        </Typography>
                                        <InfoRow
                                            icon={<LocalOffer fontSize="small" />}
                                            label="GST"
                                            value={`${product.GSTPer}%`}
                                        />
                                        <InfoRow
                                            label="Tag Key"
                                            value={product.TAGKEY}
                                            color="primary"
                                        />
                                    </Box>

                                    <Divider />

                                    {product.Occasion && (
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                                Occasion
                                            </Typography>
                                            <Chip
                                                label={product.Occasion.replace("_", " ")}
                                                variant="filled"
                                                color="primary"
                                                size="small"
                                            />
                                        </Box>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>

                        {/* Additional Information */}
                        
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}

// Skeleton Loading Component
const ProductDetailSkeleton = () => (
    <Box sx={{ p: { xs: 2, md: 4 }, mt: { lg: 4, xs: 4 } }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width={300} height={60} sx={{ mb: 4 }} />

        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Skeleton variant="rounded" height={400} />
            </Grid>
            <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                    <Skeleton variant="rounded" height={200} />
                    <Skeleton variant="rounded" height={150} />
                </Stack>
            </Grid>
        </Grid>
    </Box>
);

export default ManageSingleProduct;