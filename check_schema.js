import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ahwxiholwvxdmcehpeli.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFod3hpaG9sd3Z4ZG1jZWhwZWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyOTg4NTksImV4cCI6MjA5MTg3NDg1OX0.MSdICtCCrxNYEq8OSYYHNkiBFfob_OUn8l8rGtbHRSs';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Consultando columnas de la tabla stories...');
    // We can use a trick: select a non-existent column or just one row and check the keys
    const { data, error } = await supabase.from('stories').select('*').limit(1);
    
    if (error) {
        console.error('Error al consultar:', error);
    } else if (data && data.length > 0) {
        console.log('Columnas encontradas:', Object.keys(data[0]));
    } else {
        console.log('La tabla está vacía, no puedo determinar las columnas fácilmente mediante select.');
        // Try another way: RPC if available or just assume we need to add them.
    }
}

checkSchema();
