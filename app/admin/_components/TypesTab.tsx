'use client'

import { useState, useTransition, useEffect } from 'react'
import { saveArticleTypes, saveProjectTypes } from '../actions'
import { Label, Input, Feedback } from './admin-ui'
import { useLoading } from '@/components/providers/LoadingProvider'
import type { ActionResult } from '../actions'

const DEFAULT_ARTICLE_TYPES = [
  { value: 'editorial', label: '에디토리얼' },
  { value: 'trend', label: '트렌드' },
  { value: 'card_news', label: '카드뉴스' },
]
const DEFAULT_PROJECT_TYPES = [
  { value: 'industry', label: '산학협력' },
  { value: 'international', label: '해외교류' },
]

export default function TypesTab() {
  const [articleTypes, setArticleTypes] = useState(DEFAULT_ARTICLE_TYPES)
  const [projectTypes, setProjectTypes] = useState(DEFAULT_PROJECT_TYPES)
  const [newAV, setNewAV] = useState(''); const [newAL, setNewAL] = useState('')
  const [newPV, setNewPV] = useState(''); const [newPL, setNewPL] = useState('')
  const [articleResult, setArticleResult] = useState<ActionResult | null>(null)
  const [projectResult, setProjectResult] = useState<ActionResult | null>(null)
  const [articlePending, startArticleTransition] = useTransition()
  const [projectPending, startProjectTransition] = useTransition()
  const { showLoading, hideLoading } = useLoading()

  useEffect(() => {
    if (articlePending) showLoading()
    else hideLoading()
  }, [articlePending, showLoading, hideLoading])

  useEffect(() => {
    if (projectPending) showLoading()
    else hideLoading()
  }, [projectPending, showLoading, hideLoading])

  const addArticleType = () => {
    if (!newAV.trim() || !newAL.trim()) return
    if (articleTypes.some((t) => t.value === newAV.trim())) return
    setArticleTypes([...articleTypes, { value: newAV.trim(), label: newAL.trim() }])
    setNewAV(''); setNewAL('')
  }

  const addProjectType = () => {
    if (!newPV.trim() || !newPL.trim()) return
    if (projectTypes.some((t) => t.value === newPV.trim())) return
    setProjectTypes([...projectTypes, { value: newPV.trim(), label: newPL.trim() }])
    setNewPV(''); setNewPL('')
  }

  return (
    <div className="space-y-10">
      <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" className="flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="font-body text-xs text-yellow-400/80 leading-relaxed">
          유형 추가·삭제 후 반드시 <strong>저장</strong>을 눌러야 적용됩니다.
          DB에 <code className="text-yellow-300 font-mono">settings</code> 테이블이 있어야 저장됩니다.
        </p>
      </div>

      {/* 아티클 유형 */}
      <section className="space-y-4">
        <h3 className="font-body font-bold text-[15px] text-white">NCR 아티클 유형</h3>
        <div className="space-y-2">
          {articleTypes.map((t) => (
            <div key={t.value} className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl px-4 py-3">
              <code className="font-mono text-xs text-nwcn-green bg-nwcn-green/10 px-2 py-0.5 rounded">{t.value}</code>
              <span className="font-body text-sm text-white flex-1">{t.label}</span>
              <button onClick={() => setArticleTypes(articleTypes.filter((x) => x.value !== t.value))}
                className="font-body text-xs text-white/20 hover:text-red-400 transition-colors">삭제</button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>값 (영문, 언더스코어 허용)</Label><Input value={newAV} onChange={(e) => setNewAV(e.target.value)} placeholder="news" /></div>
          <div><Label>표시 이름</Label><Input value={newAL} onChange={(e) => setNewAL(e.target.value)} placeholder="뉴스" /></div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={addArticleType}
            disabled={!newAV.trim() || !newAL.trim()}
            className="px-4 py-2.5 border border-white/10 rounded-xl font-body text-sm text-white/50 hover:text-white hover:border-white/20 disabled:opacity-30 transition-colors">
            + 유형 추가
          </button>
          <button type="button"
            onClick={() => { setArticleResult(null); startArticleTransition(async () => { setArticleResult(await saveArticleTypes(articleTypes)) }) }}
            disabled={articlePending}
            className="px-5 py-2.5 bg-nwcn-green text-nwcn-text-default font-body font-semibold text-sm rounded-xl hover:brightness-110 disabled:opacity-50 transition-all">
            {articlePending ? '저장 중...' : '저장'}
          </button>
        </div>
        {articleResult && <Feedback result={articleResult} />}
      </section>

      <div className="h-px bg-white/8" />

      {/* 프로젝트 유형 */}
      <section className="space-y-4">
        <h3 className="font-body font-bold text-[15px] text-white">프로젝트 유형</h3>
        <div className="space-y-2">
          {projectTypes.map((t) => (
            <div key={t.value} className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl px-4 py-3">
              <code className="font-mono text-xs text-nwcn-green bg-nwcn-green/10 px-2 py-0.5 rounded">{t.value}</code>
              <span className="font-body text-sm text-white flex-1">{t.label}</span>
              <button onClick={() => setProjectTypes(projectTypes.filter((x) => x.value !== t.value))}
                className="font-body text-xs text-white/20 hover:text-red-400 transition-colors">삭제</button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>값 (영문)</Label><Input value={newPV} onChange={(e) => setNewPV(e.target.value)} placeholder="overseas" /></div>
          <div><Label>표시 이름</Label><Input value={newPL} onChange={(e) => setNewPL(e.target.value)} placeholder="해외사업" /></div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={addProjectType}
            disabled={!newPV.trim() || !newPL.trim()}
            className="px-4 py-2.5 border border-white/10 rounded-xl font-body text-sm text-white/50 hover:text-white hover:border-white/20 disabled:opacity-30 transition-colors">
            + 유형 추가
          </button>
          <button type="button"
            onClick={() => { setProjectResult(null); startProjectTransition(async () => { setProjectResult(await saveProjectTypes(projectTypes)) }) }}
            disabled={projectPending}
            className="px-5 py-2.5 bg-nwcn-green text-nwcn-text-default font-body font-semibold text-sm rounded-xl hover:brightness-110 disabled:opacity-50 transition-all">
            {projectPending ? '저장 중...' : '저장'}
          </button>
        </div>
        {projectResult && <Feedback result={projectResult} />}
      </section>
    </div>
  )
}
