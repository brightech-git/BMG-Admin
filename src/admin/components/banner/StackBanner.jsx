import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getImage } from "../../../utils/mediaUtils/mediaUtils";

const GridBanner = ({
    title,
    description,
    images = [],

    desktopLayout,
    mobileLayout,

    gap = true,
    centered = false,
    full = false,
    backgroundColor = "white",
}) => {
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const layout = isMobile ? mobileLayout : desktopLayout;
    if (!layout) return null;

    const resolveImage = (image) => {
        // string support
        if (typeof image === "string") {
            return { url: image, link: null, alt: "" };
        }

        if (!image || typeof image !== "object") {
            return { url: "", link: null, alt: "" };
        }

        // desktop / mobile structure
        if (image.desktop || image.mobile) {
            const source = isMobile
                ? image.mobile || image.desktop
                : image.desktop || image.mobile;

            return {
                url: source?.url || "",
                link: source?.link || null,
                alt: image.alt || "",
            };
        }

        // plain object fallback
        return {
            url: image.url || "",
            link: image.link || null,
            alt: image.alt || "",
        };
    };

    return (
        <section
            className={`
                relative w-full py-2 overflow-hidden
                ${centered ? "flex justify-center" : ""}
                ${full ? "px-0" : "px-2 md:px-4"}
            `}
            style={{ backgroundColor }}
        >
            <div className={`${full ? "w-full" : "container mx-auto"}`}>
                {title && (
                    <h2 className="text-lg md:text-2xl font-bold mb-2">
                        {title}
                    </h2>
                )}

                {description && (
                    <p className="text-base md:text-lg mb-4">
                        {description}
                    </p>
                )}

                {/* 🔥 GRID */}
                <div
                    className={`grid w-full ${gap ? "gap-3" : "gap-0"}`}
                    style={{
                        gridTemplateColumns: layout.columns
                            .map((c) => `${c}fr`)
                            .join(" "),
                        gridAutoRows: "1fr",
                    }}
                >
                    {images.map((image, index) => {
                        const img = resolveImage(image);

                        if (!img.url) return null;

                        return (
                            <div
                                key={index}
                                className={`relative overflow-hidden ${img.link ? "cursor-pointer" : ""
                                    }`}
                                style={{
                                    gridRow: image?.rowSpan
                                        ? `span ${image.rowSpan}`
                                        : "span 1",
                                }}
                                onClick={() => {
                                    if (img.link) {
                                        navigate(`/products-page?${img.link}`);
                                    }
                                }}
                            >
                                <img
                                    src={getImage(img.url)}
                                    alt={img.alt || `Image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default GridBanner;
