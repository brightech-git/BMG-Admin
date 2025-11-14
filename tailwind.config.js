/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}", // Adjust to your source folder
    ],
    theme: {
        extend: {
            colors: {
                primary: "var(--primary-color)",
                secondary: "var(--secondary-color)",
                success: "var(--success-color)",
                error: "var(--error-color)",
                warning: "var(--warning-color)",
                info: "var(--info-color)",
                border: "var(--border-color)",
                card: "var(--background-color)",
                primaryText: "var(--primary-text-color)",
                secondaryText: "var(--secondary-text-color)",
            },
            fontFamily: {
                primary: "var(--font-primary)",
                secondary: "var(--font-secondary)",
            },
            fontSize: {
                xs: "var(--font-size-xs)",
                sm: "var(--font-size-sm)",
                md: "var(--font-size-md)",
                lg: "var(--font-size-lg)",
                xl: "var(--font-size-xl)",
                "2xl": "var(--font-size-2xl)",
            },
            spacing: {
                xs: "var(--spacing-xs)",
                sm: "var(--spacing-sm)",
                md: "var(--spacing-md)",
                lg: "var(--spacing-lg)",
                xl: "var(--spacing-xl)",
                "2xl": "var(--spacing-2xl)",
            },
            borderRadius: {
                sm: "var(--border-radius-sm)",
                md: "var(--border-radius-md)",
                lg: "var(--border-radius-lg)",
            },
        },
    },
    plugins: [],
    safelist: [
        'bg-primary', 'hover:bg-primary',
        'bg-secondary', 'hover:bg-secondary',
        'bg-success', 'hover:bg-success',
        'bg-error', 'hover:bg-error',
        'bg-warning', 'hover:bg-warning',
        'bg-info', 'hover:bg-info',
        'bg-activeBorder', 'hover:bg-activeBorder'
    ],
};

