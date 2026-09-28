import React from "react";
import { LucideIcon } from "lucide-react";


const PageHeader = ({
    title,
    description,
    className = "",
    icon: Icon,
}) => {
    return (
        <div
            className={`
                relative
                overflow-hidden
                flex
                items-center
                gap-4
                rounded-2xl
                px-4
                py-2
                bg-gradient-to-r
                from-orange-600
                via-orange-300
                to-pink-300
                shadow-lg
                ${className}
            `}
        >
            {/* Background decoration */}
            <div
                className="
                    pointer-events-none
                    absolute
                    -right-10
                    -top-14
                    h-40
                    w-40
                    rounded-full
                    bg-white/10
                    blur-2xl
                "
            />

            <div
                className="
                    pointer-events-none
                    absolute
                    -bottom-16
                    left-1/3
                    h-32
                    w-32
                    rounded-full
                    bg-pink-300/20
                    blur-2xl
                "
            />

            {/* Icon */}
            {Icon && (
                <div
                    className="
                        relative
                        z-10
                        flex
                        h-14
                        w-14
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-white/20
                        bg-white/15
                        text-white
                        shadow-md
                        backdrop-blur-md
                    "
                >
                    <Icon
                        size={28}
                        strokeWidth={1.8}
                    />
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 min-w-0">
                {title && (
                    <h1 className="m-0 text-xl font-bold tracking-tight text-white sm:text-2xl">
                        {title}
                    </h1>
                )}

                {description && (
                    <p className="m-0 mt-1 text-sm font-medium text-white/75">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};

export default PageHeader;