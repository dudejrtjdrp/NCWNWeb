/**
 * 루트 레이아웃
 * - Next.js App Router는 반드시 루트에 <html>, <body>가 있어야 함
 * - getLocale()로 현재 로케일을 읽어 lang 속성에 적용
 * - 실제 Provider/컴포넌트 구성은 [locale]/layout.tsx에서 처리
 */
import type { Viewport } from 'next'
import { getLocale } from 'next-intl/server'
import { LoadingProvider } from '@/components/providers/LoadingProvider'
import { NavigationProgress } from '@/components/providers/NavigationProgress'
import './fonts/pretendard-dynamic-subset.css'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // meta theme-color 는 CSS 변수를 해석하지 못한다 — 값을 직접 쓴다 (--color-green)
  themeColor: '#09F593',
}

/**
 * 하이드레이션 전 등장 처리 — AnimateOnScroll 요소는 처음에 숨겨진 채 내려온다.
 * React 번들이 받아지고 하이드레이션될 때까지(저사양 모바일 수 초) 첫 화면 내용이
 * 안 보이던 문제를 막기 위해, 첫 화면 요소는 바로 보이게 하고 아래쪽 요소는 교차
 * 시점에 보이게 한다. loading.tsx(Suspense) 때문에 본문이 이 스크립트보다 뒤에
 * 도착하므로 MutationObserver 로 삽입되는 요소까지 처리하고, load 4초 뒤 끈다.
 * 이후(클라이언트 이동 포함)는 React 쪽 관찰자가 이어받는다.
 */
const AOS_EARLY_SCRIPT = `(function(){try{
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var SEL='[data-aos-state="out"]:not([data-aos-once="false"])';
var io='IntersectionObserver' in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.setAttribute('data-aos-early','');io.unobserve(e.target);}});},{rootMargin:'0px 0px -12% 0px'}):null;
function handle(el){if(el.hasAttribute('data-aos-early'))return;var r=el.getBoundingClientRect();if(!r.width&&!r.height)return;if(r.top<window.innerHeight&&r.bottom>0)el.setAttribute('data-aos-early','');else if(io)io.observe(el);}
function scan(n){if(n.nodeType!==1)return;if(n.matches&&n.matches(SEL))handle(n);var l=n.querySelectorAll?n.querySelectorAll(SEL):[];for(var i=0;i<l.length;i++)handle(l[i]);}
scan(document.documentElement);
var mo=new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var a=ms[i].addedNodes;for(var j=0;j<a.length;j++)scan(a[j]);}});
mo.observe(document.documentElement,{childList:true,subtree:true});
addEventListener('load',function(){setTimeout(function(){mo.disconnect();},4000);});
}catch(e){}})();`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* 폰트 파일 CDN(jsDelivr) 사전 연결. Pretendard 의 @font-face 는 메인 CSS 에 들어 있어
            렌더를 막는 외부 CSS 요청이 없다 (app/fonts/pretendard-dynamic-subset.css). */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        {/* 서브페이지 제목(font-brand bold)용 라틴 서브셋 — 첫 화면 제목이 바로 제 서체로 그려지게 */}
        <link rel="preload" href="/fonts/a2z/a2z-700-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <LoadingProvider>
          <NavigationProgress />
          {children}
        </LoadingProvider>
        <script dangerouslySetInnerHTML={{ __html: AOS_EARLY_SCRIPT }} />
      </body>
    </html>
  )
}
