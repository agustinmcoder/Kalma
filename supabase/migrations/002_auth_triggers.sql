-- ============================================================
-- KALMA — Auth triggers y campo invitation_token
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Agregar token de invitación a pacientes
ALTER TABLE pacientes ADD COLUMN invitation_token UUID DEFAULT uuid_generate_v4() UNIQUE;

-- ============================================================
-- TRIGGER: cuando se crea un usuario en auth.users
--   - Si es profesional → crea fila en profesionales
--   - Si es paciente    → vincula con su ficha via invitation_token
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'profesional' THEN
    INSERT INTO profesionales (id, nombre, apellido, tipo)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
      COALESCE(NEW.raw_user_meta_data->>'apellido', ''),
      COALESCE(NEW.raw_user_meta_data->>'tipo_profesional', 'psicologo')
    );

  ELSIF NEW.raw_user_meta_data->>'role' = 'paciente' THEN
    UPDATE pacientes
    SET user_id = NEW.id
    WHERE invitation_token = (NEW.raw_user_meta_data->>'invitation_token')::UUID
      AND user_id IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
