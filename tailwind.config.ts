import type { Config } from 'tailwindcss'

/**
 * NWCN 디자인 토큰 — 단일 소스 오브 트루스
 * ────────────────────────────────────────────────────────────
 * 색상 / 타이포 / 간격 / 모서리 / 그림자 / 모션을 여기서만 정의한다.
 * app/globals.css 의 CSS 변수는 이 값을 그대로 미러링하며,
 * 컴포넌트에서는 arbitrary value(text-[14px], bg-[#888]) 대신
 * 아래 역할 기반 토큰을 사용한다.
 */
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
          /* ── 브랜드 ── */
          green: '#09F593',
          'green-dark': '#07C274',
          'green-darker': '#058F56',
          'green-deep': '#133728',
          yellow: '#E3E94D',

          /* ── 중립 스케일 (기존 25종 회색 → 10단계로 압축) ── */
          'neutral-0': '#ffffff',
          'neutral-50': '#fafafa',
          'neutral-100': '#f2f2f2',
          'neutral-200': '#e8e8e8',
          'neutral-300': '#d4d4d4',
          'neutral-400': '#aaaaaa',
          'neutral-500': '#888888',
          'neutral-600': '#555555',
          'neutral-700': '#3a3a3b',
          'neutral-800': '#252525',
          'neutral-900': '#151515',

          /* ── 시맨틱 별칭 (기존 코드 호환) ── */
          dark: '#151515',
          'dark-2': '#1A1A1A',
          'dark-3': '#202020',
          'text-default': '#050505',
          'text-muted': '#323131',
          'text-sub': '#B9B8B6',
          surface: '#fafafa',
          'surface-2': '#f2f2f2',
          'border-light': '#e8e8e8',
          'border-muted': '#d4d4d4',
          'gray-text': '#555555',
          'gray-muted': '#888888',
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

      /* ── 역할 기반 타이포 스케일 ──
         기존 text-[9px] ~ text-[72px] 28단계를 아래 8단계로 수렴시킨다. */
      fontSize: {
        'hero-1': ['clamp(40px, 6vw, 80px)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'hero-2': ['clamp(32px, 4.5vw, 56px)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'page-1': ['clamp(28px, 4vw, 48px)', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        section: ['clamp(20px, 2.5vw, 24px)', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        card: ['17px', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        body: ['15px', { lineHeight: '1.7' }],
        'body-sm': ['14px', { lineHeight: '1.65' }],
        caption: ['12px', { lineHeight: '1.5' }],
        label: ['12px', { lineHeight: '1', letterSpacing: '0.2em' }],
        /* 하위 호환 (기존 display-* 사용처) */
        'display-xl': ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(1.8rem, 4vw, 3.2rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(1.3rem, 2.5vw, 2rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },

      lineHeight: {
        tight: '1.15',
        snug: '1.4',
        normal: '1.6',
        relaxed: '1.8',
      },

      /* ── 섹션 리듬 (80/81/86/90/100/120/130px → 3단계) ── */
      spacing: {
        'section-sm': 'clamp(48px, 6vw, 64px)',
        'section-md': 'clamp(64px, 8vw, 96px)',
        'section-lg': 'clamp(80px, 10vw, 128px)',
        gutter: 'clamp(16px, 5vw, 80px)',
      },

      maxWidth: {
        page: '1440px',
        wide: '1060px',
        prose: '680px',
      },

      /* ── 모서리 (rounded-[99px]/[229px]/[7.912px] 정리) ── */
      borderRadius: {
        card: '12px',
        panel: '20px',
        hero: 'clamp(18px, 2.5vw, 32px)',
      },

      /* ── 그림자 3단계 ── */
      boxShadow: {
        'lift-1': '0 2px 8px rgba(0,0,0,0.06)',
        'lift-2': '0 12px 28px rgba(0,0,0,0.10)',
        'lift-3': '0 28px 52px rgba(0,0,0,0.18)',
      },

      /* ── 모션: easing 1종 + duration 3단계 ── */
      transitionTimingFunction: {
        nwcn: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '300ms',
        slow: '500ms',
      },

      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.22,1,0.36,1) forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards',
        floaty: 'floaty 7s ease-in-out infinite',
        'toast-in': 'toastIn 0.32s cubic-bezier(0.22,1,0.36,1) forwards',
        'modal-in': 'modalIn 0.28s cubic-bezier(0.22,1,0.36,1) forwards',
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
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        toastIn: {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        modalIn: {
          '0%': { opacity: '0', transform: 'translateY(16px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
