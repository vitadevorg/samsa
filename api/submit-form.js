import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const generateEmailHtml = (data) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0B1120; color: #f8fafc; margin: 0; padding: 40px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
    .header { background-color: #1e3a8a; padding: 30px 40px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 5px 0 0; color: #93c5fd; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 40px; }
    .content h2 { color: #f8fafc; font-size: 20px; margin-top: 0; margin-bottom: 24px; border-bottom: 1px solid #1e293b; padding-bottom: 12px; }
    .field { margin-bottom: 20px; }
    .field-label { display: block; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .field-value { font-size: 16px; color: #e2e8f0; margin: 0; }
    .footer { background-color: #0B1120; padding: 20px 40px; text-align: center; border-top: 1px solid #1e293b; }
    .footer p { color: #475569; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Nueva Solicitud de Adhesión</h1>
      <p>SAMSA Admisiones</p>
    </div>
    <div class="content">
      <h2>Datos del Profesional</h2>
      
      <div class="field">
        <span class="field-label">Nombre Completo</span>
        <p class="field-value">${data.firstName} ${data.lastName}</p>
      </div>
      
      <div class="field">
        <span class="field-label">CUIT / CUIL</span>
        <p class="field-value">${data.cuit}</p>
      </div>
      
      <div class="field">
        <span class="field-label">Correo Electrónico</span>
        <p class="field-value">${data.email}</p>
      </div>
      
      <div class="field">
        <span class="field-label">Teléfono</span>
        <p class="field-value">${data.phone}</p>
      </div>
      
      <div class="field">
        <span class="field-label">Especialidad</span>
        <p class="field-value">${data.specialty}</p>
      </div>
      
      <div class="field">
        <span class="field-label">Nº de Matrícula</span>
        <p class="field-value">${data.licenseNumber}</p>
      </div>
      
      <div class="field">
        <span class="field-label">Tipo de Profesional</span>
        <p class="field-value" style="text-transform: capitalize;">${data.professionalType}</p>
      </div>
    </div>
    <div class="footer">
      <p>Este mensaje fue generado automáticamente desde el formulario web.</p>
    </div>
  </div>
</body>
</html>
`;

export default async function handler(req, res) {
  // CORS configuration for local testing, Vercel usually handles this or we allow origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = req.body;
    const attachments = [];
    
    // We expect profilePic and cv to be sent as base64 strings with their filenames
    if (data.profilePic && data.profilePic.base64) {
      attachments.push({
        filename: data.profilePic.filename,
        content: data.profilePic.base64,
      });
    }
    
    if (data.cv && data.cv.base64) {
      attachments.push({
        filename: data.cv.filename,
        content: data.cv.base64,
      });
    }

    const { data: emailData, error } = await resend.emails.send({
      from: 'SAMSA <onboarding@resend.dev>', // Update this in production
      to: ['vitadev.org@gmail.com'],
      subject: \`Nueva Solicitud: \${data.firstName} \${data.lastName}\`,
      html: generateEmailHtml(data),
      attachments: attachments,
    });

    if (error) {
      console.error("Resend Error:", error);
      return res.status(400).json({ success: false, error });
    }

    return res.status(200).json({ success: true, data: emailData });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
