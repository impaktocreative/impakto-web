const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gqzjidmqehdvvbwerqfm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxemppZG1xZWhkdnZid2VycWZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY0MTkxNCwiZXhwIjoyMDkzMjE3OTE0fQ.dv_pb4LW1VCYJwu6kg6Bu1VZbbWrdwVvkq6EID89fzQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUser() {
  const email = 'impaktoagency@gmail.com';
  const password = 'impakto_admin_2026';

  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true
  });

  if (error) {
    if (error.message.includes('User already registered')) {
        console.log('✅ El usuario ya existe.');
    } else {
        console.error('❌ Error creando usuario:', error.message);
    }
  } else {
    console.log('✅ Usuario admin creado correctamente:', email);
    console.log('Contraseña provisoria:', password);
  }
}

createUser();
