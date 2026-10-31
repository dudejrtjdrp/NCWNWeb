'use client'

/**
 * CreatorPicker — 작품 제작자 입력 (여러 명)
 * ────────────────────────────────────────────────────────────
 * - 이름이나 학번을 치면 학생 DB(students)에서 찾아 목록으로 보여준다 (이름 아래 회색 작은 학번).
 * - 고르면 뱃지로 추가되고 student_id 로 연결된다 → 작품 상세에서 그 학생 포트폴리오로 이어진다.
 * - 학생 DB 에 없는 사람은 맨 아래 "직접 추가"로 이름만 넣는다 (연결 없음).
 * - 뱃지: 연결 안 된 이름은 눌러서 고치고, 연결된 학생은 '다시 고르기'(검색창으로 돌려보냄), × 로 삭제.
 * 폼에는 creators(JSON) 와 author(이름을 쉼표로 이은 문자열)를 hidden 으로 보낸다.
 */

import { useEffect, useId, useRef, useState } from 'react'
import { searchStudents } from '../actions'

export interface CreatorValue {
  name: string
  student_id: string | null
  student_no: string | null
}

interface StudentHit {
  id: string
  name: string
  student_no: string | null
}

export default function CreatorPicker({ initial }: { initial: CreatorValue[] }) {
  const [items, setItems] = useState<CreatorValue[]>(initial)
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<StudentHit[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [missing, setMissing] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  // 학생 검색 (180ms 디바운스)
  useEffect(() => {
    if (!open) return
    let alive = true
    const timer = setTimeout(async () => {
      const res = await searchStudents(q)
      if (!alive) return
      if ('error' in res) {
        setHits([])
        return
      }
      setMissing(!!res.missing)
      setHits(res.items.filter((s) => !items.some((it) => it.student_id === s.id)))
      setActive(0)
    }, 180)
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [q, open, items])

  // 바깥을 누르면 목록 닫기
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const free = q.trim()
  const options: ({ kind: 'student'; hit: StudentHit } | { kind: 'free'; name: string })[] = [
    ...hits.map((hit) => ({ kind: 'student' as const, hit })),
    ...(free && !hits.some((h) => h.name === free) ? [{ kind: 'free' as const, name: free }] : []),
  ]

  const choose = (i: number) => {
    const opt = options[i]
    if (!opt) return
    if (opt.kind === 'student') {
      setItems((prev) => [...prev, { name: opt.hit.name, student_id: opt.hit.id, student_no: opt.hit.student_no }])
    } else if (!items.some((it) => !it.student_id && it.name === opt.name)) {
      setItems((prev) => [...prev, { name: opt.name, student_id: null, student_no: null }])
    }
    setQ('')
    setActive(0)
    inputRef.current?.focus()
  }

  const remove = (i: number) => setItems((prev) => prev.filter((_, k) => k !== i))

  const startEdit = (i: number) => {
    const it = items[i]
    if (it.student_id) {
      // 연결된 학생은 다시 고르기: 뱃지를 빼고 이름을 검색창으로
      remove(i)
      setQ(it.name)
      setOpen(true)
      inputRef.current?.focus()
      return
    }
    setEditing(i)
    setEditValue(it.name)
  }

  const commitEdit = () => {
    if (editing === null) return
    const name = editValue.trim()
    setItems((prev) => (name ? prev.map((it, k) => (k === editing ? { ...it, name } : it)) : prev.filter((_, k) => k !== editing)))
    setEditing(null)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((a) => Math.min(a + 1, Math.max(options.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault() // 폼 제출 막기
      if (options.length) choose(Math.min(active, options.length - 1))
    } else if (e.key === 'Backspace' && !q && items.length) {
      remove(items.length - 1)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={boxRef} className="relative">
      <input type="hidden" name="creators" value={JSON.stringify(items)} />
      <input type="hidden" name="author" value={items.map((it) => it.name).join(', ')} />

      <div className="flex min-h-[50px] w-full flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus-within:border-nwcn-green/50">
        {items.map((it, i) =>
          editing === i ? (
            <input
              key={`edit-${i}`}
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  commitEdit()
                } else if (e.key === 'Escape') setEditing(null)
              }}
              className="w-28 rounded-full border border-nwcn-green/50 bg-white/10 px-3 py-1 font-body text-sm text-white focus:outline-none"
              aria-label="제작자 이름 고치기"
            />
          ) : (
            <span
              key={`${it.student_id ?? 'free'}-${it.name}-${i}`}
              className={[
                'inline-flex items-center gap-1.5 rounded-full border py-1 pl-3 pr-1 font-body text-sm',
                it.student_id ? 'border-nwcn-green/40 bg-nwcn-green/10 text-white' : 'border-white/15 bg-white/5 text-white/80',
              ].join(' ')}
            >
              <button
                type="button"
                onClick={() => startEdit(i)}
                className="flex flex-col items-start leading-tight hover:underline"
                title={it.student_id ? '다시 고르기' : '이름 고치기'}
              >
                <span>{it.name}</span>
                <span className="text-[10px] text-white/40">{it.student_no ?? '학생 DB 연결 안 됨'}</span>
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`${it.name} 빼기`}
                className="grid h-6 w-6 place-items-center rounded-full text-white/40 hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </span>
          )
        )}
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={items.length ? '제작자 더 추가' : '이름이나 학번으로 학생 검색'}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          className="min-w-[10rem] flex-1 bg-transparent px-1 py-1 font-body text-sm text-white placeholder:text-white/20 focus:outline-none"
        />
      </div>

      {open && (options.length > 0 || missing) && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-auto rounded-xl border border-white/10 bg-nwcn-dark-2 py-1 shadow-xl shadow-black/50"
        >
          {missing && (
            <li className="px-4 py-2 font-body text-xs text-white/40">
              학생 DB가 아직 없습니다 — 이름을 입력해 직접 추가하세요 (supabase/migrations/create_students.sql 적용 필요)
            </li>
          )}
          {options.map((opt, i) => (
            <li
              key={opt.kind === 'student' ? opt.hit.id : `free-${opt.name}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault()
                choose(i)
              }}
              onMouseEnter={() => setActive(i)}
              className={[
                'cursor-pointer px-4 py-2 font-body',
                i === active ? 'bg-white/10' : '',
                opt.kind === 'free' ? 'border-t border-white/5' : '',
              ].join(' ')}
            >
              {opt.kind === 'student' ? (
                <>
                  <span className="block text-sm text-white">{opt.hit.name}</span>
                  <span className="block text-[11px] text-white/40">{opt.hit.student_no ?? '학번 없음'}</span>
                </>
              ) : (
                <>
                  <span className="block text-sm text-white">‘{opt.name}’ 직접 추가</span>
                  <span className="block text-[11px] text-white/40">학생 DB에 없는 이름 — 포트폴리오와 연결되지 않습니다</span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
