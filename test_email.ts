import { sendEmail } from './src/utils/brevo';
import { POST } from './src/app/api/contacto/route';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function runTests() {
  console.log('Testing 1: sendEmail (brevo.ts)');
  const res1 = await sendEmail({
    to: 'impaktoagency@gmail.com', // Simulate a client
    name: 'Cliente de Prueba',
    subject: 'Test brevo.ts email',
    htmlContent: '<p>Este es un email de prueba desde brevo.ts. Debería llegar una copia oculta.</p>'
  });
  console.log('Result 1:', res1);

  console.log('\nTesting 2: Contact Form (route.ts)');
  const mockRequest = {
    json: async () => ({
      nombre: 'Prueba Contacto',
      empresa: 'Empresa Test',
      email: 'cliente@test.com',
      tipoProyecto: 'Web Development',
      situacion: 'Test',
      objetivo: 'Test objective'
    })
  } as unknown as Request;

  const res2 = await POST(mockRequest);
  console.log('Result 2:', res2.status, await res2.json());
}

runTests().catch(console.error);
