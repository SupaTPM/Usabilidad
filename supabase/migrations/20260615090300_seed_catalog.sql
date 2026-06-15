-- ════════════════════════════════════════════════════════════════════
-- Datos de catálogo / referencia (seed versionado).
-- Cuestionario RIASEC (30 ítems, 5 por dimensión) + catálogo de carreras.
-- Va como migración para aplicarse también en la nube con `db push`.
-- Idempotente: `on conflict do nothing`.
-- ════════════════════════════════════════════════════════════════════

-- ─── Cuestionario base ────────────────────────────────────────────────
insert into public.questionnaires (id, title, description)
values (
  '11111111-1111-1111-1111-111111111111',
  'Test de Intereses y Aptitudes Vocacionales',
  'Cuestionario basado en el modelo RIASEC (Holland). Responde según cuánto te identificas con cada afirmación (1 = nada, 5 = mucho).'
)
on conflict (id) do nothing;

-- ─── Preguntas (Likert 1-5) ───────────────────────────────────────────
-- dimension: R=Realista I=Investigador A=Artístico S=Social E=Emprendedor C=Convencional
insert into public.questions (questionnaire_id, text, dimension, category, order_index) values
  -- Realista (R)
  ('11111111-1111-1111-1111-111111111111', 'Disfruto armar, reparar o construir cosas con mis manos.', 'R', 'intereses', 1),
  ('11111111-1111-1111-1111-111111111111', 'Me gusta trabajar con herramientas, máquinas o tecnología.', 'R', 'intereses', 2),
  ('11111111-1111-1111-1111-111111111111', 'Prefiero actividades al aire libre o físicas antes que de oficina.', 'R', 'preferencias', 3),
  ('11111111-1111-1111-1111-111111111111', 'Se me da bien resolver problemas prácticos y concretos.', 'R', 'aptitudes', 4),
  ('11111111-1111-1111-1111-111111111111', 'Me interesa entender cómo funcionan los dispositivos.', 'R', 'intereses', 5),
  -- Investigador (I)
  ('11111111-1111-1111-1111-111111111111', 'Me gusta investigar, analizar datos y resolver problemas complejos.', 'I', 'intereses', 6),
  ('11111111-1111-1111-1111-111111111111', 'Disfruto las matemáticas, la ciencia o la lógica.', 'I', 'aptitudes', 7),
  ('11111111-1111-1111-1111-111111111111', 'Me hago muchas preguntas sobre por qué ocurren las cosas.', 'I', 'intereses', 8),
  ('11111111-1111-1111-1111-111111111111', 'Prefiero pensar y entender antes que actuar sin información.', 'I', 'preferencias', 9),
  ('11111111-1111-1111-1111-111111111111', 'Se me da bien aprender conceptos teóricos y abstractos.', 'I', 'aptitudes', 10),
  -- Artístico (A)
  ('11111111-1111-1111-1111-111111111111', 'Me expreso a través del arte, la música, la escritura o el diseño.', 'A', 'intereses', 11),
  ('11111111-1111-1111-1111-111111111111', 'Valoro la creatividad y la originalidad por encima de la rutina.', 'A', 'preferencias', 12),
  ('11111111-1111-1111-1111-111111111111', 'Disfruto imaginar ideas nuevas y proyectos creativos.', 'A', 'intereses', 13),
  ('11111111-1111-1111-1111-111111111111', 'Tengo facilidad para las actividades estéticas o visuales.', 'A', 'habilidades', 14),
  ('11111111-1111-1111-1111-111111111111', 'Prefiero entornos flexibles donde pueda innovar.', 'A', 'preferencias', 15),
  -- Social (S)
  ('11111111-1111-1111-1111-111111111111', 'Me gusta ayudar, enseñar o acompañar a otras personas.', 'S', 'intereses', 16),
  ('11111111-1111-1111-1111-111111111111', 'Se me da bien escuchar y entender cómo se sienten los demás.', 'S', 'habilidades', 17),
  ('11111111-1111-1111-1111-111111111111', 'Disfruto trabajar en equipo y colaborar.', 'S', 'preferencias', 18),
  ('11111111-1111-1111-1111-111111111111', 'Me motiva contribuir al bienestar de mi comunidad.', 'S', 'intereses', 19),
  ('11111111-1111-1111-1111-111111111111', 'Tengo facilidad para comunicarme y resolver conflictos.', 'S', 'habilidades', 20),
  -- Emprendedor (E)
  ('11111111-1111-1111-1111-111111111111', 'Me gusta liderar, persuadir o coordinar a un grupo.', 'E', 'intereses', 21),
  ('11111111-1111-1111-1111-111111111111', 'Disfruto los retos, la competencia y tomar decisiones.', 'E', 'preferencias', 22),
  ('11111111-1111-1111-1111-111111111111', 'Me interesan los negocios, las ventas o emprender proyectos.', 'E', 'intereses', 23),
  ('11111111-1111-1111-1111-111111111111', 'Se me da bien convencer y negociar con otras personas.', 'E', 'habilidades', 24),
  ('11111111-1111-1111-1111-111111111111', 'Me veo dirigiendo iniciativas o mi propio emprendimiento.', 'E', 'preferencias', 25),
  -- Convencional (C)
  ('11111111-1111-1111-1111-111111111111', 'Me gusta organizar información, datos y documentos con orden.', 'C', 'intereses', 26),
  ('11111111-1111-1111-1111-111111111111', 'Prefiero tareas con reglas claras y procedimientos definidos.', 'C', 'preferencias', 27),
  ('11111111-1111-1111-1111-111111111111', 'Se me da bien trabajar con números, registros o planillas.', 'C', 'aptitudes', 28),
  ('11111111-1111-1111-1111-111111111111', 'Soy detallista y cuidadoso/a con la precisión.', 'C', 'habilidades', 29),
  ('11111111-1111-1111-1111-111111111111', 'Me siento cómodo/a siguiendo planes y manteniendo el orden.', 'C', 'preferencias', 30)
on conflict do nothing;

-- ─── Catálogo de carreras ─────────────────────────────────────────────
insert into public.careers
  (name, description, riasec_code, field, avg_duration_years, academic_demand, job_demand, avg_monthly_cost, job_market_outlook, university_examples, key_skills)
values
  ('Ingeniería de Software',
   'Diseño, desarrollo y mantenimiento de sistemas y aplicaciones de software.',
   'IRC', 'Tecnología', 5.0, 'high', 'high', 350.00,
   'Alta demanda y crecimiento sostenido en el sector tecnológico.',
   '["Universidad Nacional", "Instituto Tecnológico", "Universidad Privada"]'::jsonb,
   '["Programación", "Lógica", "Resolución de problemas", "Trabajo en equipo"]'::jsonb),

  ('Medicina',
   'Diagnóstico, tratamiento y prevención de enfermedades; cuidado de la salud.',
   'ISR', 'Salud', 6.0, 'high', 'high', 500.00,
   'Demanda estable y esencial; requiere alta dedicación académica.',
   '["Universidad Nacional", "Facultad de Ciencias Médicas"]'::jsonb,
   '["Empatía", "Pensamiento científico", "Responsabilidad", "Atención al detalle"]'::jsonb),

  ('Psicología',
   'Estudio del comportamiento y los procesos mentales; acompañamiento y terapia.',
   'SIA', 'Ciencias Sociales', 5.0, 'medium', 'medium', 280.00,
   'Demanda creciente en salud mental, educación y recursos humanos.',
   '["Universidad Nacional", "Universidad Privada"]'::jsonb,
   '["Escucha activa", "Empatía", "Análisis", "Comunicación"]'::jsonb),

  ('Diseño Gráfico',
   'Creación de comunicación visual: marca, editorial, digital y multimedia.',
   'AER', 'Arte y Diseño', 4.0, 'medium', 'medium', 250.00,
   'Buena demanda en marketing digital y agencias creativas.',
   '["Escuela de Diseño", "Universidad de Artes"]'::jsonb,
   '["Creatividad", "Herramientas digitales", "Composición", "Comunicación visual"]'::jsonb),

  ('Administración de Empresas',
   'Gestión de organizaciones: finanzas, operaciones, marketing y personas.',
   'ECS', 'Negocios', 4.5, 'medium', 'high', 300.00,
   'Amplio campo laboral transversal a todos los sectores.',
   '["Universidad Nacional", "Escuela de Negocios"]'::jsonb,
   '["Liderazgo", "Organización", "Comunicación", "Toma de decisiones"]'::jsonb),

  ('Contabilidad y Finanzas',
   'Registro, análisis y control de la información económica y financiera.',
   'CEI', 'Negocios', 4.5, 'medium', 'high', 280.00,
   'Demanda constante; toda organización requiere control contable.',
   '["Universidad Nacional", "Instituto Superior"]'::jsonb,
   '["Precisión", "Análisis numérico", "Orden", "Ética"]'::jsonb),

  ('Arquitectura',
   'Diseño de espacios y edificaciones, combinando arte, técnica y función.',
   'AIR', 'Arte y Diseño', 5.5, 'high', 'medium', 380.00,
   'Demanda ligada al sector construcción e inmobiliario.',
   '["Facultad de Arquitectura", "Universidad Nacional"]'::jsonb,
   '["Creatividad", "Visión espacial", "Dibujo técnico", "Cálculo"]'::jsonb),

  ('Enfermería',
   'Cuidado integral del paciente y apoyo a los equipos de salud.',
   'SRI', 'Salud', 4.0, 'medium', 'high', 240.00,
   'Alta demanda y escasez de profesionales en el sector salud.',
   '["Facultad de Ciencias de la Salud", "Universidad Nacional"]'::jsonb,
   '["Empatía", "Trabajo bajo presión", "Responsabilidad", "Atención al detalle"]'::jsonb),

  ('Marketing y Publicidad',
   'Estrategias para posicionar productos, marcas y servicios.',
   'EAS', 'Negocios', 4.0, 'medium', 'high', 290.00,
   'Crecimiento impulsado por el marketing digital y las redes.',
   '["Escuela de Comunicación", "Universidad Privada"]'::jsonb,
   '["Creatividad", "Comunicación", "Análisis de mercado", "Persuasión"]'::jsonb),

  ('Derecho',
   'Estudio y aplicación de las normas jurídicas; asesoría y defensa legal.',
   'ESC', 'Ciencias Sociales', 5.0, 'high', 'medium', 320.00,
   'Campo amplio: corporativo, público, penal y consultoría.',
   '["Facultad de Derecho", "Universidad Nacional"]'::jsonb,
   '["Argumentación", "Lectura crítica", "Ética", "Comunicación"]'::jsonb),

  ('Ingeniería Civil',
   'Diseño y construcción de infraestructura: edificios, vías y obras.',
   'RIC', 'Ingeniería', 5.0, 'high', 'medium', 360.00,
   'Demanda asociada a obra pública e inversión en infraestructura.',
   '["Facultad de Ingeniería", "Universidad Nacional"]'::jsonb,
   '["Cálculo", "Resolución de problemas", "Planificación", "Trabajo en campo"]'::jsonb),

  ('Educación / Pedagogía',
   'Formación y acompañamiento de estudiantes en distintos niveles.',
   'SAC', 'Educación', 4.0, 'medium', 'medium', 200.00,
   'Demanda estable; necesidad continua de docentes calificados.',
   '["Facultad de Educación", "Instituto Pedagógico"]'::jsonb,
   '["Comunicación", "Paciencia", "Creatividad", "Empatía"]'::jsonb),

  ('Ciencia de Datos',
   'Extracción de conocimiento a partir de datos con estadística y programación.',
   'ICE', 'Tecnología', 5.0, 'high', 'high', 380.00,
   'Una de las profesiones de mayor crecimiento y demanda actual.',
   '["Universidad Tecnológica", "Facultad de Ciencias"]'::jsonb,
   '["Estadística", "Programación", "Pensamiento analítico", "Comunicación de hallazgos"]'::jsonb),

  ('Comunicación Social / Periodismo',
   'Investigación, producción y difusión de contenidos e información.',
   'ASE', 'Ciencias Sociales', 4.0, 'medium', 'medium', 250.00,
   'Transformación hacia medios digitales y creación de contenido.',
   '["Facultad de Comunicación", "Universidad Nacional"]'::jsonb,
   '["Redacción", "Comunicación", "Curiosidad", "Trabajo bajo plazos"]'::jsonb),

  ('Gastronomía',
   'Arte y técnica de la cocina, gestión de cocina y servicios de alimentos.',
   'REA', 'Servicios', 3.0, 'low', 'medium', 300.00,
   'Demanda en turismo, hotelería y emprendimiento gastronómico.',
   '["Escuela de Gastronomía", "Instituto Culinario"]'::jsonb,
   '["Creatividad", "Trabajo en equipo", "Resistencia", "Atención al detalle"]'::jsonb)
on conflict do nothing;
