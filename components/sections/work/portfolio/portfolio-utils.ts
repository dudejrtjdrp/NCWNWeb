/** 졸업생 포트폴리오 공용 값 — 서버·클라이언트 어디서나 import 가능 ('use client' 파일의 값은 서버에서 못 부름) */

/** 양식의 분야 목록 순서 (docs/portfolio/NWCN_졸업생포트폴리오_양식.txt) */
export const PORTFOLIO_FIELDS = ['영상', '모션', '그래픽', '웹', 'UX/UI', '사진', '3D', 'XR', '게임', 'AI', '사운드', '인터랙티브', '기획']

/** 졸업 연도 묶음의 목차 앵커 */
export const portfolioYearAnchor = (year: number) => `y${year}`
