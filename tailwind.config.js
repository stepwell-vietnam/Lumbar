/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: ['class', '[data-theme="dark"]'],
    theme: {
        extend: {
            // Custom Colors
            colors: {
                primary: {
                    DEFAULT: '#FF6B35',
                    hover: '#e55a2b',
                    light: '#ff8a5c',
                },
                secondary: {
                    DEFAULT: '#4ECDC4',
                    hover: '#3dbdb4',
                    light: '#7eded7',
                },
                success: '#00B894',
                warning: '#FDCB6E',
                error: '#E17055',
                glass: {
                    bg: 'rgba(255, 255, 255, 0.25)',
                    'bg-medium': 'rgba(255, 255, 255, 0.4)',
                    'bg-heavy': 'rgba(255, 255, 255, 0.6)',
                    border: 'rgba(255, 255, 255, 0.18)',
                },
                dark: {
                    100: '#EAEAEA',
                    200: '#A0A0A0',
                    300: '#636E72',
                    400: '#2D3436',
                    500: '#1A1A2E',
                    600: '#16213E',
                    700: '#0F3460',
                },
            },

            // Typography
            fontFamily: {
                primary: ['Nunito', 'sans-serif'],
                sans: ['Nunito', 'sans-serif'],
            },

            // Custom Spacing
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '100': '25rem',
            },

            // Border Radius
            borderRadius: {
                'xl': '16px',
                '2xl': '20px',
                '3xl': '24px',
            },

            // Shadows
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                'glow': '0 0 20px rgba(255, 107, 53, 0.3)',
                'glow-secondary': '0 0 20px rgba(78, 205, 196, 0.3)',
            },

            // Backdrop Blur
            backdropBlur: {
                'xs': '2px',
                'glass': '10px',
                'glass-medium': '15px',
                'glass-heavy': '20px',
            },

            // Transitions
            transitionDuration: {
                'fast': '150ms',
                'normal': '200ms',
                'slow': '300ms',
            },

            // Custom Easing
            transitionTimingFunction: {
                'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
                'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            },

            // Animations
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                'gentle-bounce': 'gentleBounce 2s ease-in-out infinite',
                'shake': 'shake 0.5s ease-in-out',
                'float': 'float 3s ease-in-out infinite',
                'pulse-soft': 'pulse 2s ease-in-out infinite',
            },

            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                bounceIn: {
                    '0%': { opacity: '0', transform: 'scale(0.8)' },
                    '50%': { transform: 'scale(1.05)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                gentleBounce: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shake: {
                    '0%, 100%': { transform: 'rotate(0deg)' },
                    '25%': { transform: 'rotate(-3deg)' },
                    '75%': { transform: 'rotate(3deg)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
            },
        },
    },
    plugins: [],
};
