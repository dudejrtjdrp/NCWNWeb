import SubPageLayout from '@/components/layout/SubPageLayout'
import AboutHero from '@/components/base/AboutHero'

export const metadata = {
  title: 'CURRICULLIM | ABOUT | NWCN',
  description: '뉴미디어콘텐츠과의 교육과정을 소개합니다.',
}

export default function CurriculumPage() {
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
