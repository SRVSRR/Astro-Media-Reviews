/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				primary: '#0c1728',
				secondary: '#111e32',
				accent: '#f97316',
				muted: '#a7b4c8',
				soft: '#1b2a44',
			},
			boxShadow: {
				glow: '0 20px 60px rgba(249, 115, 22, 0.25)',
			},
		},
	},
	plugins: [],
}
