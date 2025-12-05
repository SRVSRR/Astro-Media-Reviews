/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				primary: '#0b1021',
				secondary: '#11182f',
				accent: '#f97316',
				muted: '#94a3b8',
				soft: '#1b233a',
			},
			boxShadow: {
				glow: '0 20px 60px rgba(249, 115, 22, 0.25)',
			},
		},
	},
	plugins: [],
}
