import twAnimateCss from "tw-animate-css";

// tailwind.config.js

export default {
    darkMode: 'class', // 🌙 Enables dark mode via class strategy
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}", // for Vite projects
    ],
    theme: {
        extend: {},
    },
    plugins: [
        twAnimateCss, // if you're using tw-animate-css
    ],
};
