import { useState } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useSesiones } from '../../hooks/useSesiones.js'
import SesionModal from '../../components/calendar/SesionModal.jsx'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { locale: es }),
  getDay,
  locales: { es },
})

const MENSAJES = {
  next: 'Siguiente', previous: 'Anterior', today: 'Hoy',
  month: 'Mes', week: 'Semana', day: 'Día', agenda: 'Lista',
  date: 'Fecha', time: 'Hora', event: 'Sesión', noEventsInRange: 'Sin sesiones en este período.',
}

const COLORES = {
  programada: '#3b82f6',
  confirmada: '#22c55e',
  cancelada: '#9ca3af',
  realizada: '#8b5cf6',
}

export default function Agenda() {
  const [mesActual, setMesActual] = useState(new Date())
  const desde = startOfMonth(subMonths(mesActual, 1)).toISOString()
  const hasta = endOfMonth(addMonths(mesActual, 1)).toISOString()

  const { sesiones, loading, crearSesion, editarSesion, cancelarSesion } = useSesiones(desde, hasta)

  const [modal, setModal] = useState(null) // { tipo: 'nueva' | 'editar', sesion?, slotInicio? }

  // Convertir sesiones al formato que espera react-big-calendar
  const eventos = sesiones.map(s => ({
    id: s.id,
    title: s.paciente ? `${s.paciente.nombre} ${s.paciente.apellido}` : 'Sesión',
    start: new Date(s.fecha_inicio),
    end: new Date(s.fecha_fin),
    resource: s, // datos completos accesibles en los handlers
  }))

  function eventStyleGetter(event) {
    const estado = event.resource.estado
    return {
      style: {
        backgroundColor: COLORES[estado] || COLORES.programada,
        borderRadius: 4,
        border: 'none',
        color: 'white',
        fontSize: 12,
        opacity: estado === 'cancelada' ? 0.5 : 1,
      }
    }
  }

  async function handleGuardar(datos) {
    if (modal.tipo === 'nueva') {
      await crearSesion(datos)
    } else {
      await editarSesion(modal.sesion.id, datos)
    }
    setModal(null)
  }

  async function handleEliminar(id) {
    if (!confirm('¿Cancelar esta sesión?')) return
    await cancelarSesion(id)
    setModal(null)
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Agenda</h2>
        <button onClick={() => setModal({ tipo: 'nueva', slotInicio: new Date() })}>
          + Nueva sesión
        </button>
      </div>

      {loading && <p>Cargando sesiones...</p>}

      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        culture="es"
        messages={MENSAJES}
        eventPropGetter={eventStyleGetter}
        onNavigate={(date) => setMesActual(date)}
        // Click en un slot vacío → crear sesión
        onSelectSlot={(slot) => setModal({ tipo: 'nueva', slotInicio: slot.start })}
        selectable
        // Click en evento existente → editar
        onSelectEvent={(event) => setModal({ tipo: 'editar', sesion: event.resource })}
        defaultView="week"
        views={['month', 'week', 'day']}
      />

      {modal && (
        <SesionModal
          sesion={modal.tipo === 'editar' ? modal.sesion : null}
          slotInicio={modal.slotInicio}
          onGuardar={handleGuardar}
          onCancelar={() => setModal(null)}
          onEliminar={handleEliminar}
        />
      )}
    </div>
  )
}
