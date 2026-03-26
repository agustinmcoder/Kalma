# Kalma — Plataforma para Profesionales de Salud

## Concepto
SaaS B2B llamado **Kalma**. El profesional de salud es el cliente (paga membresía mensual). El paciente es usuario secundario (no paga en la app).

Target: psicólogos, psiquiatras y nutricionistas — profesionales que atienden online, manejan historial del paciente y trabajan con obras sociales.

Competencia directa: Psicobit (https://psicobit.com/es-ar/)

---

## Estado actual — 2026-03-26

### ✅ Completado

**Fase 1-2 — Fundaciones y Auth**
- Repo en GitHub (agustinmcoder/Kalma), Supabase, Cloudflare Pages + Workers configurados
- Login / Registro profesional, multitenancy por `profesional_id`
- Invitación de pacientes por token único, trigger DB que linkea `user_id` al registrarse

**Fase 3 — Core del producto**
- Agenda con react-big-calendar (semana/mes/día, colores por estado)
- Sesiones recurrentes (semanal 52 semanas / quincenal 26 semanas / puntual)
- Detección de superposición de horarios en el backend
- Videollamadas integradas en Kalma via Jitsi Meet (iframe, sin API key)
- Importar pacientes desde Excel (template con Nombre, Apellido, Frecuencia, Arancel, Fecha de inicio)
- Subida y aprobación de comprobantes de pago (Supabase Storage)

**Fase 4 — Features secundarios**
- Editor de documentos TipTap (bold, italic, underline, H1-H3, listas)
- Importar .docx con Mammoth
- Exportar .docx con docx package
- Auto-guardado con debounce 2 segundos
- Exportar agenda como .ics (para Google/Apple Calendar)
- Reportes mensuales: sesiones, ingresos, tabla por paciente, gráfico por semana

**Fase 5 — Perfil y buscador**
- Perfil público del profesional en `/p/:slug` (sin login)
- Buscador en `/buscar` con filtros por nombre, tipo y zona
- El profesional configura su perfil desde "Mi perfil" en el sidebar
- Obras sociales por profesional (many-to-many con catálogo de 13 OS)

**Extra — UX completo**
- Landing page en `/` con hero, grilla de features y CTAs
- Portal del paciente con sidebar: Sesiones / Documentos / Comprobantes / Mi cuenta
- Solicitudes de turno: formulario público en el perfil del profesional (sin cuenta), el profesional las gestiona desde su sidebar
- Configuración de cuenta (cambio de contraseña) para profesional y paciente
- Sidebar del profesional: Agenda, Pacientes, Documentos, Pagos, Reportes, Solicitudes, Mi perfil, Mi cuenta

---

### ⏳ Pendiente

**Fase 6 — Monetización (deferred)**
- Membresía con MercadoPago Subscriptions
- Panel de admin: ver todos los profesionales, estado de pago, dar de baja
- Período de gracia + alertas de impago

**Recordatorios (deferred)**
- WhatsApp via Z-API modelo B2 (el profesional escanea QR con su número)
- Email via Resend
- "Tu sesión es en 1 hora"

**V2 (futuro)**
- Google Calendar sync real
- Facturación electrónica AFIP
- Obras sociales con lógica de cobertura/copagos
- App nativa

---

## Stack tecnológico actual

| Necesidad | Herramienta |
|---|---|
| Repo | GitHub (agustinmcoder/Kalma) |
| Frontend | React + Vite — Cloudflare Pages (kalma.pages.dev) |
| Backend | Cloudflare Workers + Hono (kalma-api.agusmcoder.workers.dev) |
| Base de datos | Supabase PostgreSQL |
| Auth + Storage | Supabase Auth / Storage bucket `comprobantes` |
| Videollamadas | Jitsi Meet (iframe embed, meet.jit.si/kalma-{uuid}) |
| Editor de texto | TipTap + @tiptap/extension-underline |
| Importar Word | Mammoth |
| Exportar Word | docx package |
| Calendario | react-big-calendar + date-fns |
| Excel import | xlsx (SheetJS) |
| WhatsApp | Z-API — pendiente |
| Email | Resend — pendiente |
| Cobro membresía | MercadoPago — pendiente |

---

## Estructura de archivos actual

```
kalma/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/ProtectedRoute.jsx
│   │   │   ├── calendar/SesionModal.jsx, exportICS.js
│   │   │   ├── documents/Editor.jsx, utils/exportDocx.js
│   │   │   └── paciente/PacienteModal.jsx
│   │   ├── pages/
│   │   │   ├── auth/Login.jsx, Register.jsx, RegisterPaciente.jsx
│   │   │   ├── profesional/
│   │   │   │   ├── Dashboard.jsx (layout con sidebar)
│   │   │   │   ├── Agenda.jsx
│   │   │   │   ├── Pacientes.jsx
│   │   │   │   ├── Documentos.jsx
│   │   │   │   ├── Pagos.jsx
│   │   │   │   ├── Reportes.jsx
│   │   │   │   ├── Solicitudes.jsx
│   │   │   │   ├── MiPerfil.jsx
│   │   │   │   └── Cuenta.jsx
│   │   │   ├── paciente/Dashboard.jsx (sidebar con 4 secciones)
│   │   │   ├── public/Landing.jsx, Buscar.jsx, PerfilPublico.jsx
│   │   │   └── VideoLlamada.jsx
│   │   ├── hooks/useAuth.js, useSesiones.js
│   │   └── services/api.js, supabase.js
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── sesiones.js
│   │   │   ├── pacientes.js
│   │   │   ├── comprobantes.js
│   │   │   ├── documentos.js
│   │   │   ├── perfil.js
│   │   │   ├── solicitudes.js
│   │   │   └── membresia.js
│   │   ├── middleware/auth.js, tenant.js
│   │   ├── lib/supabase.js
│   │   └── index.js
│   └── wrangler.toml
└── supabase/
    └── migrations/
        ├── 001_schema_inicial.sql
        ├── 002_auth_triggers.sql
        ├── 002b_fix_trigger.sql
        ├── 003_pacientes_campos.sql
        ├── 004_frecuencia_a_demanda.sql
        ├── 005_perfil_publico.sql
        └── 006_solicitudes_anonimas.sql
```

---

## Migraciones SQL pendientes de ejecutar en Supabase

Si se arranca desde un Supabase vacío, ejecutar **en orden** las migraciones 001 a 006.

Si la DB ya tiene las migraciones 001-005 ejecutadas y falta la 006:
```sql
ALTER TABLE solicitudes_turno
  ALTER COLUMN paciente_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS nombre_contacto TEXT,
  ADD COLUMN IF NOT EXISTS email_contacto TEXT,
  ADD COLUMN IF NOT EXISTS telefono_contacto TEXT;

CREATE POLICY "publico crea solicitudes"
  ON solicitudes_turno FOR INSERT
  WITH CHECK (true);
```

---

## Variables de entorno

**Frontend (Cloudflare Pages o .env.local):**
```
VITE_SUPABASE_URL=https://kkjikacqlaomdwvqgmdh.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_NG2yk0CJ834q6x1uS36Cxw_hEkmyQ61
VITE_API_URL=https://kalma-api.agusmcoder.workers.dev
```

**Backend (wrangler secret + .dev.vars):**
```
SUPABASE_URL=https://kkjikacqlaomdwvqgmdh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<secret — ver .dev.vars local>
```

---

## Reglas de negocio
- Solo el profesional toca el calendario, por pedido del paciente
- Cancelaciones con menos de 24hs → se intenta reprogramar, si no es posible se abona igual
- Comprobante subido queda en la plataforma aunque se cancele la sesión
- Si el profesional no paga → período de gracia + aviso al admin (pendiente)
- Multitenancy: todo está aislado por `profesional_id` en cada tabla

---

## Notas del equipo
- Equipo de 2 personas
- JS puro (sin TypeScript), React con Vite
- Experiencia en GitHub y Cloudflare, cómodo con JS, menos con React/Supabase
- Stack 100% JavaScript (frontend y backend mismo lenguaje)
- npm local v11 → generar package-lock.json con `npm install` antes de push para evitar errores en Cloudflare Pages (usa npm 10)
