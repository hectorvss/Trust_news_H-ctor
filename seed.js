import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ahwxiholwvxdmcehpeli.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFod3hpaG9sd3Z4ZG1jZWhwZWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyOTg4NTksImV4cCI6MjA5MTg3NDg1OX0.MSdICtCCrxNYEq8OSYYHNkiBFfob_OUn8l8rGtbHRSs';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateVivienda() {
    console.log('Buscando historias de vivienda...');
    const { data: stories, error: fetchError } = await supabase.from('stories').select('id, title').ilike('title', '%vivienda%');
    
    if (fetchError) {
        console.error('Error al buscar:', fetchError);
        return;
    }
    
    console.log('Encontradas historias:', stories);
    
    if (stories && stories.length > 0) {
        for (const story of stories) {
            console.log('Actualizando historia con ID:', story.id);
            
            const payload = {
                consenso_narrativo: 'Justicia social y blindaje del derecho al hogar | Análisis de la estabilidad del mercado y el impacto en la inflación general. | Inseguridad jurídica y riesgo de parálisis',
                analytical_snippet: 'Unanimidad total sobre la gravedad del problema de acceso, pero división irreconciliable sobre si el control de precios es la medicina o el veneno para el mercado.',
                cifras_clave: [
                    { label: 'Límite de subida', value: '3.0% anual' },
                    { label: 'Contratos afectados', value: '2,400,000' },
                    { label: 'Vigencia inicial', value: '31 DIC 2024' },
                    { label: 'Ahorro promedio', value: '142€/mes' }
                ],
                verificacion_info: 'Los datos han sido extraídos directamente del RD-Ley publicado en el BOE y confirmados por el Ministerio de Vivienda y Agenda Urbana.',
                origen_info: ["Agencia EFE", "Reuters", "Europa Press", "Gabinete de Prensa Ministerial"],
                medios_analizados: ["EL PAÍS", "ABC", "EL MUNDO", "RTVE", "ELDIARIO.ES", "LA VANGUARDIA"],
                documentos_info: [{ name: "RD-LEY 12/2024.PDF" }, { name: "NOTA MINISTERIO.PDF" }],
                fact_check: 'Eliminación del cobro de honorarios de agencia al arrendatario.\nProhibición de desahucios sin alternativa habitacional.\nCongelación de precios en zonas tensionadas.',
                blind_spot: 'Riesgo de desvío de capital inversor inmobiliario hacia Portugal o Grecia.\nAparición de un mercado paralelo de alquiler de temporada para esquivar la ley.',
                protagonistas_info: {
                    beneficiados: "Inquilinos en zonas urbanas de alta demanda; familias vulnerables.",
                    afectados: "Grandes tenedores de vivienda; agencias de gestión inmobiliaria."
                },
                preguntas_info: ["¿Habrá un efecto rebote en los precios de venta?", "¿Cómo afectará a la inversión en rehabilitación?", "¿Se aplicará por igual en todas las CC.AA.?"]
            };
            
            const { error: updateError } = await supabase.from('stories').update(payload).eq('id', story.id);
            if (updateError) {
                console.error('Error al actualizar:', updateError);
            } else {
                console.log('Historia actualizada correctamente.');
            }
        }
    } else {
        console.log('No se encontraron historias que contengan "vivienda" en el título.');
    }
}

updateVivienda();
