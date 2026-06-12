'use client'

/**
 * 블로그형 WYSIWYG 에디터 (Tiptap 기반)
 *
 * - 글꼴/글자 크기, 굵게·기울임·밑줄, 제목, 목록, 인용, 정렬
 * - 본문 중간 이미지 업로드 (Supabase Storage)
 * - 유튜브/비메오 영상 링크 임베드
 * - 출력은 HTML 문자열(onChange) — 상세페이지에서 sanitize 후 렌더
 */

import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { FontSize, Embed } from '@/lib/tiptap/extensions'
import { uploadArticleImage } from '@/app/admin/actions'

const FONT_FAMILIES = [
  { label: '기본', value: '' },
  { label: '고딕', value: 'Pretendard, sans-serif' },
  { label: '명조', value: 'Georgia, "Nanum Myeongjo", serif' },
  { label: '모노', value: 'monospace' },
]

const FONT_SIZES = [
  { label: '작게', value: '14px' },
  { label: '보통', value: '16px' },
  { label: '크게', value: '20px' },
  { label: '제목', value: '28px' },
]

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        'min-w-[30px] h-[30px] px-1.5 flex items-center justify-center rounded-md font-body text-sm transition-colors',
        active
          ? 'bg-nwcn-green text-nwcn-text-default font-bold'
          : 'text-white/55 hover:text-white hover:bg-white/10',
        disabled ? 'opacity-30 cursor-not-allowed' : '',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // 같은 파일 재선택 허용
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.set('file', file)
      const res = await uploadArticleImage(fd)
      if ('url' in res) {
        editor.chain().focus().setImage({ src: res.url, alt: file.name }).run()
      } else {
        alert(res.error)
      }
    } finally {
      setUploading(false)
    }
  }

  const addLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('링크 URL을 입력하세요', prev ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addEmbed = () => {
    const url = window.prompt('유튜브/비메오 영상 링크를 붙여넣으세요')
    if (!url) return
    editor.chain().focus().setEmbed(url).run()
  }

  const divider = <span className="w-px h-5 bg-white/10 mx-0.5" />

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-white/10 bg-white/3 rounded-t-xl sticky top-0 z-10">
      {/* 글꼴 */}
      <select
        onChange={(e) => {
          const v = e.target.value
          if (v) editor.chain().focus().setFontFamily(v).run()
          else editor.chain().focus().unsetFontFamily().run()
        }}
        title="글꼴"
        className="h-[30px] bg-white/5 border border-white/10 rounded-md px-2 font-body text-xs text-white/70 focus:outline-none cursor-pointer"
        defaultValue=""
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f.label} value={f.value} className="bg-nwcn-dark">{f.label}</option>
        ))}
      </select>
      {/* 글자 크기 */}
      <select
        onChange={(e) => {
          const v = e.target.value
          if (v) editor.chain().focus().setFontSize(v).run()
          else editor.chain().focus().unsetFontSize().run()
        }}
        title="글자 크기"
        className="h-[30px] bg-white/5 border border-white/10 rounded-md px-2 font-body text-xs text-white/70 focus:outline-none cursor-pointer"
        defaultValue=""
      >
        <option value="" className="bg-nwcn-dark">크기</option>
        {FONT_SIZES.map((s) => (
          <option key={s.value} value={s.value} className="bg-nwcn-dark">{s.label}</option>
        ))}
      </select>

      {divider}

      <ToolbarButton title="제목 2" active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
      <ToolbarButton title="제목 3" active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>

      {divider}

      <ToolbarButton title="굵게" active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></ToolbarButton>
      <ToolbarButton title="기울임" active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></ToolbarButton>
      <ToolbarButton title="밑줄" active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></ToolbarButton>
      <ToolbarButton title="취소선" active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></ToolbarButton>

      {divider}

      <ToolbarButton title="글머리 목록" active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}>•</ToolbarButton>
      <ToolbarButton title="번호 목록" active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.</ToolbarButton>
      <ToolbarButton title="인용" active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝</ToolbarButton>

      {divider}

      <ToolbarButton title="링크" active={editor.isActive('link')} onClick={addLink}>🔗</ToolbarButton>
      <ToolbarButton title={uploading ? '업로드 중…' : '이미지 삽입'} disabled={uploading}
        onClick={() => fileInputRef.current?.click()}>{uploading ? '…' : '🖼'}</ToolbarButton>
      <ToolbarButton title="영상 임베드" onClick={addEmbed}>▶</ToolbarButton>

      {divider}

      <ToolbarButton title="실행 취소" disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}>↺</ToolbarButton>
      <ToolbarButton title="다시 실행" disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}>↻</ToolbarButton>

      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImagePick} />
    </div>
  )
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      Image.configure({ inline: false, HTMLAttributes: { class: 'article-img' } }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      Embed,
      Placeholder.configure({ placeholder: placeholder ?? '본문을 작성하세요…' }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'article-editor focus:outline-none min-h-[320px] px-5 py-4',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  // 외부 value가 바뀌면(예: 수정 대상 전환) 에디터 내용 동기화
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current && (value || '') !== '<p></p>') {
      editor.commands.setContent(value || '', false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor])

  if (!editor) {
    return (
      <div className="border border-white/10 rounded-xl bg-white/5 min-h-[360px] flex items-center justify-center">
        <span className="font-body text-xs text-white/30">에디터 로딩 중…</span>
      </div>
    )
  }

  return (
    <div className="border border-white/10 rounded-xl bg-white/5 overflow-hidden">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
