import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Los datos llegan del formulario público: se escapan antes de armar el HTML del mail.
const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const list = (items) => (Array.isArray(items) && items.length ? items.join(', ') : '');

const KIND_LABELS = { clinic: 'Clínica', hospital: 'Hospital' };

// Secciones del mail según el tipo de solicitud: [título, [[etiqueta, valor], ...]].
const sectionsFor = (data) => {
  if (data.applicantType === 'institution') {
    return [
      ['Datos de la institución', [
        ['Tipo', KIND_LABELS[data.institutionKind] ?? data.institutionKind],
        ['Nombre', data.name],
        ['Razón social', data.legalName],
        ['Código REFES', data.refes],
        ['CUIT', data.cuit],
        ['Inscripta en ARCA', data.arcaVerified ? 'Sí (declarado)' : 'No'],
      ]],
      ['Contacto y servicios', [
        ['Dirección', data.address],
        ['Teléfono', data.phone],
        ['Email de contacto', data.email],
        ...(data.institutionKind === 'hospital' ? [] : [['Obras sociales', list(data.insurances) || 'Solo atención particular']]),
        ['Estudios', list(data.studies) || 'Sin estudios cargados'],
      ]],
      ['Administrador', [
        ['Nombre', data.admin?.name],
        ['Email (usuario)', data.admin?.email],
        ['Teléfono', data.admin?.phone || 'No informado'],
      ]],
    ];
  }
  return [
    ['Datos personales', [
      ['Nombre completo', `${data.firstName ?? ''} ${data.lastName ?? ''}`],
      ['CUIT / CUIL', data.cuit],
      ['DNI', data.dni],
      ['Correo electrónico', data.email],
      ['Teléfono', data.phone],
    ]],
    ['Datos profesionales', [
      ['Especialidad', data.specialty],
      ['Nº de matrícula', data.licenseNumber],
      ['Dirección del consultorio', data.address],
      ['Días de atención', list(data.days)],
      ['Horario', data.startTime && data.endTime ? `${data.startTime} a ${data.endTime}` : ''],
      ['Obras sociales', list(data.insurances) || 'Solo particular'],
    ]],
    ['Documentación adjunta', (data.attachments ?? []).map((file) => [
      file.label,
      `${file.filename}${file.expiresAt ? ` (vence ${file.expiresAt})` : ''}`,
    ])],
  ];
};

const titleFor = (data) => (data.applicantType === 'institution'
  ? `${KIND_LABELS[data.institutionKind] ?? 'Institución'}: ${data.name ?? ''}`
  : `Médico particular: ${data.firstName ?? ''} ${data.lastName ?? ''}`);

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
    .content h2 { color: #f8fafc; font-size: 18px; margin: 32px 0 20px; border-bottom: 1px solid #1e293b; padding-bottom: 12px; }
    .content h2:first-child { margin-top: 0; }
    .field { margin-bottom: 16px; }
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
      <p>${escapeHtml(titleFor(data))}</p>
    </div>
    <div class="content">
      ${sectionsFor(data).map(([title, rows]) => `
      <h2>${escapeHtml(title)}</h2>
      ${rows.map(([label, value]) => `
      <div class="field">
        <span class="field-label">${escapeHtml(label)}</span>
        <p class="field-value">${escapeHtml(value || '—')}</p>
      </div>`).join('')}`).join('')}
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
    const data = req.body ?? {};
    if (!['doctor', 'institution'].includes(data.applicantType)) {
      return res.status(400).json({ success: false, error: 'Tipo de solicitud inválido.' });
    }

    // Documentación adjunta (base64): cada archivo con su etiqueta delante del nombre.
    const attachments = (data.attachments ?? [])
      .filter((file) => file?.base64 && file?.filename)
      .map((file) => ({ filename: `${file.label} - ${file.filename}`, content: file.base64 }));

    const { data: emailData, error } = await resend.emails.send({
      from: 'SAMSA <onboarding@resend.dev>', // Update this in production
      to: ['vitadev.org@gmail.com'],
      subject: `Nueva solicitud de adhesión · ${titleFor(data)}`,
      html: generateEmailHtml(data),
      attachments,
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
