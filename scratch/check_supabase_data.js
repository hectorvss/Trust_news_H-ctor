
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data: stories, error } = await supabase.from('stories').select('id, title, full_content, articles');
  if (error) {
    console.error("Error fetching stories:", error);
    return;
  }
  console.log(`Found ${stories.length} stories in DB.`);
  stories.forEach(s => {
    console.log(`ID: ${s.id} | Title: ${s.title}`);
    console.log(`Content exists: ${!!s.full_content} | Articles count: ${Array.isArray(s.articles) ? s.articles.length : 0}`);
    console.log('---');
  });
}

checkData();
