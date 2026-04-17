import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ahwxiholwvxdmcehpeli.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFod3hpaG9sd3Z4ZG1jZWhwZWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyOTg4NTksImV4cCI6MjA5MTg3NDg1OX0.MSdICtCCrxNYEq8OSYYHNkiBFfob_OUn8l8rGtbHRSs';
const supabase = createClient(supabaseUrl, supabaseKey);

async function list() {
    const { data } = await supabase.from('stories').select('id, title');
    console.log(JSON.stringify(data, null, 2));
}
list();
