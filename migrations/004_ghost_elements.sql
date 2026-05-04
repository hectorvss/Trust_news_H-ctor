-- MIGRACIÓN PARA HABILITAR ELEMENTOS FANTASMAS DESDE SUPABASE

alter table public.app_config add column if not exists blind_spots jsonb default '[]'::jsonb;
alter table public.app_config add column if not exists related_topics jsonb default '[]'::jsonb;
alter table public.app_config add column if not exists special_sections jsonb default '[]'::jsonb;
alter table public.app_config add column if not exists footer_links jsonb default '{}'::jsonb;

-- Seed con los datos actuales para que la interfaz siga viéndose perfecta desde el primer momento:

update public.app_config 
set 
  blind_spots = '[
      { "type": "LEFT", "text": "El aumento de los costes sanitarios en las zonas rurales suele ser ignorado por los medios de comunicación progresistas." },
      { "type": "RIGHT", "text": "Los indicadores económicos positivos de las reformas laborales no suelen aparecer en los medios conservadores." }
  ]'::jsonb,
  related_topics = '["POLÍTICA FISCAL", "IBEX 35", "ENERGÍA VERDE", "OTAN", "STARTUPS", "MUSEO DEL PRADO"]'::jsonb,
  special_sections = '[
    {
      "id": "isr-gaz",
      "label": "ESPECIAL:",
      "title": "Israel-Gaza",
      "btn1": "MÁS BLOQUES ASÍ",
      "btn2": "OCULTAR ESTO",
      "trend": "TEMA EN TENDENCIA GLOBAL",
      "main": {
        "label": "NOTICIA DESTACADA — HACE 4H",
        "title": "Nuevas negociaciones en El Cairo buscan una tregua humanitaria en Gaza",
        "desc": "Delegaciones de Israel y Hamás se reúnen con mediadores egipcios para discutir un posible intercambio de rehenes y una pausa prolongada en las hostilidades antes del inicio del Ramadán.",
        "legendLeft": "COBERTURA: 124 FUENTES",
        "legendRight": "VER ANÁLISIS ↗",
        "barType": "grayscale"
      },
      "sides": [
        { "label": "POLÍTICA EXTERIOR", "title": "Ayuda humanitaria llega al puerto flotante construido por EE.UU.", "meta": "COBERTURA CENTRISTA" },
        { "label": "CONFLICTO NORTE", "title": "Aumenta la tensión en la frontera norte: intercambio de fuego con Hezbolá.", "meta": "PUNTO CIEGO DE DERECHA" },
        { "label": "SOCIEDAD CIVIL", "title": "Protestas masivas en Tel Aviv exigen la convocatoria de elecciones anticipadas.", "meta": "PUNTO CIEGO DE IZQUIERDA" }
      ]
    },
    {
      "id": "eur-pol",
      "label": "EUROPEAN",
      "title": "POLITICS",
      "btn1": "MÁS DE EUROPA",
      "btn2": "MENOS DE EUROPA",
      "trend": "ELECCIONES JUNIO 2024",
      "main": {
        "label": "U.E. — NOTICIA CENTRAL",
        "title": "Macron advierte que Europa \"puede morir\" si no se reestructura militarmente",
        "desc": "El presidente francés hace un llamamiento a la autonomía estratégica europea ante la incertidumbre del apoyo estadounidense y el ascenso de potencias rivales.",
        "legendLeft": "COBERTURA: 88 FUENTES",
        "legendRight": "VER PERSPECTIVAS ↗",
        "barType": "grayscale"
      },
      "sides": [
        { "label": "ALEMANIA", "title": "Berlín aprueba el paquete de defensa más grande desde la Guerra Fría.", "meta": "COBERTURA CENTRISTA" },
        { "label": "POLONIA", "title": "Tusk lidera el desbloqueo de fondos europeos tras reformas judiciales.", "meta": "NOTICIA DESTACADA" },
        { "label": "HUNGRÍA", "title": "Orbán critica la centralización de Bruselas en vísperas de las elecciones.", "meta": "SESGO DE DERECHA" }
      ]
    },
    {
      "id": "us-elec",
      "label": "U.S.",
      "title": "ELECTIONS",
      "btn1": "MÁS DE EE.UU.",
      "btn2": "MENOS DE EE.UU.",
      "trend": "RUMBO A NOVIEMBRE 2024",
      "main": {
        "label": "DEBATE PRESIDENCIAL — ANÁLISIS",
        "title": "Trump y Biden empatados en los estados clave según los últimos sondeos",
        "desc": "La economía y la política migratoria se consolidan como los dos ejes principales que decidirán el voto en Pensilvania, Michigan y Wisconsin.",
        "legendLeft": "SESGO: BIPARTIDISTA ESTATAL",
        "legendRight": "245 FUENTES ANALIZADAS",
        "barType": "bipartisan"
      },
      "sides": [
        { "label": "CORTE SUPREMA", "title": "Fallo histórico sobre la inmunidad presidencial genera debate jurídico.", "meta": "COBERTURA LEGAL" },
        { "label": "ECONOMÍA", "title": "La inflación en EE.UU. cae más de lo esperado: ¿respiro para Biden?", "meta": "ANÁLISIS FINANCIERO" },
        { "label": "CAMPAÑA RNC", "title": "Trump consolida su apoyo entre los votantes latinos en Florida.", "meta": "PUNTO CIEGO DE IZQUIERDA" }
      ]
    },
    {
      "id": "cli-cri",
      "label": "CLIMATE",
      "title": "CRISIS",
      "btn1": "MÁS CLIMA",
      "btn2": "MENOS CLIMA",
      "trend": "EMERGENCIA GLOBAL",
      "main": {
        "label": "INFORME IPCC — CIENCIA",
        "title": "Abril rompe récords como el mes más caluroso de la historia mundial",
        "desc": "Los niveles de CO2 en la atmósfera alcanzan un nuevo máximo, acelerando el deshielo en los polos y la frecuencia de eventos climáticos extremos.",
        "legendLeft": "ALTO CONSENSO CIENTÍFICO",
        "legendRight": "512 ESTUDIOS REVISADOS",
        "barType": "grayscale"
      },
      "sides": [
        { "label": "OCEANOGRAFÍA", "title": "Blanqueamiento masivo del coral en la Gran Barrera: alerta roja.", "meta": "COBERTURA AMBIENTAL" },
        { "label": "RENOVABLES", "title": "La energía solar supera al carbón en la red eléctrica de EE.UU.", "meta": "PUNTO CIEGO DE DERECHA" },
        { "label": "LEGISLACIÓN", "title": "Nuevas tasas al carbono: el debate sobre el impacto en los precios.", "meta": "PERSPECTIVA ECONÓMICA" }
      ]
    }
  ]'::jsonb,
  footer_links = '{
    "col1": {
      "title": "Noticias",
      "links": [
        {"label": "Página de inicio", "url": "/"},
        {"label": "Noticias locales", "url": "/?city=locales"},
        {"label": "Feed Blindspot", "url": "/bias"},
        {"label": "Internacional", "url": "/?cat=INTERNACIONAL"}
      ]
    },
    "col2": {
      "title": "Internacional",
      "links": [
        {"label": "América del Norte", "url": "/?cat=INTERNACIONAL"},
        {"label": "América del Sur", "url": "/?cat=INTERNACIONAL"},
        {"label": "Europa", "url": "/?cat=INTERNACIONAL"},
        {"label": "Asia", "url": "/?cat=INTERNACIONAL"},
        {"label": "África", "url": "/?cat=INTERNACIONAL"}
      ]
    },
    "col3": {
      "title": "Tendencia Int.",
      "links": [
        {"label": "Coachella", "url": "/"},
        {"label": "WNBA", "url": "/"},
        {"label": "Papa Francisco", "url": "/"},
        {"label": "IA Generativa", "url": "/"},
        {"label": "Guerra en Gaza", "url": "/"}
      ]
    },
    "col4": {
      "title": "Tendencia EE.UU.",
      "links": [
        {"label": "WNBA", "url": "/"},
        {"label": "Baseball", "url": "/"},
        {"label": "Donald Trump", "url": "/"},
        {"label": "Joe Biden", "url": "/"},
        {"label": "NASA", "url": "/"}
      ]
    },
    "col5": {
      "title": "Tendencia U.K.",
      "links": [
        {"label": "Premier League", "url": "/"},
        {"label": "Arsenal FC", "url": "/"},
        {"label": "Manchester United", "url": "/"},
        {"label": "Brexit Update", "url": "/"},
        {"label": "Royal Family", "url": "/"}
      ]
    }
  }'::jsonb
where id = 'global_sidebar';
