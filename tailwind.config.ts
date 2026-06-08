import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nwcn: {
          // 브랜드 컬러
          green: '#09F593',
          'green-dark': '#07C274',
          'green-darker': '#058F56',
          yellow: '#E3E94D',
          // 배경
          dark: '#151515',
          'dark-2': '#1A1A1A',
          // 텍스트
          'text-default': '#050505',
          'text-muted': '#323131',
          'text-sub': '#B9B8B6',
          // 강조 hover (primary 버튼)
          'green-deep': '#133728',
          // 중립(회색) 스케일 — 반복되던 hex를 토큰화
          'surface': '#f7f7f7',
          'surface-2': '#f0f0f0',
          'border-light': '#ececec',
          'border-muted': '#dddddd',
          'gray-text': '#555555',
          'gray-muted': '#999999',
          'gray-faint': '#aaaaaa',
        },
      },
      fontFamily: {
        brand: ['A2z', 'sans-serif'],
        body: [
          'Pretendard Variable',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        'display-xl': ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(1.8rem, 4vw, 3.2rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(1.3rem, 2.5vw, 2rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
