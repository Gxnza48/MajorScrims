/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                heading: ['Beni', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
            },
            colors: {
                primary: '#1FC058',
                'primary-dark': '#105624',
            },
        },
    },
    plugins: [],
}
