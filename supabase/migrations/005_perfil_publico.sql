-- Agregar slug único al profesional para URL pública
ALTER TABLE profesionales ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Política para que cualquiera pueda ver perfiles publicados (sin auth)
CREATE POLICY "publico ve perfiles publicados"
  ON profesionales FOR SELECT
  USING (perfil_publicado = true);

-- Política para ver obras sociales del profesional en perfiles publicados
CREATE POLICY "publico ve obras sociales de perfiles publicados"
  ON profesional_obras_sociales FOR SELECT
  USING (
    profesional_id IN (
      SELECT id FROM profesionales WHERE perfil_publicado = true
    )
  );

ALTER TABLE obras_sociales_catalogo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "publico ve catalogo obras sociales"
  ON obras_sociales_catalogo FOR SELECT USING (true);

ALTER TABLE profesional_obras_sociales ENABLE ROW LEVEL SECURITY;
