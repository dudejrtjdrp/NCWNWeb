# Mac ↔ Windows 렌더링 차이 분석 (2026-06-22)

업로드된 녹화 영상(`녹화_2026_06_22_15_59_08_413.mp4`, 5.3s)을 프레임 단위로 분석한 결과와, 프로젝트 코드에서 Mac/Windows 화면 차이를 유발할 만한 지점을 정리한다.

---

## 0. 영상 진단 결과 (요약)

프레임별 모션을 측정한 결과:

- **상단 헤더(y<40px)는 거의 정지**(frame diff ≈ 0.0~0.3), **화면 중앙만 5~7초 주기로 출렁임**.
- 즉, 영상은 **스크롤 중이 아니라 idle(맨 위 정지) 상태**이고, 떨리는 대상은 **히어로 배경의 NWCN 3D 낱자 플로팅 애니메이션**(`heroFloatA/B`, `heroWorkFloat`)이다.

결론: "덜덜 떨림"은 스크롤 문제가 아니라 **정지 상태에서 도는 CSS 키프레임 애니메이션이 Windows에서만 서브픽셀 단위로 떨리는** 현상이다. 단, 사용자가 스크롤을 시작하는 순간 **두 번째 원인(스크롤 충돌)**도 바로 드러난다.

---

## 1. ⭐ 떨림 원인 A — `scale()` 컨테이너 안에서 GPU 레이어 애니메이션 (영상의 그 떨림)

`components/sections/home/HomeHeroSection.tsx`

```
stage div  →  transform: translate(-50%,-50%) scale(vw / 1440)   // 예: 1920/1440 = 1.333…
  └ letter div (willChange: transform, opacity)
      └ img  animation: heroFloatA … translate3d(0,-15px,0)  (willChange:transform, backfaceVisibility:hidden)
```

낱자 이미지는 `will-change`/`translate3d`로 이미 **독립 GPU 레이어**로 승격돼 있다. 문제는 그 레이어가 **소수 배율 `scale(1.333…)` 조상 안에 들어 있다는 점**이다.

- 레이어는 원본 CSS 크기로 래스터된 뒤 조상 `scale`로 확대되고, **매 프레임 합성 위치를 정수 디바이스 픽셀로 반올림**한다.
- **Windows 데스크탑 = DPR 1**(1920×1080 등)이라 반올림 오차가 통째로 1px → 위아래로 **±1px 진동("덜덜")**.
- **Mac = DPR 2(레티나)**라 같은 오차가 0.5 디바이스픽셀 → 사람 눈에 안 보임 → "맥에선 멀쩡".

이것이 "맥은 괜찮은데 윈도우만 떨린다"의 전형적인 원인이다(DPR 차이). 코드의 기존 방어책(translate3d·will-change·backface)들은 **레이어 승격까진 해줬지만, 소수 배율 조상이 만드는 반올림 진동은 막지 못한다.**

**수정 방향(택1, 위일수록 권장)**

1. **stage `scale`을 디바이스 픽셀에 스냅**: `scale` 값을 임의 소수 대신 `Math.round(vw)/1440`처럼 정수 px 기반으로 맞추거나, stage를 `scale` 대신 **실제 width/left 좌표(px)로 레이아웃**해 소수 배율 자체를 제거.
2. 플로팅을 `translate3d`(transform) 대신 **`translate` + 레이어 분리 유지**하되, 애니메이션 요소를 `scale` 조상 **바깥**으로 빼서 뷰포트 좌표에서 직접 움직이게 함.
3. 차선책: 낱자 애니메이션 진폭을 **짝수 px + DPR 보정**으로 두고, `transform: translateZ(0)`를 stage가 아니라 **최종 합성 레이어(img)에만** 두어 중첩 레이어를 줄임.

> 같은 패턴이 `components/base/CertCarousel.module.css`에도 있음 (`transform: scale(0.74/0.62)` + `will-change: transform` + `preserve-3d`). 자격증 캐러셀도 Windows에서 같은 떨림 가능성 → 동일 수정 필요.

---

## 2. ⭐ 떨림 원인 B — `scroll-behavior: smooth` × Lenis 충돌 (스크롤 시작 순간 발생)

`app/globals.css:99`

```css
html { scroll-behavior: smooth; }   /* ❌ Lenis와 충돌 */
```

이 프로젝트는 `lenis`(관성 스무스 스크롤)를 쓰는데, `SmoothScroll.tsx`는 `import Lenis from 'lenis'`만 하고 **Lenis 권장 CSS를 import하지 않았다**(`grep` 결과 `lenis.css`/`lenis-smooth` 없음).

- Lenis는 매 프레임 `scrollTop`을 직접 세팅하는데, **`scroll-behavior: smooth`가 그 값마다 네이티브 스무스 스크롤을 또 걸어** 두 보간이 서로 싸운다.
- Windows Chrome/Edge의 네이티브 smooth 구현은 Mac Safari와 타이밍이 달라 **스크롤 시 눈에 띄는 끊김/떨림**이 난다. (Lenis 공식 문서가 명시적으로 금지하는 조합)

**수정**: 둘 중 하나.

- `app/globals.css`의 `scroll-behavior: smooth` **제거**(가장 간단), 또는
- Lenis 권장 CSS 추가:
  ```css
  html.lenis, html.lenis body { height: auto; }
  .lenis.lenis-smooth { scroll-behavior: auto !important; }   /* ← 위 충돌을 무력화 */
  .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
  .lenis.lenis-stopped { overflow: hidden; }
  ```

---

## 3. 폰트 렌더링 차이 (Mac이 더 얇게 보임)

`app/globals.css:108-109`

```css
body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
```

- 이 두 속성은 **macOS 전용**이다. Mac에선 글자를 **얇고 가볍게** 그리고, Windows는 무시하고 **DirectWrite 자체 힌팅(더 두껍고 또렷)**으로 그린다.
- 히어로 카피가 `fontWeight 200`(ExtraLight) 등 **얇은 굵기를 많이** 쓰는데, 얇은 굵기일수록 이 차이가 커서 **Mac=우아함 / Windows=상대적으로 두껍거나 거칠게** 보인다. "화면 톤이 다르다"의 핵심 원인 1순위.
- 대응: OS별 완전 일치는 불가능. 디자인 QA를 **Windows 기준으로도** 하고, 너무 얇은 weight(100~200)는 본문/소형 텍스트에서 한 단계 올리는 걸 검토.

## 4. 시스템 폰트 fallback 분기 + 원격 폰트 로딩

`globals.css:107`, `tailwind.config.ts`

```
font-family: 'Pretendard Variable','Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
```

- 웹폰트(Pretendard, A2z)가 **CDN(jsDelivr)에서 `@import`로 원격 로드**되고 `font-display: swap`이라, 로드 전까지 **fallback 폰트가 보인다**.
- 그 fallback이 OS별로 다름: **Mac=San Francisco, Windows=Segoe UI**. 메트릭(자폭·줄높이)이 달라 **줄바꿈 위치·간격이 달라지고**, 로딩 중 FOUT(폰트 교체 깜빡임) 양상도 OS마다 다르다.
- `@import`는 렌더 블로킹 + 직렬 로드라 **느린 네트워크(특히 Windows 사내망 등)에서 fallback 노출이 길어짐**.
- 대응: 핵심 폰트는 `next/font`(self-host, preload) 또는 `<link rel="preload">`로 전환, `@import` 체인 축소.

## 5. 스크롤바 차이 (레이아웃 폭/점프)

- **Windows = 항상 보이는 클래식 스크롤바(~17px)**가 레이아웃 폭을 잡아먹음. **macOS = 오버레이 스크롤바(폭 0)**.
- 결과: Windows에서 콘텐츠 가용폭이 17px 좁아지고, 페이지 길이가 바뀌는 순간(모달 오픈 등) **가로 점프**가 생길 수 있음. 히어로 `scale = innerWidth/1440`도 Windows에선 약간 작게 계산됨.
- `scrollbar-hide` 유틸은 `-webkit-`/`-ms-`/`scrollbar-width`만 커버 → 스크롤바가 **보이는 영역**에선 OS별 모양이 그대로 노출.
- 대응: `html { scrollbar-gutter: stable; }`로 폭을 예약해 점프 제거 검토.

## 6. sticky 헤더 `backdrop-blur` (스크롤 중 재래스터)

`components/layout/Header.tsx`, `AdminShell.tsx`, `MobileMenu.tsx` 등에서 `backdrop-blur` 사용.

- `position: sticky` 헤더에 `backdrop-filter`가 걸리면 **스크롤마다 뒤 배경을 다시 블러 래스터**한다. Windows(DPR1·GPU 드라이버 편차)에서 Mac보다 무겁고 **헤더 가장자리 떨림/지연**이 보일 수 있음.
- 대응: 성능 이슈 확인 시 blur 반경 축소 또는 반투명 단색 배경으로 대체 옵션 검토.

## 7. (참고) React state 기반 스크롤 진행도

`HomeHeroSection`은 스크롤마다 `setProgress`로 **히어로 전체를 리렌더**해 transform을 갱신한다. Lenis(자체 RAF) + 이 리렌더는 **한 프레임 뒤처져** 따라오는 구조라, OS 무관하게 약간의 "헤엄치는" 지연이 있고 **Windows의 거친 휠 + 위 2번 충돌과 겹치면 체감이 커진다**. 구조적 개선(스크롤 값→ref→직접 DOM 갱신, 또는 Lenis `scroll` 콜백 사용) 여지.

## 8. (참고) `100vh` 17곳

`100vh`/`h-screen`이 17곳. 데스크탑 Mac/Win 차이는 작지만, 모바일 사파리/크롬 주소창 때문에 기기별 차이가 큼. 모바일 히어로는 이미 `100dvh`로 잘 처리됨 → 나머지도 `dvh` 통일 검토.

---

## 우선순위 수정안

| 순위 | 항목 | 파일 | 난이도 | 효과 |
|---|---|---|---|---|
| **P0** | `scroll-behavior: smooth` 제거 / Lenis CSS 추가 | `app/globals.css` | 매우 낮음 | 스크롤 떨림 즉시 해소 |
| **P0** | 히어로 stage 소수 `scale` → 픽셀 스냅 or px 레이아웃 | `HomeHeroSection.tsx` | 중 | 영상 속 idle 떨림 해소 |
| **P1** | CertCarousel 동일 `scale` 패턴 점검 | `CertCarousel.module.css` | 중 | 캐러셀 떨림 |
| **P1** | 얇은 weight 톤 차이 — Windows QA 기준 추가 | 전역 | 낮음 | 톤 일치도 ↑ |
| **P2** | 웹폰트 self-host(`next/font`)·preload | `globals.css`/layout | 중 | FOUT·fallback 분기 ↓ |
| **P2** | `scrollbar-gutter: stable` | `app/globals.css` | 낮음 | 가로 점프 제거 |
| **P3** | sticky `backdrop-blur` 성능 점검 | Header 등 | 낮음 | 헤더 떨림 |

가장 가성비 높은 즉시 조치는 **P0 두 개**다. `scroll-behavior` 제거는 1줄이고, 히어로 stage의 소수 배율 스냅이 영상 속 떨림의 직접 원인이다.

---

## 적용 내역 (2026-06-22)

타입 체크(`tsc --noEmit`)·ESLint 통과 확인.

**적용됨**

- **P0-1** `app/globals.css`
  - `html { scroll-behavior: smooth }` → `auto` (Lenis와 충돌 제거)
  - Lenis 권장 CSS 블록 추가(`.lenis.lenis-smooth { scroll-behavior: auto !important }` 등)
  - `html { scrollbar-gutter: stable }` 추가(Windows 스크롤바 가로 점프 방지)
- **P0-2** `components/sections/home/HomeHeroSection.tsx`
  - 히어로 stage `transform: scale(vw/1440)` → **`zoom`** 전환(자식 레이어를 확대 해상도로 래스터 → 리샘플 진동 제거)
  - 낱자 idle 상태에서 `filter:'none'` 제거(합성 레이어 클린 유지)

> ⚠️ **검증 요청**: 떨림은 Windows·DPR 1 특정 증상이라 이 개발 환경(Mac/Linux)에서는 재현·확인이 불가능하다. 실제 **Windows + Mac 양쪽에서 히어로 정렬과 떨림을 눈으로 확인** 필요. 만약 Mac에서 히어로 레이아웃이 어긋나면 `HomeHeroSection.tsx`의 `zoom: scale` 줄을 `transform: translate(-50%,-50%) scale(${scale})` 로 1줄 복원하면 즉시 원복된다.

**보류/의도적 유지 (사유)**

- **폰트 스무딩**(`-webkit-font-smoothing: antialiased`): Mac 전용 의도된 심미 설정이라 유지. Windows가 더 두껍게 보이는 건 버그가 아닌 OS 차이 → Windows 기준 디자인 QA로 대응 권장.
- **CertCarousel `scale()` 패턴**: 동일 떨림 가능성이 있으나 Swiper 내부 transform과 얽혀 있어 blind 수정은 위험. Windows에서 캐러셀도 떨리면 동일 `zoom` 접근으로 별도 처리(주의 필요).
- **웹폰트 self-host(`next/font`)·preload**: FOUT·fallback 개선 효과는 크나 폰트 인프라 변경이라 별도 작업으로 분리.
- **`100vh` → `100dvh` 일괄 치환**: 데스크탑 Mac/Win 영향은 미미, 모바일 관리자 레이아웃 회귀 위험이 있어 보류.

**커밋(=git 쓰기가 이 mount에서 막혀 Mac에서 실행 권장)**

```bash
# 작업트리에 진행 중이던 category_url 작업은 건드리지 않고, 이번 변경 파일만 커밋
rm -f .git/index.lock                      # mount에서 막혔던 스테일 락 제거(Mac에선 정상 동작)
git add docs/mac-windows-rendering-analysis.md
git commit -m "docs(perf): Mac·Windows 렌더링 차이 분석 리포트 추가"
git add app/globals.css components/sections/home/HomeHeroSection.tsx
git commit -m "fix(home): 윈도우 히어로 떨림·Lenis 스크롤 충돌 해소"
```
