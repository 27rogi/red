module.exports = {
  darkMode: 'class',
  content: [
    "./components/**/*.vue",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.js",
  ],
  theme: {
    fontFamily: {
      body: ['Manrope', 'sans-serif'],
    },
    extend: {
      colors: {
        "primary": {
          "50": "#f2f7ff",
          "100": "#cce0fd",
          "200": "#94befb",
          "300": "#6ea7fa",
          "400": "#4890f8",
          "500": "#2279f7",
          "600": "#0f6ef6",
          "700": "#085cd6",
          "800": "#0754c3",
          "900": "#064cb1"
        },
        "background": {
          '50': '#6485a5',
          '100': '#53718f',
          '200': '#4c6783',
          '300': '#3d546a',
          '400': '#283645',
          '500': '#212c38',
          '600': '#19232c',
          '700': '#12191f',
          '800': '#0b0f13',
          '900': '#040507',
        },
      },
    },
  },
}
