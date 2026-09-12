/**
 * BASE 컴포넌트: AboutHero
 * 공통 PageHero 를 ABOUT 섹션 용도로 구성한 래퍼.
 */

import PageHero from '@/components/base/PageHero'

const IMG_NWCN = '/images/department/nwcn-logo.png'

export default function AboutHero() {
  return (
    <PageHero
      label="About"
      title="ABOUT"
      description="뉴미디어콘텐츠과의 교육 방향과 사람, 그리고 배움의 공간을 소개합니다."
      size="lg"
      decoration="bar"
      media={
        // eslint-disable-next-line @next/next/no-img-element
        <img src={IMG_NWCN} alt="NWCN 뉴미디어콘텐츠과" className="mx-auto block h-auto w-full max-w-wide" />
      }
    />
  )
}
