/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: {
    colors: {
      carl: { blue: '#185FA5', green: '#3B6D11', amber: '#854F0B' }
    }
  }},
  plugins: [],
}
