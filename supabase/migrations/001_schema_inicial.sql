-- ============================================================
-- KALMA — Schema inicial
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFESIONALES
-- Datos del profesional, vinculados a auth.users por id
-- ============================================================
CREATE TABLE profesionales (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('psicologo', 'psiquiatra', 'nutricionista')),
  matricula TEXT,
  telefono TEXT,
  -- Membresía
  membresia_estado TEXT NOT NULL DEFAULT 'trial' CHECK (membresia_estado IN ('trial', 'activa', 'gracia', 'inactiva')),
  membresia_vence_at TIMESTAMPTZ,
  -- Perfil público
  foto_url TEXT,
  descripcion TEXT,
  orientacion TEXT,
  modalidad TEXT CHECK (modalidad IN ('presencial', 'online', 'ambas')),
  zona TEXT,
  precio_consulta NUMERIC(10,2),
  perfil_publicado BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Obras sociales que atiende el profesional (relación many-to-many con tabla catálogo)
CREATE TABLE obras_sociales_catalogo (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE profesional_obras_sociales (
  profesional_id UUID REFERENCES profesionales(id) ON DELETE CASCADE,
  obra_social_id INTEGER REFERENCES obras_sociales_catalogo(id) ON DELETE CASCADE,
  PRIMARY KEY (profesional_id, obra_social_id)
);

-- ============================================================
-- PACIENTES
-- Cada paciente pertenece a un profesional (multitenancy)
-- ============================================================
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesional_id UUID NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,
  -- Si el paciente tiene cuenta en la plataforma
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Datos personales
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  fecha_nacimiento DATE,
  dni TEXT,
  obra_social TEXT,
  numero_afiliado TEXT,
  -- Notas internas (solo las ve el profesional)
  notas TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SESIONES
-- ============================================================
CREATE TABLE sesiones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesional_id UUID NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  -- Fecha y hora
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ NOT NULL,
  -- Estado
  estado TEXT NOT NULL DEFAULT 'programada' CHECK (estado IN ('programada', 'confirmada', 'cancelada', 'realizada')),
  -- Modalidad y videollamada
  modalidad TEXT CHECK (modalidad IN ('presencial', 'online')),
  link_videollamada TEXT,
  -- Recurrencia
  es_recurrente BOOLEAN DEFAULT false,
  recurrencia_id UUID, -- agrupa sesiones del mismo ciclo recurrente
  -- Notas
  notas TEXT,
  -- Pago
  monto NUMERIC(10,2),
  pago_estado TEXT DEFAULT 'pendiente' CHECK (pago_estado IN ('pendiente', 'aprobado', 'rechazado')),
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMPROBANTES DE PAGO
-- Subidos por el paciente, aprobados/rechazados por el profesional
-- ============================================================
CREATE TABLE comprobantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sesion_id UUID NOT NULL REFERENCES sesiones(id) ON DELETE RESTRICT,
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,
  -- Archivo en Supabase Storage
  archivo_url TEXT NOT NULL,
  archivo_nombre TEXT,
  -- Comentario opcional del paciente
  comentario TEXT,
  -- Estado (el profesional lo cambia)
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DOCUMENTOS
-- Editor TipTap — evaluaciones, notas clínicas, etc.
-- ============================================================
CREATE TABLE documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesional_id UUID NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  -- Contenido como JSON de TipTap
  contenido JSONB,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ARCHIVOS ADJUNTOS
-- PDFs, imágenes por paciente
-- ============================================================
CREATE TABLE adjuntos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesional_id UUID NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  archivo_url TEXT NOT NULL,
  archivo_nombre TEXT NOT NULL,
  tipo_mime TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SOLICITUDES DE TURNO
-- El paciente pide turno, el profesional confirma o rechaza
-- ============================================================
CREATE TABLE solicitudes_turno (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesional_id UUID NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  fecha_solicitada TIMESTAMPTZ NOT NULL,
  mensaje TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'rechazada')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT automático con trigger
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profesionales_updated_at
  BEFORE UPDATE ON profesionales
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_pacientes_updated_at
  BEFORE UPDATE ON pacientes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sesiones_updated_at
  BEFORE UPDATE ON sesiones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_comprobantes_updated_at
  BEFORE UPDATE ON comprobantes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_documentos_updated_at
  BEFORE UPDATE ON documentos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- RLS — Row Level Security
-- Cada tabla solo es accesible por quien corresponde
-- ============================================================
ALTER TABLE profesionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprobantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjuntos ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_turno ENABLE ROW LEVEL SECURITY;

-- Profesionales: solo ven y editan su propio registro
CREATE POLICY "profesional ve su perfil"
  ON profesionales FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profesional edita su perfil"
  ON profesionales FOR UPDATE USING (auth.uid() = id);

-- Pacientes: el profesional ve/edita sus propios pacientes
CREATE POLICY "profesional ve sus pacientes"
  ON pacientes FOR ALL
  USING (profesional_id = auth.uid());

-- El paciente ve su propio registro
CREATE POLICY "paciente ve su registro"
  ON pacientes FOR SELECT
  USING (user_id = auth.uid());

-- Sesiones: el profesional ve/edita sus sesiones
CREATE POLICY "profesional ve sus sesiones"
  ON sesiones FOR ALL
  USING (profesional_id = auth.uid());

-- El paciente ve sus propias sesiones
CREATE POLICY "paciente ve sus sesiones"
  ON sesiones FOR SELECT
  USING (
    paciente_id IN (
      SELECT id FROM pacientes WHERE user_id = auth.uid()
    )
  );

-- Comprobantes: el paciente crea y ve los suyos
CREATE POLICY "paciente gestiona sus comprobantes"
  ON comprobantes FOR ALL
  USING (
    paciente_id IN (
      SELECT id FROM pacientes WHERE user_id = auth.uid()
    )
  );

-- El profesional ve y aprueba/rechaza comprobantes de sus pacientes
CREATE POLICY "profesional gestiona comprobantes"
  ON comprobantes FOR ALL
  USING (profesional_id = auth.uid());

-- Documentos: solo el profesional
CREATE POLICY "profesional gestiona documentos"
  ON documentos FOR ALL
  USING (profesional_id = auth.uid());

-- Adjuntos: solo el profesional
CREATE POLICY "profesional gestiona adjuntos"
  ON adjuntos FOR ALL
  USING (profesional_id = auth.uid());

-- Solicitudes de turno
CREATE POLICY "profesional ve solicitudes"
  ON solicitudes_turno FOR ALL
  USING (profesional_id = auth.uid());

CREATE POLICY "paciente ve sus solicitudes"
  ON solicitudes_turno FOR SELECT
  USING (
    paciente_id IN (
      SELECT id FROM pacientes WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- DATOS INICIALES — Obras sociales comunes en Argentina
-- ============================================================
INSERT INTO obras_sociales_catalogo (nombre) VALUES
  ('OSDE'),
  ('Swiss Medical'),
  ('Galeno'),
  ('Medifé'),
  ('IOMA'),
  ('PAMI'),
  ('Accord Salud'),
  ('OSPEDYC'),
  ('OSECAC'),
  ('Federada Salud'),
  ('Sancor Salud'),
  ('Omint'),
  ('Particular / Sin obra social');
