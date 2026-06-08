import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImage } from '../../../utils/mediaUtils/mediaUtils'

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
    onImageClick,

    autoScroll = false,
    scrollable = false,
    visibleCount = { desktop: 1, tablet: 1, mobile: 1 },
    scrollInterval = 3000,
    infinite = false,
    dots = false,

    isMobilePreview,
    isTabletPreview,

}) => {
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragDistance, setDragDistance] = useState(0);

    const navigate = useNavigate();
    const dragStartRef = useRef(0);
    const dragCurrentRef = useRef(0);
    const autoplayRef = useRef(null);
    const carouselRef = useRef(null);

    const parsedMobileRows = useMemo(() => {
        if (!mobileRows) return null;
        if (Array.isArray(mobileRows)) return mobileRows;
        try {
            return JSON.parse(mobileRows);
        } catch {
            return null;
        }
    }, [mobileRows]);



    // Get current visible count based on screen size
    const getCurrentVisibleCount = () => {
        // If visibleCount is a number (from deviceProps), use it directly
        if (typeof visibleCount === 'number') {
            return visibleCount;
        }

        // If it's an object (original format), use based on screen size
        if (isMobile) return visibleCount.mobile || 1;
        if (isTablet) return visibleCount.tablet || visibleCount.desktop || 2;
        return visibleCount.desktop || 3;
    };
  
    // In HeroBanner component, update the useEffect and related functions:

    // Check screen size or use preview device
    useEffect(() => {
        const checkScreenSize = () => {
            // If preview device props are provided, use them instead of actual screen size
            if (isMobilePreview !== undefined) {
                setIsMobile(isMobilePreview);
                setIsTablet(isTabletPreview);
                return;
            }

            // Otherwise use actual screen size
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 1024);
        };

        checkScreenSize();
        if (isMobilePreview === undefined && isTabletPreview === undefined) {
            window.addEventListener('resize', checkScreenSize);
            return () => window.removeEventListener('resize', checkScreenSize);
        }
    }, [isMobilePreview, isTabletPreview]);

    const currentVisibleCount = getCurrentVisibleCount();
    console.log('HeroBanner - visibleCount prop:', visibleCount);
    console.log('HeroBanner - currentVisibleCount:', currentVisibleCount);
    console.log('HeroBanner - isMobile:', isMobile);
    console.log('HeroBanner - isTablet:', isTablet);
    const totalSlides = images.length;
    const maxIndex = infinite
        ? totalSlides - 1 // For infinite, we can go to any index
        : Math.max(0, totalSlides - currentVisibleCount);

    /* ---------------------------------- */
    /* Autoplay (infinite loop)          */
    /* ---------------------------------- */
    useEffect(() => {
        if (!autoScroll || !scrollable || isHovered || isDragging || totalSlides <= currentVisibleCount) return;

        autoplayRef.current = setTimeout(() => {
            setCurrentIndex((prev) => {
                if (infinite) {
                    return (prev + 1) % totalSlides;
                } else {
                    const next = prev + 1;
                    return next > maxIndex ? 0 : next;
                }
            });
        }, scrollInterval);

        return () => clearTimeout(autoplayRef.current);
    }, [currentIndex, isHovered, isDragging, autoScroll, scrollable, maxIndex, totalSlides, currentVisibleCount, scrollInterval, infinite]);

    /* ---------------------------------- */
    /* Carousel Navigation               */
    /* ---------------------------------- */
    const nextSlide = () => {
        setCurrentIndex((prev) => {
            if (infinite) {
                return (prev + 1) % totalSlides;
            } else {
                const next = prev + 1;
                return next > maxIndex ? 0 : next;
            }
        });
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => {
            if (infinite) {
                return (prev - 1 + totalSlides) % totalSlides;
            } else {
                const prevIndex = prev - 1;
                return prevIndex < 0 ? maxIndex : prevIndex;
            }
        });
    };

    const goToSlide = (index) => {
        if (infinite) {
            setCurrentIndex(index % totalSlides);
        } else {
            setCurrentIndex(Math.min(index, maxIndex));
        }
    };

    /* ---------------------------------- */
    /* Drag Handlers (only if scrollable) */
    /* ---------------------------------- */
    const handleMouseDown = (e) => {
        if (!scrollable) return;
        setIsDragging(true);
        setDragDistance(0);
        dragStartRef.current = e.clientX;
        dragCurrentRef.current = e.clientX;
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !scrollable) return;
        dragCurrentRef.current = e.clientX;
        const distance = dragCurrentRef.current - dragStartRef.current;
        setDragDistance(distance);
    };

    const handleMouseUp = () => {
        if (!isDragging || !scrollable) return;
        setIsDragging(false);
        const distance = dragStartRef.current - dragCurrentRef.current;
        setDragDistance(0);

        if (Math.abs(distance) > 50) {
            distance > 0 ? nextSlide() : prevSlide();
        }
    };

    const handleMouseLeave = () => {
        if (isDragging) {
            setIsDragging(false);
            setDragDistance(0);
        }
        setIsHovered(false);
    };

    const handleTouchStart = (e) => {
        if (!scrollable) return;
        setIsDragging(true);
        setDragDistance(0);
        dragStartRef.current = e.touches[0].clientX;
        dragCurrentRef.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        if (!isDragging || !scrollable) return;
        dragCurrentRef.current = e.touches[0].clientX;
        const distance = dragCurrentRef.current - dragStartRef.current;
        setDragDistance(distance);
    };

    const handleTouchEnd = () => {
        if (!isDragging || !scrollable) return;
        setIsDragging(false);
        const distance = dragStartRef.current - dragCurrentRef.current;
        setDragDistance(0);

        if (Math.abs(distance) > 30) {
            distance > 0 ? nextSlide() : prevSlide();
        }
    };

    // Handle image click
    const handleImageClick = (imageData, index) => {
        if (isDragging && Math.abs(dragDistance) > 10) return;

        if (onImageClick) {
            onImageClick(imageData, index);
            return;
        }
        console.log(imageData ,'handleClickdata');

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
            return {
                url: image.url || '',
                ratio: image.ratio || (isMobile ? mobileRatio : defaultRatio),
                alt: image.alt || `Image ${index + 1}`,
                link: image.link || null,
            };
        }

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

    // Calculate grid layout
    const getGridLayout = () => {
        if (scrollable) {
            return `repeat(${currentVisibleCount}, 1fr)`;
        }

        if (isMobile && parsedMobileRows) {
            let result = '';
            parsedMobileRows.forEach((rowCols, rowIndex) => {
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

    // Get visible images for carousel with infinite support
    const getVisibleImages = () => {
        if (!scrollable) return images;

        if (infinite) {
            // Create a circular array for infinite scrolling
            const result = [];
            for (let i = 0; i < currentVisibleCount; i++) {
                const index = (currentIndex + i) % totalSlides;
                result.push(images[index]);
            }
            return result;
        } else {
            return images.slice(currentIndex, currentIndex + currentVisibleCount);
        }
    };

    // Split images into rows
    const getRows = () => {
        if (scrollable) {
            const visibleImages = getVisibleImages();
            return isMobile && parsedMobileRows ? [visibleImages] : [visibleImages];
        }

        if (!isMobile || !parsedMobileRows) {
            return [images];
        }

        const rows = [];
        let imageIndex = 0;

        parsedMobileRows.forEach(rowCols => {
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
    const visibleImages = scrollable ? getVisibleImages() : images;
    const gridTemplateStyle = getGridLayout();

    // Gap classes
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
    const translateX = isDragging ? dragDistance : 0;

    // Calculate total pages for dots
    const totalPages = infinite
        ? totalSlides // Show dot for each slide in infinite mode
        : maxIndex + 1;

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
            onMouseEnter={() => {
                if (autoScroll || scrollable) {
                    setIsHovered(true);
                }
            }}
            onMouseLeave={handleMouseLeave}
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
                    ${scrollable ? 'relative' : ''}
                `}
                        style={{ animationDelay: '500ms' }}
                    >
                        <div
                            ref={carouselRef}
                            className={`${rowGapClass} w-full ${scrollable ? 'overflow-hidden' : ''}`}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            {rows.map((row, rowIndex) => (
                                <div
                                    key={rowIndex}
                                    className={`
                                grid ${gapClass}
                                w-full
                                ${scrollable ? 'transition-transform duration-300 ease-out' : ''}
                            `}
                                    style={{
                                        gridTemplateColumns: !scrollable && isMobile && parsedMobileRows
                                            ? `repeat(${row.length}, 1fr)`
                                            : gridTemplateStyle,
                                        transform: scrollable && isDragging ? `translateX(${translateX}px)` : 'none',
                                    }}
                                >
                                    {(scrollable ? visibleImages : row).map((image, imgIndex) => {
                                        const globalIndex = scrollable
                                            ? (currentIndex + imgIndex) % totalSlides
                                            : rows.slice(0, rowIndex).reduce((acc, r) => acc + r.length, 0) + imgIndex;
                                        const imageData = getImageData(image, globalIndex);

                                        return (
                                            <div
                                                key={`${globalIndex}-${imgIndex}`}
                                                className={`
                                            relative overflow-hidden 
                                            group
                                            ${imageData.link ? 'cursor-pointer' : ''}
                                            ${scrollable ? 'flex-shrink-0' : ''}
                                        `}
                                                style={{
                                                    paddingBottom: `${parseRatio(imageData.ratio)}%`,
                                                    animationDelay: `${600 + globalIndex * 100}ms`,
                                                }}
                                                role={imageData.link ? "button" : "presentation"}
                                                tabIndex={imageData.link ? 0 : -1}
                                               
                                            >
                                                <div className="absolute inset-0">
                                                    <picture>
                                                        {imageData.url && (
                                                            <source type="image/webp" />
                                                        )}
                                                        <img
                                                            src={getImage(imageData.url)}
                                                            alt={imageData.alt}
                                                            className="
                                                        w-full h-full object-cover
                                                    "
                                                            loading="lazy"
                                                            decoding="async"
                                                            draggable={false}
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

                        {/* Carousel Navigation Arrows */}
                        {scrollable && totalSlides > currentVisibleCount && (
                            <>
                                <button
                                    onClick={prevSlide}
                                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/80 shadow hover:bg-white flex items-center justify-center text-xl md:text-2xl"
                                    aria-label="Previous slide"
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/80 shadow hover:bg-white flex items-center justify-center text-xl md:text-2xl"
                                    aria-label="Next slide"
                                >
                                    ›
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Dots Indicator - MOVED OUTSIDE the carousel div but INSIDE the main container */}
                {scrollable && dots && images.length > 0 && totalSlides > currentVisibleCount && (
                    <div className="flex justify-center gap-2 mt-4 pb-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goToSlide(i)}
                                className="focus:outline-none"
                                aria-label={`Go to slide ${i + 1}`}
                            >
                                <div
                                    className={`h-2.5 rounded-full transition-all duration-300 ${i === (infinite ? currentIndex : currentIndex)
                                        ? 'w-8 bg-amber-600'
                                        : 'w-2.5 bg-gray-400 hover:bg-gray-500'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default HeroBanner;