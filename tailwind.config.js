/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--bg-primary)',
                surface: 'var(--bg-secondary)',
                primary: 'var(--accent)',
                border: 'var(--border)',
                text: 'var(--text-primary)',
                muted: 'var(--text-secondary)',
            }
        },
    },
    plugins: [],
}
