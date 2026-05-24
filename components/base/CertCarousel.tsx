'use client'

import styles from './CertCarousel.module.css'

const CERTS = [
  '멀티미디어콘텐츠제작전문가',
  'GTQ',
  '정보처리산업기사',
  '웹디자인기능사',
  '컬러리스트산업기사',
  '사무자동화산업기사',
  '인터넷정보관리사',
  '웹마스터전문가',
  '인터넷정보검색사',
  '한국영상자격원 영상전문인(편집)',
  '한국영상자격원 영상전문인(촬영)',
  '한국영상자격원 영상전문인(연출)',
]

export default function CertCarousel() {
  return (
    <section>
      <div className={styles.wrapper}>
        {CERTS.map((name) => (
          <div key={name}>
            {name}
          </div>
        ))}
      </div>
    </section>
  )
}
