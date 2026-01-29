/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                motorx: {
                    red: {
                        DEFAULT: '#E31E24',
                        dark: '#B71C1C',
                        light: '#FF5252',
                    },
                    black: '#0A0A0A',
                    gray: {
                        900: '#1A1A1A',
                        800: '#2A2A2A',
                        700: '#3A3A3A',
                        300: '#CCCCCC',
                    },
                    white: '#FFFFFF',
                },
            },
            fontFamily: {
                sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-red': 'linear-gradient(135deg, #E31E24 0%, #B71C1C 100%)',
                'gradient-dark': 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)',
                'gradient-glow': 'radial-gradient(circle at 50% 50%, rgba(227, 30, 36, 0.15) 0%, transparent 70%)',
            },
            boxShadow: {
                'glow-red': '0 0 20px rgba(227, 30, 36, 0.3), 0 0 40px rgba(227, 30, 36, 0.2)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            },
        },
    },
    plugins: [],
}
