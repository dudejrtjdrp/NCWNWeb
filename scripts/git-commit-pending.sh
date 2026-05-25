#!/bin/bash
# 미커밋 변경사항 일괄 커밋 스크립트
set -e

cd "$(dirname "$0")/.."

# 혹시 남은 lock 파일 제거
rm -f .git/index.lock .git/HEAD.lock

# 1. Figma 이미지 + 다운로드 스크립트
git add public/images/department/ scripts/download-figma-images.py
git commit -m "feat(assets): Figma 실제 이미지로 department PNG 전면 교체

- Figma REST API 활용 download-figma-images.py 스크립트 추가
- nwcn-logo.png: 21KB → 84KB
- symbol-card-bg.png: 28KB → 140KB
- symbol-card-inner.png: 29KB → 39KB
- goal-card.png: 16KB → 165KB
- policy-img1.png: 27KB → 517KB
- policy-img2.png: 35KB → 415KB
- vec-goal.png: 61KB → 80KB
- vec-career.png: 167KB → 779KB
- arrow-vec.png, line2.png 정상 확인"

# 혹시 남은 임시파일 정리
git rm --cached test_write.txt 2>/dev/null || true
rm -f test_write.txt

echo "✅ 커밋 완료"
git log --oneline -5
