import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: '#fdf8f3', fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <header style={{ background: '#3b2a1a', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#f5e6d8', fontSize: 24, fontWeight: 700, letterSpacing: 1 }}>Kalma</span>
        <Link to="/login" style={{ color: '#c9b8aa', fontSize: 14, textDecoration: 'none', border: '1px solid #6b5040', borderRadius: 6, padding: '7px 16px' }}>
          Ingresar
        </Link>
      </header>

      {/* Hero */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '72px 28px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 40, color: '#3b2a1a', fontWeight: 700, margin: '0 0 18px', lineHeight: 1.2 }}>
          La agenda para profesionales<br />de la salud mental
        </h1>
        <p style={{ fontSize: 18, color: '#7a5c45', margin: '0 0 48px', lineHeight: 1.6 }}>
          Gestioná tus pacientes, sesiones y pagos en un solo lugar.<br />
          Incluye videollamadas y recordatorios sin costo extra.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/registro" style={{ background: '#c47a4a', color: 'white', borderRadius: 10, padding: '16px 36px', textDecoration: 'none', fontSize: 17, fontWeight: 600, boxShadow: '0 4px 12px rgba(196,122,74,0.3)' }}>
            Soy profesional →
          </Link>
          <Link to="/buscar" style={{ background: 'white', color: '#3b2a1a', borderRadius: 10, padding: '16px 36px', textDecoration: 'none', fontSize: 17, fontWeight: 600, border: '1px solid #ddd0c4' }}>
            Busco profesional
          </Link>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 28px 72px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        {[
          { icon: '📅', titulo: 'Agenda inteligente', desc: 'Gestioná sesiones recurrentes, individuales y por videollamada desde un solo calendario.' },
          { icon: '💻', titulo: 'Videollamadas incluidas', desc: 'Sesiones online dentro de Kalma, sin apps externas ni costos adicionales.' },
          { icon: '📄', titulo: 'Editor de notas', desc: 'Redactá y guardá documentos clínicos con formato enriquecido para cada paciente.' },
          { icon: '💰', titulo: 'Control de pagos', desc: 'Tus pacientes suben los comprobantes y vos los aprobás o rechazás fácilmente.' },
          { icon: '📊', titulo: 'Reportes mensuales', desc: 'Resumen de sesiones e ingresos por paciente, mes a mes.' },
          { icon: '🔍', titulo: 'Perfil público', desc: 'Publicá tu perfil para que nuevos pacientes puedan encontrarte y pedir turno.' },
        ].map(f => (
          <div key={f.titulo} style={{ background: 'white', border: '1px solid #f0e4d8', borderRadius: 12, padding: '22px 20px', boxShadow: '0 1px 6px rgba(80,40,0,0.07)' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontWeight: 600, color: '#3b2a1a', fontSize: 15, marginBottom: 6 }}>{f.titulo}</div>
            <div style={{ fontSize: 14, color: '#7a5c45', lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* CTA final */}
      <div style={{ background: '#3b2a1a', padding: '48px 28px', textAlign: 'center' }}>
        <p style={{ color: '#c9b8aa', fontSize: 16, marginBottom: 20 }}>Empezá gratis, sin tarjeta de crédito.</p>
        <Link to="/registro" style={{ background: '#c47a4a', color: 'white', borderRadius: 10, padding: '14px 32px', textDecoration: 'none', fontSize: 16, fontWeight: 600 }}>
          Crear mi cuenta
        </Link>
      </div>
    </div>
  )
}
