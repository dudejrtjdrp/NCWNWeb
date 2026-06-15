/**
 * JSON-LD 구조화 데이터 삽입 컴포넌트
 * - Server Component에서 <JsonLd data={...} /> 형태로 사용
 * - 검색엔진/AI 크롤러(GEO)가 콘텐츠 의미를 이해하도록 schema.org 데이터 제공
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // schema.org 데이터는 신뢰 가능한 서버 생성 값이므로 안전
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
