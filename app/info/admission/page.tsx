import SubPageLayout from '@/components/layout/SubPageLayout'
import PageHeader from '@/components/common/PageHeader'
import Button from '@/components/ui/Button'

const FAQS = [
  { q: '입학 전형은 어떻게 되나요?', a: '수시 및 정시 전형으로 모집합니다. 자세한 내용은 아래 입학처 홈페이지에서 확인하세요.' },
  { q: '실기 시험이 있나요?', a: '전형에 따라 실기 시험이 포함될 수 있습니다. 매년 달라질 수 있으니 공식 입학처에서 확인 바랍니다.' },
  { q: '편입학도 가능한가요?', a: '네, 편입학 모집도 진행합니다. 편입 시기와 요건은 입학처 공지사항을 참고해 주세요.' },
  { q: '포트폴리오가 필요한가요?', a: '일부 전형에서 포트폴리오 제출이 요구될 수 있습니다. 구체적인 요건은 해당 연도 모집요강을 확인해 주세요.' },
]

export default function AdmissionPage() {
  return (
    <SubPageLayout>
      <PageHeader
        category="INFO — ADMISSION"
        title="입시 안내"
        description="뉴미디어콘텐츠과 입시 정보를 안내합니다."
      />
      <section className="py-12">
        <div className="page-container space-y-16">
          {/* 모집요강 링크 */}
          <div className="card-base p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="font-body text-xs font-semibold tracking-widest text-nwcn-green mb-2">OFFICIAL</p>
              <h2 className="font-body text-xl text-white font-semibold">입학처 공식 홈페이지</h2>
              <p className="font-body text-sm text-white/40 mt-1">
                최신 모집요강 및 전형 일정은 학교 공식 입학처에서 확인하세요.
              </p>
            </div>
            <Button href="https://www.dba.ac.kr" external size="md">
              입학처 바로가기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </Button>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="font-brand text-display-md text-white mb-8">자주 묻는 질문</h2>
            <div className="space-y-4">
              {FAQS.map((faq, index) => (
                <div key={index} className="card-base p-6">
                  <p className="font-body text-base text-nwcn-green font-semibold mb-3">
                    Q. {faq.q}
                  </p>
                  <p className="font-body text-sm text-white/60 leading-relaxed">
                    A. {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SubPageLayout>
  )
}
