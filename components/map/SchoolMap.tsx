'use client'

export default function SchoolMap() {
  return (
    <iframe
      src="https://maps.google.com/maps?q=동아방송예술대학교&output=embed&hl=ko&z=16"
      width="100%"
      height="100%"
      style={{ border: 0, display: 'block', minHeight: '260px' }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="동아방송예술대학교 위치"
    />
  )
}
