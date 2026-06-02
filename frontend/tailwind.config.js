/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#09090B',
        glassBg: '#0F172A',
        brandBlue: '#3B82F6',
        brandCyan: '#22D3EE',
        brandPurple: '#8B5CF6',
        brandText: '#F8FAFC',
      },
      boxShadow: {
        'glass-cyan': '0 8px 32px 0 rgba(34, 211, 238, 0.15), inset 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        'glass-purple': '0 8px 32px 0 rgba(139, 92, 246, 0.15), inset 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        'glass-blue': '0 8px 32px 0 rgba(59, 130, 246, 0.15), inset 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 0 1px 1px rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'radial-gradient-cyan': 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)',
        'radial-gradient-purple': 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
      }
    },
  },
  plugins: [],
}
