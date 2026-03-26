-- Permitir solicitudes de turno anónimas (sin cuenta Kalma)
ALTER TABLE solicitudes_turno
  ALTER COLUMN paciente_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS nombre_contacto TEXT,
  ADD COLUMN IF NOT EXISTS email_contacto TEXT,
  ADD COLUMN IF NOT EXISTS telefono_contacto TEXT;

-- Política para que cualquiera pueda crear una solicitud (anónima)
CREATE POLICY "publico crea solicitudes"
  ON solicitudes_turno FOR INSERT
  WITH CHECK (true);
