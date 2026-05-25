#!/usr/bin/env python3
"""
Figma Image Downloader — NWCNew 프로젝트
뉴미디어콘텐츠과 웹페이지의 department 섹션 이미지를 Figma에서 직접 다운로드합니다.

사용법:
    FIGMA_TOKEN=your_token python3 scripts/download-figma-images.py

Figma Personal Access Token 발급:
    1. https://www.figma.com/settings 접속
    2. 하단 "Personal Access Tokens" 섹션으로 스크롤
    3. "Generate new token" 클릭 → 토큰 복사
"""

import os
import sys
import json
import urllib.request
import urllib.error
from pathlib import Path

# ─── 설정 ──────────────────────────────────────────────────────────────
FILE_KEY   = "qsivnPCWhkDHrJZzuHpXWZ"
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "images" / "department"

# Figma 노드 ID → 파일명
IMAGES = {
    "292:110": "nwcn-logo.png",        # NWC 로고 (1270×350)
    "292:218": "arrow-vec.png",         # 화살표 벡터 (64×61)
    "427:836": "line2.png",             # 라인 데코 (160×3)
    "292:194": "vec-goal.png",          # 목표 벡터 (757×721)
    "292:207": "symbol-card-bg.png",    # 심볼 카드 배경
    "448:244": "symbol-card-inner.png", # 심볼 카드 내부
    "448:225": "goal-card.png",         # 목표 카드 (378×283)
    "292:288": "policy-img1.png",       # 정책 이미지 1 (1244×323)
    "292:290": "policy-img2.png",       # 정책 이미지 2 (1244×323)
    "292:260": "vec-career.png",        # 진로 벡터 (1452×1383)
}
# ────────────────────────────────────────────────────────────────────────


def get_token() -> str:
    token = os.environ.get("FIGMA_TOKEN") or os.environ.get("FIGMA_ACCESS_TOKEN")
    if not token:
        print("❌  Figma Personal Access Token이 필요합니다.")
        print()
        print("터미널에서 아래 명령으로 실행하세요:")
        print()
        print("  FIGMA_TOKEN=your_token python3 scripts/download-figma-images.py")
        print()
        print("토큰 발급: https://www.figma.com/settings  →  Personal Access Tokens")
        sys.exit(1)
    return token


def figma_get(url: str, token: str) -> dict:
    req = urllib.request.Request(url, headers={"X-Figma-Token": token})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        raise RuntimeError(f"HTTP {e.code}: {body[:200]}")


def download(url: str, dest: Path) -> int:
    urllib.request.urlretrieve(url, dest)
    return dest.stat().st_size


def main():
    token = get_token()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Figma API 형식: 콜론 → 하이픈
    ids_param = ",".join(nid.replace(":", "-") for nid in IMAGES)

    print(f"📡  Figma API에서 {len(IMAGES)}개 이미지 URL 요청 중...")
    api_url = (
        f"https://api.figma.com/v1/images/{FILE_KEY}"
        f"?ids={ids_param}&format=png&scale=1"
    )

    try:
        data = figma_get(api_url, token)
    except RuntimeError as e:
        print(f"❌  API 오류: {e}")
        sys.exit(1)

    if data.get("err"):
        print(f"❌  Figma 오류: {data['err']}")
        sys.exit(1)

    images: dict = data.get("images", {})

    success, errors = 0, 0
    for node_id, filename in IMAGES.items():
        # Figma 응답은 콜론 또는 하이픈 형식 모두 가능
        img_url = images.get(node_id) or images.get(node_id.replace(":", "-"))

        if not img_url:
            print(f"  ✗  {filename}  (URL 없음)")
            errors += 1
            continue

        dest = OUTPUT_DIR / filename
        try:
            print(f"  ↓  {filename} ...", end="", flush=True)
            size = download(img_url, dest)
            print(f"  {size:,} bytes  ✓")
            success += 1
        except Exception as e:
            print(f"  오류: {e}")
            errors += 1

    print()
    print(f"완료: {success}개 다운로드, {errors}개 오류")
    if success:
        print(f"저장 위치: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
