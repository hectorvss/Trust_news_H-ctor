
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function auditSections() {
  console.log("--- AUDITORÍA DE SECCIONES ESPECIALES ---");
  const { data, error } = await supabase
    .from('special_sections')
    .select('*');
  
  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log(`Encontradas ${data.length} secciones en la base de datos.`);
  data.forEach(s => {
    console.log(`[ID: ${s.id}] [Title: ${s.title}] Label: ${s.label}`);
    console.log("Main Story Link:", s.main?.story_id);
  });
  console.log("-----------------------------------------");
}

auditSections();
