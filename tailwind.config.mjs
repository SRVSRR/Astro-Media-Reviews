/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				primary: '#0b1220',
				secondary: '#121a2b',
				accent: '#f97316',
				muted: '#8b95a6',
				soft: '#1f2a3d',
			},
			boxShadow: {
				glow: '0 20px 60px rgba(249, 115, 22, 0.25)',
			},
		},
	},
	plugins: [],
}
