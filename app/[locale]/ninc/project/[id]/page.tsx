/**
 * Project 세부 페이지: /ninc/project/[id]
 * Server Component — Supabase에서 단일 프로젝트 fetch
 */

import Link from 'next/link'
import Image from 'next/image'
import SubPageLayout from '@/components/layout/SubPageLayout'
import { notFound } from 'next/navigation'
import { getProjectById } from '@/lib/supabase/queries/projects'
import { getTranslations } from 'next-intl/server'

const TYPE_STYLE = {
  industry: 'bg-nwcn-green text-nwcn-text-default',
  international: 'bg-nwcn-yellow text-nwcn-text-default',
}

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id, locale } = await params
  const project = await getProjectById(id, locale)
  if (!project) notFound()

  const t = await getTranslations({ locale, namespace: 'ninc.project.detail' })

  const TYPE_LABEL = {
    industry: t('typeIndustry'),
    international: t('typeInternational'),
  }

  const yearLabel = t('yearFormat', { year: project.year })

  return (
    <SubPageLayout>
      {/* ── 상단 배너 ── */}
      <div className="bg-white pt-[80px] pb-0">
        <div className="page-container">
          <nav className="flex items-center gap-2 text-xs font-body text-nwcn-text-sub mb-8">
            <Link href="/ninc/project" className="hover:text-nwcn-text-muted transition-colors">
              PROJECT
            </Link>
            <span>/</span>
            <span className="text-nwcn-text-muted truncate max-w-[200px]">{project.title}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`font-body text-sm font-semibold px-4 py-1.5 rounded-full ${TYPE_STYLE[project.type]}`}>
              {TYPE_LABEL[project.type]}
            </span>
            {project.category && (
              <span className="font-body text-sm text-nwcn-text-muted border border-black/10 px-3 py-1.5 rounded-full">
                {project.category}
              </span>
            )}
            {project.partner && (
              <span className="font-body text-sm text-nwcn-text-sub">{project.partner}</span>
            )}
          </div>

          <h1 className="font-body font-bold text-[32px] md:text-[44px] text-nwcn-text-default leading-tight mb-3">
            {project.title}
          </h1>

          <p className="font-body text-sm text-nwcn-text-sub mb-10">
            {yearLabel}{project.duration ? ` · ${project.duration}` : ''}
          </p>
        </div>
        <div className="border-b border-black/10" />
      </div>

      {/* ── 본문 ── */}
      <div className="bg-white py-16">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* 사이드바 */}
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="border border-black/10 rounded-2xl overflow-hidden sticky top-24">
                <div className="relative aspect-[4/3] bg-[#efefef] flex items-center justify-center">
                  {project.thumbnail_url ? (
                    <Image
                      src={project.thumbnail_url}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      unoptimized
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#323131" strokeWidth="1.5">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <path d="M8 21h8M12 17v4" />
                      </svg>
                      <span className="font-body text-xs text-nwcn-text-sub">{t('noImage')}</span>
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-4">
                  {project.partner && (
                    <div>
                      <p className="font-body text-xs text-nwcn-text-sub mb-1">{t('partner')}</p>
                      <p className="font-body text-sm font-semibold text-nwcn-text-default">{project.partner}</p>
                    </div>
                  )}
                  {project.category && (
                    <div>
                      <p className="font-body text-xs text-nwcn-text-sub mb-1">{t('category')}</p>
                      <p className="font-body text-sm text-nwcn-text-muted">{project.category}</p>
                    </div>
                  )}
                  {project.duration && (
                    <div>
                      <p className="font-body text-xs text-nwcn-text-sub mb-1">{t('duration')}</p>
                      <p className="font-body text-sm text-nwcn-text-muted">{project.duration}</p>
                    </div>
                  )}
                  {project.participants && project.participants.length > 0 && (
                    <div>
                      <p className="font-body text-xs text-nwcn-text-sub mb-1">{t('participants')}</p>
                      <p className="font-body text-sm text-nwcn-text-muted">{project.participants.join(', ')}</p>
                    </div>
                  )}
                  {project.skills && project.skills.length > 0 && (
                    <div>
                      <p className="font-body text-xs text-nwcn-text-sub mb-1">{t('skills')}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {project.skills.map((skill) => (
                          <span key={skill} className="font-body text-xs px-2.5 py-1 bg-[#f0f0f0] text-nwcn-text-muted rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {project.project_url && (
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full mt-2 py-2.5 rounded-xl bg-nwcn-green text-nwcn-text-default font-body text-sm font-semibold hover:brightness-105 transition-all"
                    >
                      {t('viewProject')}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </aside>

            {/* 메인 */}
            <main className="lg:col-span-2 order-1 lg:order-2">
              {project.description && (
                <section className="mb-12">
                  <h2 className="font-body font-semibold text-[18px] text-nwcn-text-default mb-4 pb-2 border-b border-black/10">
                    {t('sectionIntro')}
                  </h2>
                  <p className="font-body text-[15px] text-nwcn-text-muted leading-relaxed whitespace-pre-wrap">{project.description}</p>
                </section>
              )}
              {project.outcome && (
                <section className="mb-12">
                  <h2 className="font-body font-semibold text-[18px] text-nwcn-text-default mb-4 pb-2 border-b border-black/10">
                    {t('sectionOutcome')}
                  </h2>
                  <div className="bg-[#f5f5f5] rounded-xl p-5 flex items-start gap-4">
                    <div className="w-8 h-8 bg-nwcn-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#09F593" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p className="font-body text-[15px] text-nwcn-text-muted leading-relaxed whitespace-pre-wrap">{project.outcome}</p>
                  </div>
                </section>
              )}
              {project.participants && project.participants.length > 0 && (
                <section className="mb-12">
                  <h2 className="font-body font-semibold text-[18px] text-nwcn-text-default mb-4 pb-2 border-b border-black/10">
                    {t('sectionParticipants')}
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {project.participants.map((member) => (
                      <div key={member} className="flex items-center gap-3 bg-[#f5f5f5] px-4 py-3 rounded-xl">
                        <div className="w-9 h-9 rounded-full bg-nwcn-text-sub/20 flex items-center justify-center flex-shrink-0">
                          <span className="font-body text-sm font-semibold text-nwcn-text-muted">{member.charAt(0)}</span>
                        </div>
                        <p className="font-body text-sm font-medium text-nwcn-text-default">{member}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="bg-white border-t border-black/10 py-8">
        <div className="page-container">
          <Link href="/ninc/project" className="flex items-center gap-2 font-body text-sm text-nwcn-text-sub hover:text-nwcn-text-default transition-colors group">
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t('backToList')}
          </Link>
        </div>
      </div>
    </SubPageLayout>
  )
}
