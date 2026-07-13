import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ahwxiholwvxdmcehpeli.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFod3hpaG9sd3Z4ZG1jZWhwZWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyOTg4NTksImV4cCI6MjA5MTg3NDg1OX0.MSdICtCCrxNYEq8OSYYHNkiBFfob_OUn8l8rGtbHRSs';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Iniciando siembra de datos de inteligencia en Supabase...');
    
    const stories = [
      {
        title: "El Gobierno de España aprueba una nueva ley de vivienda para limitar alquileres",
        category: "POLÍTICA",
        summary: "Se ha aprobado un marco regulatorio para las zonas tensionadas en las principales ciudades españolas, buscando frenar la escalada de precios mediante un índice de referencia y topes del 3% anual.",
        time_label: "hace 2 horas",
        location: "Madrid, España",
        source_count: 42,
        bias: { left: 45, center: 30, right: 25 },
        factuality: "Alta",
        image_url: "https://images.unsplash.com/photo-1582408921715-18e7806365c1?auto=format&fit=crop&q=80&w=800",
        full_content: "Contenido detallado sobre la ley de vivienda...",
        analytical_snippet: "Unanimidad total sobre la gravedad del problema de acceso, pero división irreconciliable sobre si el control de precios es la medicina o el veneno para el mercado.",
        consenso_narrativo: "Justicia social y blindaje del derecho al hogar | Análisis de la estabilidad del mercado y el impacto en la inflación general. | Inseguridad jurídica y riesgo de parálisis",
        cifras_clave: [
           { label: 'Límite de subida', value: '3.0% anual' },
           { label: 'Contratos afectados', value: '2,400,000' },
           { label: 'Vigencia inicial', value: '31 DIC 2024' },
           { label: 'Ahorro promedio', value: '142€/mes' }
        ],
        verificacion_info: "Los datos han sido extraídos directamente del RD-Ley publicado en el BOE y confirmados por el Ministerio de Vivienda y Agenda Urbana.",
        origen_info: ["Agencia EFE", "Reuters", "Europa Press", "Gabinete de Prensa Ministerial"],
        medios_analizados: ["EL PAÍS", "ABC", "EL MUNDO", "RTVE", "ELDIARIO.ES", "LA VANGUARDIA"],
        documentos_info: [{ name: "RD-LEY 12/2024.PDF" }, { name: "NOTA MINISTERIO.PDF" }],
        fact_check: "Congelación de precios en zonas declaradas de mercado tensionado.\nBonificaciones fiscales de hasta el 90% para propietarios que bajen la renta.\nConsideración de 'Gran Tenedor' a partir de 5 inmuebles.",
        blind_spot: "Eliminación por ley del cobro de honorarios de agencia al arrendatario.",
        protagonistas_info: {
           beneficiados: "Inquilinos en zonas urbanas de alta demanda; familias vulnerables.",
           afectados: "Grandes tenedores de vivienda; agencias de gestión inmobiliaria."
        },
        preguntas_info: ["¿Habrá un efecto rebote en los precios de venta?", "¿Cómo afectará a la inversión en rehabilitación?", "¿Se aplicará por igual en todas las CC.AA.?"],
        articles: [
          { source: "EL PAÍS", bias: "CENTER", title: "Análisis del equilibrio entre la protección del inquilino y los incentivos fiscales al dueño." },
          { source: "ABC", bias: "RIGHT", title: "Duras críticas por el ataque a la propiedad privada y el riesgo de escasez de oferta." }
        ]
      },
      {
        title: "Debate en el Congreso sobre la reforma de la Ley de Seguridad Ciudadana",
        category: "POLÍTICA",
        summary: "El pleno debate hoy las enmiendas a la conocida como 'Ley Mordaza', con especial atención a las devoluciones en caliente y el uso de material antidisturbios.",
        time_label: "hace 4 horas",
        location: "Congreso, Madrid",
        source_count: 38,
        bias: { left: 40, center: 20, right: 40 },
        factuality: "Media",
        image_url: "https://images.unsplash.com/photo-1589216532372-1c2a11f90d6a?auto=format&fit=crop&q=80&w=800",
        analytical_snippet: "Divergencia máxima (90% en polos) sobre el equilibrio entre seguridad y libertad. La cobertura se fractura entre la recuperación de derechos civiles (40%) y la supuesta desprotección policial (50%).",
        consenso_narrativo: "Recuperación de derechos civiles y eliminación de las devoluciones en caliente. | Debate técnico sobre el equilibrio entre la seguridad jurídica de los agentes y las garantías ciudadanas. | Alerta sobre la desprotección policial y el aumento de la inseguridad en las calles.",
        cifras_clave: [
           { label: 'Sanciones revisadas', value: '450,000' },
           { label: 'Agentes desplegados', value: '1,200' }
        ],
        verificacion_info: "Datos oficiales del Ministerio del Interior y del Defensor del Pueblo tras la auditoría del ejercicio 2023.",
        origen_info: ["Europa Press", "Agencia EFE", "Sindicatos Policiales"],
        medios_analizados: ["RTVE", "LA SEXTA", "ABC", "EL MUNDO", "LA RAZÓN"],
        documentos_info: [{ name: "REFORMA_ART_36.PDF" }],
        fact_check: "Eliminación de las faltas leves por insultos a la autoridad.\nProhibición de pelotas de goma en manifestaciones urbanas.",
        blind_spot: "Poca mención al coste operativo de las fuerzas de seguridad ante las nuevas restricciones de identificación.",
        protagonistas_info: {
           beneficiados: "Colectivos de activistas; periodistas; ciudadanos en manifestaciones.",
           afectados: "Unidades de intervención policial (UIP); mandos de seguridad del Estado."
        },
        preguntas_info: ["¿Se mantendrán las multas por faltas de respeto?", "¿Hay riesgo de aumento de la violencia callejera?"],
        articles: [
          { source: "RTVE", bias: "CENTER", title: "Claves de la reforma: lo que cambia para el ciudadano." },
          { source: "LA RAZÓN", bias: "RIGHT", title: "Las fuerzas de seguridad alertan de un riesgo extremo de indefensión." }
        ]
      }
    ];

    for (const story of stories) {
        // First check if it exists to avoid duplicates
        const { data: existing } = await supabase.from('stories').select('id').eq('title', story.title).single();
        
        if (existing) {
            console.log(`Actualizando: ${story.title}`);
            await supabase.from('stories').update(story).eq('id', existing.id);
        } else {
            console.log(`Insertando: ${story.title}`);
            await supabase.from('stories').insert(story);
        }
    }
    console.log('Siembra completada con éxito.');
}

seed();
