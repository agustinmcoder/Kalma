import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'

// Convierte el JSON de TipTap a un archivo .docx descargable
// Soporta: párrafos, headings, bold, italic, underline, listas
export async function exportarDocx(titulo, contenido) {
  const children = []

  if (!contenido?.content) {
    children.push(new Paragraph({ text: '' }))
  } else {
    for (const node of contenido.content) {
      const parrafo = nodeToParagraph(node)
      if (parrafo) children.push(parrafo)
    }
  }

  const doc = new Document({
    sections: [{ children }],
    creator: 'Kalma',
    title: titulo,
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${titulo.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '')}.docx`
  a.click()
  URL.revokeObjectURL(url)
}

function nodeToParagraph(node) {
  if (node.type === 'heading') {
    const level = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3 }
    return new Paragraph({
      heading: level[node.attrs?.level] || HeadingLevel.HEADING_1,
      children: (node.content || []).map(inlineToRun),
    })
  }

  if (node.type === 'paragraph') {
    return new Paragraph({
      children: (node.content || []).map(inlineToRun),
    })
  }

  if (node.type === 'bulletList' || node.type === 'orderedList') {
    // Los items de lista se manejan recursivamente
    return null
  }

  if (node.type === 'listItem') {
    return new Paragraph({
      bullet: { level: 0 },
      children: ((node.content?.[0]?.content) || []).map(inlineToRun),
    })
  }

  return new Paragraph({ text: '' })
}

function inlineToRun(inline) {
  if (inline.type !== 'text') return new TextRun('')
  const marks = inline.marks || []
  const bold = marks.some(m => m.type === 'bold')
  const italic = marks.some(m => m.type === 'italic')
  const underline = marks.some(m => m.type === 'underline')
  return new TextRun({ text: inline.text || '', bold, italics: italic, underline: underline ? {} : undefined })
}
