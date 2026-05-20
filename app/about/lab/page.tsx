import PageHeader from '@/components/common/PageHeader'

export default function LabPage() {
  return (
    <>
      <PageHeader
        category="ABOUT — LAB"
        title="시설 안내"
        description="뉴미디어콘텐츠과의 실습 시설 및 장비를 소개합니다."
      />
      <section className="py-12">
        <div className="page-container">
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-nwcn-green/40">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className="font-brand text-2xl text-white mb-3">준비 중입니다</h2>
            <p className="font-body text-sm text-white/40">
              시설 안내 페이지는 팀원 회의 후 내용이 업데이트될 예정입니다.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
