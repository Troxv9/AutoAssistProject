const svgToDataUri = require("mini-svg-data-uri");

function flattenColorPalette(colors) {
  const result = {};
  function recurse(obj, currentKey) {
    for (const key in obj) {
      const val = obj[key];
      const newKey = currentKey ? `${currentKey}-${key}` : key;
      if (val && typeof val === "object" && !Array.isArray(val)) {
        recurse(val, newKey);
      } else {
        result[newKey] = val;
      }
    }
  }
  recurse(colors);
  return result;
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "bg-grid": (value) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
            )}")`,
          }),
        },
        { values: flattenColorPalette(theme("backgroundColor")), type: "color" }
      );
    },
  ],
};
