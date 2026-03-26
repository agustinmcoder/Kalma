// Genera y descarga un archivo .ics con las sesiones dadas
export function exportarICS(sesiones, nombreProfesional) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kalma//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  for (const s of sesiones) {
    if (s.estado === 'cancelada') continue
    const start = toICSDate(s.fecha_inicio)
    const end = toICSDate(s.fecha_fin)
    const paciente = s.paciente ? `${s.paciente.nombre} ${s.paciente.apellido}` : 'Sesión'
    const uid = `kalma-${s.id}@kalma`

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${uid}`)
    lines.push(`DTSTART:${start}`)
    lines.push(`DTEND:${end}`)
    lines.push(`SUMMARY:${paciente}`)
    if (s.modalidad) lines.push(`DESCRIPTION:Modalidad: ${s.modalidad}`)
    if (s.link_videollamada) lines.push(`URL:${s.link_videollamada}`)
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `kalma-agenda.ics`
  a.click()
  URL.revokeObjectURL(url)
}

function toICSDate(iso) {
  // "2025-03-26T14:00:00.000Z" → "20250326T140000Z"
  return iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '').replace('T', 'T')
}
