import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // or your navigation method
import { getImage } from '../../../utils/mediaUtils/mediaUtils';


const HeroBanner = ({
    title,
    description,
    images,
    defaultRatio = '16/9',
    mobileRatio = '5/4',
    gap = true,
    mobileGap = null,
    centered = false,
    full = false,
    backgroundColor = 'white',
    mobileRows = null,
    desktopColumns = 'auto',
    onImageClick, // New: callback for image clicks
}) => {
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate(); // React Router navigation

    useEffect(() => {
       
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Handle image click
    const handleImageClick = (imageData) => {
        if (!imageData?.link) return;

        navigate(`/products-page?${imageData.link}`);
    };

    // Get image data
    const getImageData = (image, index) => {
        if (typeof image === 'string') {
            return {
                url: image,
                ratio: isMobile ? mobileRatio : defaultRatio,
                alt: `Image ${index + 1}`,
                link: null,
            };
        }

        if (image && typeof image === 'object') {
            // Case 1: has desktop/mobile keys
            if (image.desktop) {
                if (isMobile) {
                    return {
                        url: image.mobile?.url || image.desktop.url,
                        ratio: image.mobile?.ratio || mobileRatio,
                        alt: image.alt || `Image ${index + 1}`,
                        link: image.mobile?.link || image.desktop?.link || null,
                    };
                } else {
                    return {
                        url: image.desktop.url,
                        ratio: image.desktop.ratio || defaultRatio,
                        alt: image.alt || `Image ${index + 1}`,
                        link: image.desktop?.link || null,
                    };
                }
            }
            // Case 2: plain object (new API format)
            return {
                url: image.url || '',
                ratio: image.ratio || (isMobile ? mobileRatio : defaultRatio),
                alt: image.alt || `Image ${index + 1}`,
                link: image.link || null,
            };
        }

        // fallback
        return {
            url: '',
            ratio: isMobile ? mobileRatio : defaultRatio,
            alt: 'Missing image',
            link: null,
        };
    };


    // Parse aspect ratio
    const parseRatio = (ratio) => {
        const [width, height] = ratio.split('/').map(Number);
        return (height / width) * 100;
    };

    // Calculate grid layout based on screen size
    const getGridLayout = () => {
        if (isMobile && mobileRows) {
            let result = '';
            mobileRows.forEach((rowCols, rowIndex) => {
                if (rowIndex > 0) result += ' ';
                result += `repeat(${rowCols}, 1fr)`;
            });
            return result;
        } else {
            if (desktopColumns === 'auto') {
                const allImagesHaveRatios = images.every(img => {
                    const imgData = typeof img === 'string' ? null : img;
                    return imgData && (imgData.ratio || imgData.desktop?.ratio);
                });

                if (allImagesHaveRatios) {
                    const fractions = images.map((img) => {
                        const imgData = getImageData(img, 0);
                        if (imgData.ratio) {
                            const [width] = imgData.ratio.split('/').map(Number);
                            return `${width}fr`;
                        }
                        return '1fr';
                    });
                    return fractions.join(' ');
                }

                const gridCols = images.length <= 3 ? images.length : 3;
                return `repeat(${gridCols}, 1fr)`;
            } else {
                return `repeat(${desktopColumns}, 1fr)`;
            }
        }
    };

    const gridTemplateStyle = getGridLayout();

    // Split images into rows for mobile if mobileRows is provided
    const getRows = () => {
        if (!isMobile || !mobileRows) {
            return [images];
        }

        const rows = [];
        let imageIndex = 0;

        mobileRows.forEach(rowCols => {
            const rowImages = images.slice(imageIndex, imageIndex + rowCols);
            if (rowImages.length > 0) {
                rows.push(rowImages);
                imageIndex += rowImages.length;
            }
        });

        if (imageIndex < images.length && rows.length > 0) {
            rows[rows.length - 1] = [...rows[rows.length - 1], ...images.slice(imageIndex)];
        }

        return rows;
    };

    const rows = getRows();

    // Determine gap classes
    // Determine gap classes
    const getGapClass = () => {
        if (isMobile && mobileGap !== null) {
            return mobileGap ? 'gap-0' : 'gap-0';
        }
        return gap ? 'gap-4 md:gap-6' : 'gap-0';
    };

    const getRowGapClass = () => {
        if (isMobile && mobileGap !== null) {
            return mobileGap ? 'space-y-4' : 'space-y-0';
        }
        return gap ? 'space-y-4 md:space-y-6' : 'space-y-0';
    };

    const gapClass = getGapClass();
    const rowGapClass = getRowGapClass();

    return (
        <section
            className={`
                relative w-full py-2 
                overflow-hidden ${backgroundColor === 'white' ? 'bg-white' : `bg-${backgroundColor}`}
                ${centered ? 'flex items-center justify-center' : ''}
                ${full ? 'px-0' : 'px-2 md:px-4 lg:px-4'}
            `}
            style={backgroundColor !== 'white' && !backgroundColor.startsWith('bg-') ?
                { backgroundColor } : {}}
            role="banner"
            aria-label="Hero banner"
        >
            <div className={`
                ${full ? 'w-full' : 'container mx-auto w-full'}
                ${centered ? 'text-center' : ''}
            `}>
                {title && (
                    <h1
                        className="
                            text-lg md:text-2xl font-bold 
                            mb-2
                            text-[var(--primary-text-color)]
                        "
                        style={{ animationDelay: '100ms' }}
                    >
                        {title}
                    </h1>
                )}

                {description && (
                    <p
                        className={`
                            text-lg md:text-xl text-[var(--primary-text-color)]
                            mb-4 max-w-3xl
                            ${centered ? 'mx-auto' : ''}
                        `}
                        style={{ animationDelay: '300ms' }}
                    >
                        {description}
                    </p>
                )}

                {images.length > 0 && (
                    <div
                        className={`
                            w-full ${centered ? 'flex justify-center' : ''}
                        `}
                        style={{ animationDelay: '500ms' }}
                    >
                        <div className={`${rowGapClass} w-full`}>
                            {rows.map((row, rowIndex) => (
                                <div
                                    key={rowIndex}
                                    className={`
                                        grid ${gapClass}
                                        w-full
                                    `}
                                    style={{
                                        gridTemplateColumns: isMobile && mobileRows
                                            ? `repeat(${row.length}, 1fr)`
                                            : rowIndex === 0 ? gridTemplateStyle : `repeat(${row.length}, 1fr)`,
                                    }}
                                >
                                    {row.map((image, imgIndex) => {
                                        const globalIndex = rows
                                            .slice(0, rowIndex)
                                            .reduce((acc, r) => acc + r.length, 0) + imgIndex;
                                        const imageData = getImageData(image, globalIndex);
                                        console.log(getImage(imageData.url), 'imageData')

                                        return (
                                            <div
                                                key={globalIndex}
                                                className={`
                                               
                                                    relative overflow-hidden 
                                                    group
                                                    ${imageData.link ? 'cursor-pointer' : ''}
                                                `}
                                                style={{
                                                    paddingBottom: `${parseRatio(imageData.ratio)}%`,
                                                    animationDelay: `${600 + globalIndex * 100}ms`,
                                                }}
                                                onClick={() => handleImageClick(image, globalIndex)}
                                                role={imageData.link ? "button" : "presentation"}
                                                tabIndex={imageData.link ? 0 : -1}
                                                onKeyPress={(e) => {
                                                    if (imageData.link && e.key === 'Enter') {
                                                        handleImageClick(image, globalIndex);
                                                    }
                                                }}
                                            >
                                                <div className="absolute inset-0">
                                                    <picture>
                                                        {imageData.url && (
                                                            <source
                                                              
                                                                type="image/webp"
                                                            />
                                                        )}
                                                        <img
                                                            src={getImage(imageData.url)}
                                                            alt={imageData.alt}
                                                            className="
                                                                w-full h-full object-cover
                                                            "
                                                            loading="lazy"
                                                            decoding="async"
                                                            sizes={full ? "100vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
                                                        />
                                                    </picture>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default HeroBanner;