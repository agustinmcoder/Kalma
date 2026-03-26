-- Ejecutado manualmente el 2026-03-26
ALTER TABLE pacientes ADD COLUMN frecuencia TEXT CHECK (frecuencia IN ('puntual', 'semanal', 'quincenal'));
ALTER TABLE pacientes ADD COLUMN arancel NUMERIC(10,2);
ALTER TABLE pacientes ADD COLUMN fecha_inicio DATE;
