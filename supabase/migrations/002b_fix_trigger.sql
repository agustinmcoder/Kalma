-- Fix: agregar SET search_path = public al trigger
-- Sin esto, el trigger no encuentra las tablas del schema público

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
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
$$;
