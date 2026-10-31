/**
 * 스냅샷 클라이언트 — DB 연결 없이 공개 데이터 스냅샷(JSON)으로 Supabase 조회 흉내
 * ────────────────────────────────────────────────────────────
 * 브랜치 미리보기처럼 Supabase 환경변수가 없는 곳에서 화면이 텅 비지 않게,
 * scripts/snapshot-public-data.mjs 로 저장해 둔 실제 데이터를 돌려준다.
 * 공개 페이지 조회에 쓰는 것만 지원: select · eq · neq · in · contains · or(ilike/eq) · ilike
 * · is · not(is) · gt/gte/lt/lte · order · limit · range · single · maybeSingle · rpc(작품 랜덤 정렬).
 * 쓰기(insert/update/delete)는 지원하지 않는다(에러를 돌려줌).
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import snapshot from './snapshot/public-data.json'

type Row = Record<string, unknown>
type Result = { data: unknown; error: { message: string } | null; count: number | null }

const TABLES = (snapshot as { tables: Record<string, Row[]> }).tables

/** 스냅샷을 찍은 날짜 (YYYY-MM-DD) */
export const SNAPSHOT_DATE = (snapshot as { takenAt: string }).takenAt.slice(0, 10)

const likeToRegExp = (pattern: string) =>
  new RegExp(`^${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.')}$`, 'i')

const cmp = (a: unknown, b: unknown) => {
  if (a === b) return 0
  if (a === null || a === undefined) return 1
  if (b === null || b === undefined) return -1
  return (a as number | string) < (b as number | string) ? -1 : 1
}

class SnapshotQuery implements PromiseLike<Result> {
  private filters: ((r: Row) => boolean)[] = []
  private orders: { col: string; asc: boolean }[] = []
  private from = 0
  private to = Infinity
  private mode: 'many' | 'single' | 'maybe' = 'many'
  private withCount = false
  private headOnly = false

  constructor(private rows: Row[], private writeError = false) {}

  select(_cols?: string, opts?: { count?: string; head?: boolean }) {
    this.withCount = !!opts?.count
    this.headOnly = !!opts?.head
    return this
  }
  eq(col: string, val: unknown) { this.filters.push((r) => r[col] === val); return this }
  neq(col: string, val: unknown) { this.filters.push((r) => r[col] !== val); return this }
  gt(col: string, val: unknown) { this.filters.push((r) => cmp(r[col], val) > 0); return this }
  gte(col: string, val: unknown) { this.filters.push((r) => cmp(r[col], val) >= 0); return this }
  lt(col: string, val: unknown) { this.filters.push((r) => cmp(r[col], val) < 0); return this }
  lte(col: string, val: unknown) { this.filters.push((r) => cmp(r[col], val) <= 0); return this }
  in(col: string, vals: unknown[]) { this.filters.push((r) => vals.includes(r[col])); return this }
  is(col: string, val: unknown) { this.filters.push((r) => (r[col] ?? null) === val); return this }
  not(col: string, op: string, val: unknown) {
    if (op === 'is') this.filters.push((r) => (r[col] ?? null) !== val)
    else if (op === 'eq') this.filters.push((r) => r[col] !== val)
    return this
  }
  ilike(col: string, pattern: string) {
    const re = likeToRegExp(pattern)
    this.filters.push((r) => re.test(String(r[col] ?? '')))
    return this
  }
  contains(col: string, vals: unknown[]) {
    this.filters.push((r) => Array.isArray(r[col]) && vals.every((v) => (r[col] as unknown[]).includes(v)))
    return this
  }
  /** 'title.ilike.%검색%,author.ilike.%검색%' 꼴만 지원 */
  or(expr: string) {
    const conds = expr.split(',').map((part) => {
      const [col, op, ...rest] = part.split('.')
      const val = rest.join('.')
      if (op === 'ilike') {
        const re = likeToRegExp(val)
        return (r: Row) => re.test(String(r[col] ?? ''))
      }
      if (op === 'eq') return (r: Row) => String(r[col]) === val
      return () => false
    })
    this.filters.push((r) => conds.some((c) => c(r)))
    return this
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orders.push({ col, asc: opts?.ascending !== false })
    return this
  }
  limit(n: number) { this.to = this.from + n - 1; return this }
  range(from: number, to: number) { this.from = from; this.to = to; return this }
  single() { this.mode = 'single'; return this }
  maybeSingle() { this.mode = 'maybe'; return this }

  private run(): Result {
    if (this.writeError) return { data: null, error: { message: '스냅샷 모드에서는 저장할 수 없습니다' }, count: null }
    let rows = this.rows.filter((r) => this.filters.every((f) => f(r)))
    const count = rows.length
    if (this.orders.length) {
      rows = [...rows].sort((a, b) => {
        for (const o of this.orders) {
          const c = cmp(a[o.col], b[o.col])
          if (c !== 0) return o.asc ? c : -c
        }
        return 0
      })
    }
    rows = rows.slice(this.from, this.to === Infinity ? undefined : this.to + 1)
    const withCount = this.withCount ? count : null
    if (this.headOnly) return { data: null, error: null, count: withCount }
    if (this.mode === 'single') {
      return rows.length === 1
        ? { data: rows[0], error: null, count: withCount }
        : { data: null, error: { message: '스냅샷에 해당 행이 없습니다' }, count: withCount }
    }
    if (this.mode === 'maybe') return { data: rows[0] ?? null, error: null, count: withCount }
    return { data: rows, error: null, count: withCount }
  }

  then<A = Result, B = never>(onfulfilled?: ((v: Result) => A | PromiseLike<A>) | null, onrejected?: ((e: unknown) => B | PromiseLike<B>) | null) {
    return Promise.resolve(this.run()).then(onfulfilled, onrejected)
  }
}

class SnapshotTable {
  constructor(private name: string) {}
  private rows() { return TABLES[this.name] ?? [] }
  select(cols?: string, opts?: { count?: string; head?: boolean }) { return new SnapshotQuery(this.rows()).select(cols, opts) }
  insert() { return new SnapshotQuery([], true) }
  update() { return new SnapshotQuery([], true) }
  upsert() { return new SnapshotQuery([], true) }
  delete() { return new SnapshotQuery([], true) }
}

/** 작품 랜덤 정렬 RPC 흉내 — 시드 대신 기본 정렬(연도·조회수)로 돌려준다 */
function rpc(name: string, params: Record<string, unknown> = {}) {
  if (name !== 'get_showcase_works_random') {
    return new SnapshotQuery([], true)
  }
  let q = new SnapshotQuery(TABLES.showcase_works ?? []).select('*')
  if (typeof params.p_tag === 'string') q = q.contains('tech_stack', [params.p_tag])
  if (typeof params.p_q === 'string') q = q.or(`title.ilike.%${params.p_q}%,author.ilike.%${params.p_q}%`)
  const offset = Number(params.p_offset ?? 0)
  const limit = Number(params.p_limit ?? 15)
  return q.order('year', { ascending: false }).order('view_count', { ascending: false }).range(offset, offset + limit - 1)
}

export function createSnapshotClient(): SupabaseClient {
  return { from: (name: string) => new SnapshotTable(name), rpc } as unknown as SupabaseClient
}
