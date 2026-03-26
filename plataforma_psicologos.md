# Kalma — Plataforma para Profesionales de Salud

## Concepto
SaaS B2B llamado **Kalma**. El profesional de salud es el cliente (paga membresía mensual). El paciente es usuario secundario (no paga en la app).

Target: psicólogos, psiquiatras y nutricionistas — profesionales que atienden online, manejan historial del paciente y trabajan con obras sociales.

Competencia directa: Psicobit (https://psicobit.com/es-ar/)

---

## Plataforma
- **Web app responsive** (no apps nativas para el MVP)
- El paciente accede desde el browser del celular via link
- V2/V3: app nativa si el mercado lo pide

---

## Roles y funcionalidades

**Profesional (psicólogo / psiquiatra / nutricionista):**
- Fichas y seguimiento de pacientes
- Historia clínica automática descargable en PDF
- Importar lista de pacientes desde Excel (template disponible)
- Editar todos los campos del paciente
- Almacenar evaluaciones (psicológicas / nutricionales)
- Agenda de sesiones (único que puede modificar el calendario)
- Alertas de superposición de horarios
- Sesiones recurrentes
- Crea links de videollamada por sesión + integración Meet/Zoom
- Ve y aprueba/rechaza comprobantes de pago de pacientes
- Estado de pagos por sesión y por paciente
- Importa/edita/exporta documentos Word (Mammoth + TipTap + docx.js)
- Subida de archivos adjuntos por paciente (PDF, imágenes)
- Reportes mensuales
- Mini sitio web profesional con SEO básico
- Perfil público en el buscador

**Paciente:**
- Ve sus sesiones agendadas
- Puede solicitar turno (el profesional confirma o rechaza)
- Accede al link de videollamada
- Sube comprobantes de pago con comentario opcional
- Solo ve su propia información
- Acceso por link que le manda el profesional (probablemente por WhatsApp)

**Visitante (paciente potencial):**
- Busca profesionales por obra social, orientación/especialidad, modalidad, zona

---

## Perfil público del profesional (buscador)
- Foto y datos personales
- Especialidad / orientación (listado predefinido según tipo de profesional)
- Obras sociales que atiende (listado predefinido, sin lógica de cobertura)
- Modalidad (presencial, online, ambas)
- Zona/barrio si es presencial
- Precio de consulta (opcional)
- Descripción libre
- Link para sacar turno directo a su agenda

---

## Reglas de negocio importantes
- Solo el profesional toca el calendario, por pedido del paciente
- Cancelaciones con menos de 24hs → se intenta reprogramar, si no es posible se abona igual
- Comprobante subido queda en la plataforma aunque se cancele la sesión
- Si el profesional no paga → período de gracia + aviso al admin
- Si el profesional se da de baja → datos de pacientes se borran

---

## Notificaciones y recordatorios
- Recordatorios automáticos por email (incluido)
- Recordatorios por WhatsApp (incluido, no como add-on — diferenciador vs Psicobit)
- "Tu sesión es en 1 hora"

---

## Calendario
- MVP: exportar .ics
- V2: sincronización real con Google Calendar

---

## Documentos Word
- El profesional importa su propio Word (ya avisado de limitaciones)
- Edita con TipTap
- Exporta como .docx con docx.js
- Disclaimer visible de limitaciones de formato

---

## Features para V2 (no MVP)
- Facturación electrónica AFIP
- Obras sociales (lógica de cobertura, copagos)
- Google Calendar sync real
- App nativa (solo si el mercado lo pide)

---

## Panel de administrador (dueño de la plataforma)
- Ver todos los profesionales y su estado de pago
- Gestionar períodos de gracia manualmente
- Alertas de impago
- Dar de baja cuentas

---

## Modelo de negocio
- Un solo precio mensual por profesional
- Precio en USD ajustado al tipo de cambio (predecible vs competencia)
- Pacientes ilimitados
- WhatsApp incluido sin costo extra
- Piloto inicial gratuito → precio early adopter → precio full

---

## Stack tecnológico

| Necesidad | Herramienta |
|---|---|
| Código | GitHub |
| Frontend | React + Vite |
| Hosting frontend | Cloudflare Pages |
| Backend/API | Cloudflare Workers |
| Base de datos | Supabase (PostgreSQL) |
| Auth + Storage | Supabase |
| Emails y recordatorios | Resend |
| WhatsApp | Por definir |
| Videollamadas | Daily.co |
| Cobro membresía | MercadoPago Subscriptions |
| Editor de texto | TipTap |
| Importar Word | Mammoth |
| Exportar Word | docx.js |

---

## Estructura de archivos
```
kalma/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── calendar/
│   │   │   ├── documents/
│   │   │   └── payments/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── profesional/
│   │   │   ├── paciente/
│   │   │   └── admin/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── sesiones.js
│   │   │   ├── pacientes.js
│   │   │   ├── comprobantes.js
│   │   │   ├── documentos.js
│   │   │   └── membresia.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── tenant.js
│   │   └── index.js
│   └── wrangler.toml
└── supabase/
    └── migrations/
```

---

## Plan de desarrollo (paso a paso)

**Fase 1 — Fundaciones**
1. Crear repo en GitHub
2. Configurar proyecto en Supabase
3. Diseñar y crear tablas de la DB
4. Setup Cloudflare Pages + Workers
5. Conectar frontend con backend

**Fase 2 — Auth y estructura base**
6. Login / Registro de profesional
7. Multitenancy
8. Invitación y acceso de pacientes

**Fase 3 — Core del producto**
9. Agenda + alertas de superposición
10. Links de videollamada
11. Subida de comprobantes
12. Aprobación de comprobantes

**Fase 4 — Features secundarios**
13. Recordatorios automáticos
14. Importar pacientes desde Excel
15. Editor de documentos Word
16. Exportar .ics
17. Reportes mensuales

**Fase 5 — Perfil y buscador**
18. Perfil público del profesional
19. Buscador con filtros
20. Mini sitio web profesional

**Fase 6 — Monetización**
21. Membresía con MercadoPago
22. Panel de admin
23. Período de gracia + alertas

**Fase 7 — Lanzamiento**
24. TyC y política de privacidad
25. Pruebas piloto
26. Ajustes y fixes

---

## Plan de pruebas
1. Los dos desarrolladores solos
2. 2-3 profesionales conocidos (gratis, a cambio de feedback)
3. Piloto cerrado de 10-20 profesionales

---

## Notas del equipo
- Equipo de 2 personas
- Experiencia en GitHub y Cloudflare, poca en Supabase
- Poca experiencia en frontend, más cómodo con JavaScript
- Stack 100% JavaScript (frontend y backend mismo lenguaje)
- El código arranca desde la computadora de casa (tiene todas las herramientas instaladas)
