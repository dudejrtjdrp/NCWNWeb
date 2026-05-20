import PageHeader from '@/components/common/PageHeader'

const SECTIONS = [
  {
    title: '1. 수집하는 개인정보 항목',
    content: '본 홈페이지는 서비스 이용 과정에서 아래와 같은 개인정보를 수집할 수 있습니다.\n- 자동 수집 정보: IP 주소, 접속 시간, 브라우저 정보, 쿠키',
  },
  {
    title: '2. 개인정보의 수집 및 이용목적',
    content: '수집한 개인정보는 다음의 목적 이외의 용도로는 사용되지 않으며, 이용 목적이 변경될 경우 사전 동의를 구할 예정입니다.\n- 서비스 제공 및 운영\n- 서비스 개선 및 통계 분석',
  },
  {
    title: '3. 개인정보의 보유 및 이용기간',
    content: '개인정보는 수집 및 이용목적이 달성된 후 즉시 파기됩니다. 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.',
  },
  {
    title: '4. 개인정보의 파기절차 및 방법',
    content: '전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.',
  },
  {
    title: '5. 개인정보 보호책임자',
    content: '개인정보 처리에 관한 업무를 총괄하여 처리하고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위해 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.\n- 담당부서: 뉴미디어콘텐츠과\n- 이메일: nwcn@dba.ac.kr',
  },
]

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        category="INFO — PRIVACY"
        title="개인정보처리방침"
        description={`최종 수정일: 2026년 05월 20일`}
      />
      <section className="py-12">
        <div className="page-container">
          <div className="max-w-3xl space-y-8">
            {SECTIONS.map((section) => (
              <div key={section.title} className="card-base p-8">
                <h2 className="font-body text-base text-nwcn-green font-semibold mb-4">{section.title}</h2>
                <p className="font-body text-sm text-white/60 leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
