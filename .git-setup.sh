#!/bin/bash
# NWCN 프로젝트 Git 초기 설정 스크립트
# 터미널에서 실행: bash .git-setup.sh

set -e

echo "🦌 NWCN Git 초기 설정을 시작합니다..."

# Git 초기화 (이미 되어 있으면 스킵)
if [ ! -d ".git" ]; then
  git init
  echo "✅ Git 초기화 완료"
fi

# Git 설정
git config core.autocrlf false
git config core.safecrlf false

# 초기 커밋
git add .
git commit -m "chore: Next.js 14 프로젝트 초기 설정

- TypeScript, Tailwind CSS, ESLint 설정
- 디자인 시스템 (컬러 토큰, 폰트) 구성
- 공통 컴포넌트 구축 (Header, Footer, Button, Badge)
- 메인 페이지 섹션 구현 (Hero, Awards, NCR Trend)
- Supabase 클라이언트 설정
- 전체 라우팅 구조 설계"

echo "✅ 초기 커밋 완료!"
echo ""
echo "📋 다음 단계:"
echo "  pnpm install   # 패키지 설치"
echo "  pnpm dev       # 개발 서버 시작"
