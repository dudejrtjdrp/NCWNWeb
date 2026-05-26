import SubPageLayout from '@/components/layout/SubPageLayout'
import InfoHero from '@/components/base/InfoHero'
import SubNav from '@/components/common/SubNav'
import { INFO_NAV_ITEMS } from '@/constants/nav-items'

const SECTIONS = [
  {
    title: '1. 수집하는 개인정보 항목',
    content: '본 홈페이지는 서비스 이용 과정에서 아래와 같은 개인정보를 수집할 수 있습니다.\n\n- 자동 수집 정보: IP 주소, 접속 시간, 브라우저 정보, 쿠키',
  },
  {
    title: '2. 개인정보의 수집 및 이용목적',
    content: '수집한 개인정보는 다음의 목적 이외의 용도로는 사용되지 않으며, 이용 목적이 변경될 경우 사전 동의를 구할 예정입니다.\n\n- 서비스 제공 및 운영\n- 서비스 개선 및 통계 분석',
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
    content: '개인정보 처리에 관한 업무를 총괄하여 처리하고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위해 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.\n\n- 담당부서: 뉴미디어콘텐츠과\n- 이메일: nwcn@dba.ac.kr',
  },
]

export default function PrivacyPage() {
  return (
    <SubPageLayout>
      {/* 히어로 */}
      <InfoHero />

      {/* 서브 탭 */}
      <SubNav items={INFO_NAV_ITEMS} />

      {/* 섹션 타이틀 */}
      <div className="bg-white pt-[60px] pb-[28px] text-center">
        <p className="font-body font-light text-[24px] text-black">PRIVACY</p>
      </div>

      <div className="bg-white pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[79px]">
          {/* 상단 안내 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12 pb-8 border-b border-[#ececec]">
            <div>
              <p className="font-body text-[12px] font-semibold tracking-[0.2em] text-nwcn-green mb-2">LEGAL</p>
              <h1 className="font-brand font-bold text-[28px] text-nwcn-text-default">개인정보처리방침</h1>
            </div>
            <div className="text-right">
              <p className="font-body text-[12px] text-[#bbb]">최종 수정일</p>
              <p className="font-body text-[14px] font-medium text-[#888]">2026년 05월 20일</p>
            </div>
          </div>

          {/* 조항 목록 */}
          <div className="max-w-3xl space-y-6">
            {SECTIONS.map((section, idx) => (
              <div
                key={section.title}
                className="border border-[#ececec] rounded-2xl overflow-hidden hover:border-nwcn-green/20 transition-all duration-300"
              >
                {/* 조항 헤더 */}
                <div className="flex items-center gap-5 px-8 py-5 border-b border-[#ececec] bg-[#fafafa]">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-nwcn-green/10 flex items-center justify-center">
                    <span className="font-brand font-bold text-[13px] text-nwcn-green">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </span>
                  <h2 className="font-body font-semibold text-[15px] text-nwcn-text-default">
                    {section.title.replace(/^\d+\.\s/, '')}
                  </h2>
                </div>

                {/* 내용 */}
                <div className="px-8 py-6">
                  <p className="font-body text-[14px] text-[#666] leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 하단 안내 */}
          <div className="max-w-3xl mt-10 p-6 rounded-2xl bg-[#f7f7f7] border border-[#ececec]">
            <p className="font-body text-[13px] text-[#999] leading-relaxed">
              본 개인정보처리방침은 관련 법령 및 내부 정책에 따라 변경될 수 있으며, 변경 사항은 홈페이지를 통해 공지합니다.
              문의사항은{' '}
              <a href="mailto:nwcn@dba.ac.kr" className="text-nwcn-green underline underline-offset-2">
                nwcn@dba.ac.kr
              </a>
              로 연락해 주세요.
            </p>
          </div>

        </div>
      </div>
    </SubPageLayout>
  )
}
