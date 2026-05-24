'use client'

import styles from './CertCarousel.module.css'

/* 이미지는 추후 실제 자격증 이미지로 교체 예정 */
const IMAGES = Array.from({ length: 16 }, (_, i) => ({
  src: `https://picsum.photos/seed/picsum${i + 1}/300/300`,
  alt: `자격증 이미지 ${i + 1}`,
}))

export default function CertCarousel() {
  return (
    <section className={styles.section}>
      <div className={styles.wrapper}>
        {IMAGES.map((img) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
          />
        ))}
      </div>
    </section>
  )
}
