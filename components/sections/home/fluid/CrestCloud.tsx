'use client'

/**
 * CrestCloud — 학과 엠블럼 점 구름 카드
 *
 * 화면에 들어오면 흩어진 점이 모여 엠블럼이 되고, 커서를 올리면 그쪽으로 고개를 돌리며
 * 주변 점이 밀려나 빛나고, 누르면 점이 터졌다가 다시 모인다.
 * 화면 밖에서는 그리기를 멈춘다. WebGL을 못 쓰면 엠블럼 이미지를 그대로 보여 준다.
 */

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { CrestEngine } from './crestEngine'

const SRC = '/images/home/crest.png'

export default function CrestCloud({ label }: { label: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [state, setState] = useState<'wait' | 'live' | 'fallback'>('wait')

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    let eng: CrestEngine | null = null
    let raf = 0
    let visible = false
    let introduced = false
    let gone = false

    const loop = (now: number) => {
      raf = 0
      if (!eng || !visible) return
      eng.frame(now)
      raf = requestAnimationFrame(loop)
    }
    const kick = () => {
      if (!raf && eng && visible) raf = requestAnimationFrame(loop)
    }
    const maybeIntro = () => {
      if (eng && visible && !introduced) {
        introduced = true
        eng.intro(performance.now())
      }
    }

    CrestEngine.create(canvas, SRC, {
      count: wrap.clientWidth < 520 ? 9000 : 14000,
      reduce: mq.matches,
      onLost: () => setState('fallback'),
    }).then((e) => {
      if (gone) return e?.dispose()
      if (!e) return setState('fallback')
      eng = e
      setState('live')
      maybeIntro()
      kick()
    })

    const io = new IntersectionObserver(
      ([en]) => {
        visible = en.isIntersecting
        maybeIntro()
        kick()
      },
      { rootMargin: '80px' },
    )
    io.observe(wrap)
    const ro = new ResizeObserver(() => eng?.resize())
    ro.observe(wrap)
    const onMq = () => eng?.setReduce(mq.matches)
    mq.addEventListener('change', onMq)

    const at = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect()
      return [e.clientX - r.left, e.clientY - r.top] as const
    }
    const onMove = (e: PointerEvent) => eng?.pointer(...at(e))
    const onLeave = () => eng?.leave()
    // 마우스는 누르는 순간 터지고, 터치는 스크롤과 구분하려고 탭(click)일 때만 터진다
    let lastType = 'mouse'
    const pop = (e: MouseEvent) => {
      const [x, y] = at(e)
      eng?.pointer(x, y)
      eng?.burst(x, y, performance.now())
    }
    const onDown = (e: PointerEvent) => {
      lastType = e.pointerType
      if (e.pointerType !== 'touch') pop(e)
    }
    const onClick = (e: MouseEvent) => {
      if (lastType === 'touch') pop(e)
    }
    wrap.addEventListener('pointermove', onMove)
    wrap.addEventListener('pointerdown', onDown)
    wrap.addEventListener('click', onClick)
    wrap.addEventListener('pointerleave', onLeave)
    wrap.addEventListener('pointercancel', onLeave)

    return () => {
      gone = true
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      mq.removeEventListener('change', onMq)
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerdown', onDown)
      wrap.removeEventListener('click', onClick)
      wrap.removeEventListener('pointerleave', onLeave)
      wrap.removeEventListener('pointercancel', onLeave)
      eng?.dispose()
    }
  }, [])

  return (
    <div ref={wrapRef} role="img" aria-label={label} className="fh-crest rounded-card" data-state={state}>
      <canvas ref={canvasRef} aria-hidden="true" />
      {state === 'fallback' && <Image src={SRC} alt="" fill sizes="(min-width: 768px) 640px, 100vw" className="fh-crestImg" />}
    </div>
  )
}
