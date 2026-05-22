import SubPageLayout from '@/components/layout/SubPageLayout'
import AboutHero from '@/components/base/AboutHero'

export const metadata = {
  title: 'LAB | ABOUT | NWCN',
  description: '뉴미디어콘텐츠과의 실습 시설 및 장비를 소개합니다.',
}

export default function LabPage() {
  return (
    <SubPageLayout>
      <AboutHero />
      <section style={{ background: '#fff', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontSize: 20, color: '#888' }}>
          준비 중입니다
        </p>
      </section>
    </SubPageLayout>
  )
}
