// Diagnóstico completo: compara acceso anon vs service_role
// Si hay diferencia, es RLS bloqueando al cliente frontend
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const anonClient = createClient(SUPABASE_URL, ANON_KEY);
const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);

async function diagnose() {
  console.log('\n========================================');
  console.log('  TNE - DIAGNÓSTICO DE VISIBILIDAD');
  console.log('========================================\n');

  // 1. Test con SERVICE_ROLE (bypassa RLS)
  console.log('► TEST 1: Con clave SERVICE_ROLE (sin RLS)...');
  const { data: adminData, error: adminError } = await adminClient
    .from('stories')
    .select('id, title, status, category')
    .limit(20);

  if (adminError) {
    console.error('  ✗ Error con service_role:', adminError.message);
  } else {
    console.log(`  ✓ SERVICE_ROLE ve ${adminData.length} stories:`);
    adminData.forEach(s => console.log(`    [${s.status}] [${s.category}] ${s.id}: ${s.title.substring(0, 60)}...`));
  }

  // 2. Test con ANON KEY (lo que usa el frontend)
  console.log('\n► TEST 2: Con clave ANON (como el frontend)...');
  const { data: anonData, error: anonError } = await anonClient
    .from('stories')
    .select('id, title, status, category')
    .limit(20);

  if (anonError) {
    console.error('  ✗ Error con anon key:', anonError.message);
    console.error('  → Esto confirma que RLS está bloqueando el acceso público.');
  } else if (!anonData || anonData.length === 0) {
    console.log('  ✗ ANON KEY ve 0 stories.');
    console.log('  → RLS activo sin política de lectura pública.');
    console.log('  → SOLUCIÓN: Ejecutar la política SQL que se genera al final.');
  } else {
    console.log(`  ✓ ANON KEY ve ${anonData.length} stories.`);
  }

  // 3. ¿Hay diferencia?
  const adminCount = adminData?.length || 0;
  const anonCount = anonData?.length || 0;

  console.log('\n========================================');
  if (adminCount > 0 && anonCount === 0) {
    console.log('  ⚠️  DIAGNÓSTICO: RLS ESTÁ BLOQUEANDO AL FRONTEND');
    console.log('\n  SOLUCIÓN - Ejecuta este SQL en Supabase:');
    console.log('  ─────────────────────────────────────────');
    console.log(`
  -- Habilitar lectura pública de stories (sin autenticación requerida)
  ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Public can read published stories" ON public.stories;
  CREATE POLICY "Public can read published stories"
    ON public.stories FOR SELECT
    USING (status = 'published');
    `);
  } else if (adminCount === anonCount && adminCount > 0) {
    console.log('  ✓ DIAGNÓSTICO: RLS no es el problema. Las stories son visibles.');
    console.log('  → Revisar el código del frontend para ver qué filtra los resultados.');
  } else if (adminCount === 0) {
    console.log('  ✗ DIAGNÓSTICO: No hay stories en la base de datos.');
    console.log('  → Necesitas ejecutar los seeds SQL en Supabase.');
  }
  console.log('========================================\n');
}

diagnose().catch(console.error);
