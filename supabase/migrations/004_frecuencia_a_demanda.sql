-- Agregar "a demanda" como valor válido de frecuencia
ALTER TABLE pacientes DROP CONSTRAINT pacientes_frecuencia_check;
ALTER TABLE pacientes ADD CONSTRAINT pacientes_frecuencia_check
  CHECK (frecuencia IN ('puntual', 'semanal', 'quincenal', 'a demanda'));
