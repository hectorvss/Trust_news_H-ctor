
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function audit() {
  console.log("--- AUDITORÍA DE NOTICIAS ---");
  const { data, error } = await supabase
    .from('stories')
    .select('id, title, category, status, created_at');
  
  if (error) {
    console.error("Error al consultar Supabase:", error);
    return;
  }

  console.log(`Se han encontrado ${data.length} noticias en total.`);
  data.forEach(s => {
    console.log(`[ID: ${s.id}] [Status: ${s.status}] [Cat: ${s.category}] - ${s.title}`);
  });
  console.log("----------------------------");
}

audit();
