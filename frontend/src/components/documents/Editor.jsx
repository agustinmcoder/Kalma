import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'

export default function Editor({ content, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
  })

  if (!editor) return null

  return (
    <div style={{ border: '1px solid #ddd0c4', borderRadius: 8, overflow: 'hidden' }}>
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        style={{ minHeight: 400, padding: '14px 16px', fontSize: 15, color: '#3b2a1a', background: 'white', outline: 'none' }}
      />
    </div>
  )
}

function Toolbar({ editor }) {
  const btn = (active) => ({
    background: active ? '#f0e4d8' : 'white',
    border: '1px solid #ddd0c4',
    borderRadius: 4,
    padding: '4px 10px',
    cursor: 'pointer',
    fontSize: 13,
    color: '#5c4a3a',
    fontWeight: active ? 700 : 400,
  })

  return (
    <div style={{ display: 'flex', gap: 4, padding: '8px 10px', borderBottom: '1px solid #ede0d4', background: '#fffaf6', flexWrap: 'wrap' }}>
      <button style={btn(editor.isActive('bold'))} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}><b>N</b></button>
      <button style={btn(editor.isActive('italic'))} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}><i>I</i></button>
      <button style={btn(editor.isActive('underline'))} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleUnderline().run() }}><u>S</u></button>
      <div style={{ width: 1, background: '#ddd0c4', margin: '0 4px' }} />
      <button style={btn(editor.isActive('heading', { level: 1 }))} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run() }}>H1</button>
      <button style={btn(editor.isActive('heading', { level: 2 }))} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run() }}>H2</button>
      <button style={btn(editor.isActive('heading', { level: 3 }))} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run() }}>H3</button>
      <div style={{ width: 1, background: '#ddd0c4', margin: '0 4px' }} />
      <button style={btn(editor.isActive('bulletList'))} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBulletList().run() }}>• Lista</button>
      <button style={btn(editor.isActive('orderedList'))} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run() }}>1. Lista</button>
      <div style={{ width: 1, background: '#ddd0c4', margin: '0 4px' }} />
      <button style={btn(false)} onMouseDown={e => { e.preventDefault(); editor.chain().focus().undo().run() }}>↩ Deshacer</button>
      <button style={btn(false)} onMouseDown={e => { e.preventDefault(); editor.chain().focus().redo().run() }}>↪ Rehacer</button>
    </div>
  )
}
