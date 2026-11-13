// Textos legales por pantalla. Cada documento tiene Términos y Condiciones + Política de Privacidad.
// Borrador sujeto a revisión legal antes de publicar: cada afirmación debe reflejar lo que SAMSA realmente hace.

export const LEGAL_CONTACT_EMAIL = 'vitadev.org@gmail.com';
const UPDATED_AT = '13 de noviembre de 2026';

const COMMON_USE = 'El servicio está destinado a mayores de 18 años, o a menores con autorización de su madre, padre o tutor. Si sacás un turno para otra persona, declarás tener derecho a hacerlo y a compartir sus datos con ese fin.';
const COMMON_SCOPE = 'SAMSA es una herramienta de gestión de turnos. No brinda atención médica, diagnóstico ni tratamiento: eso es responsabilidad exclusiva de cada profesional. La reserva de un turno no reemplaza la consulta médica. Ante una urgencia, comunicate con los servicios de emergencia.';
const COMMON_LIABILITY = 'SAMSA procura que el servicio funcione de forma continua, pero no garantiza la ausencia de interrupciones o errores. En la medida permitida por la ley, no responde por daños derivados de interrupciones ajenas a su control ni por datos incorrectos que hayas cargado.';
const COMMON_LAW = 'Estos Términos se rigen por las leyes de la República Argentina. Para cualquier conflicto serán competentes los tribunales ordinarios de la Provincia de Tucumán. Si sos consumidor, conservás los derechos que te reconoce la Ley 24.240 de Defensa del Consumidor, incluida la posibilidad de elegir la jurisdicción de tu domicilio.';
const COMMON_IP = 'La plataforma, su diseño, marcas y contenidos pertenecen a SAMSA o a sus licenciantes. No podés copiarlos ni explotarlos sin autorización escrita.';
const COMMON_ACCEPTABLE = 'Está prohibido reservar turnos de forma masiva o automatizada, suplantar identidades, intentar acceder a datos de otras personas, interferir con el funcionamiento de la plataforma o usarla para fines ilícitos.';
const COMMON_CHANGES = 'Podemos actualizar estos Términos. Si los cambios son importantes, te avisamos antes de que entren en vigencia. La versión vigente es la publicada en esta página, con su fecha de actualización.';
const COMMON_SHARING = 'No vendemos tus datos. Solo los compartimos con quienes los necesitan para prestarte el servicio: proveedores técnicos que nos asisten en el funcionamiento de la plataforma, bajo obligaciones de confidencialidad; el profesional o la institución con quien reservás, solo lo necesario para atenderte; y autoridades públicas cuando una norma o una orden judicial lo exija.';
const COMMON_TRANSFER = 'Si en el futuro utilizamos proveedores que almacenen datos fuera de la Argentina, exigiremos garantías adecuadas de protección conforme a la normativa vigente.';
const COMMON_SECURITY = 'Aplicamos medidas técnicas y organizativas razonables para proteger tus datos contra accesos no autorizados, pérdida o alteración. Ningún sistema es infalible: si ocurre un incidente de seguridad que te afecte, te lo vamos a comunicar conforme a la ley.';
const COMMON_STORAGE = 'Usamos el almacenamiento del navegador estrictamente necesario para mantener tu sesión y para el funcionamiento de la reserva de turnos. No lo usamos con fines publicitarios.';
const COMMON_MINORS = 'El servicio no está dirigido a menores de 18 años sin autorización de su representante legal. Si detectamos datos de un menor cargados sin esa autorización, los eliminamos.';
const COMMON_POLICY_CHANGES = 'Podemos modificar esta política. Publicaremos la versión vigente con su fecha de actualización y, si el cambio es relevante, te lo notificaremos.';
const RIGHTS_BASE = 'Podés ejercer en cualquier momento los derechos de acceso, rectificación, actualización y supresión de tus datos.';
const RIGHTS_DEADLINES = 'Respondemos dentro de los plazos legales: 10 días corridos para el acceso y 5 días hábiles para la rectificación, actualización o supresión. El acceso es gratuito a intervalos no inferiores a seis meses, salvo que acredites un interés legítimo.';
const AAIP = 'La Agencia de Acceso a la Información Pública (AAIP), como órgano de control de la Ley 25.326 de Protección de Datos Personales, tiene la atribución de atender las denuncias y reclamos de quienes se vean afectados en sus derechos por el incumplimiento de las normas de protección de datos personales.';

export const LEGAL_DOCS = {
    registro: {
        title: 'Registro de cuenta',
        subtitle: 'Condiciones de uso y tratamiento de tus datos al crear tu cuenta en SAMSA.',
        updatedAt: UPDATED_AT,
        checkbox: { lead: 'He leído y acepto' },
        terms: [
            { title: 'Quiénes somos y qué aceptás', text: 'S.A.M.S.A. ("SAMSA") ofrece una plataforma para solicitar y gestionar turnos médicos. Al crear tu cuenta declarás haber leído y aceptado estos Términos y la Política de Privacidad. Si no estás de acuerdo, no uses el servicio.' },
            { title: 'Quiénes pueden usar el servicio', text: COMMON_USE },
            { title: 'Tu cuenta', text: ['Con tu cuenta podés solicitar y gestionar turnos, ver tu historial y guardar tus datos y tu cobertura para futuras reservas.', 'Sos responsable de la confidencialidad de tu contraseña y de toda la actividad realizada desde tu cuenta. Si sospechás un uso no autorizado, avisanos a la brevedad.'] },
            { title: 'Veracidad de los datos', text: 'Te comprometés a dar datos reales, completos y actualizados, incluidos los de tu obra social, plan y número de afiliado. SAMSA puede cancelar turnos o suspender cuentas si detecta datos falsos o un uso indebido.' },
            { title: 'Turnos: reserva, cambios y cancelaciones', text: ['Un turno queda confirmado cuando recibís la confirmación por correo electrónico.', 'Podés cancelar o reprogramar hasta 24 horas antes del horario.', 'SAMSA o el profesional pueden reprogramar o cancelar un turno por causas operativas o de fuerza mayor, y te avisan a la brevedad.'] },
            { title: 'Alcance del servicio', text: COMMON_SCOPE },
            { title: 'Uso aceptable', text: COMMON_ACCEPTABLE },
            { title: 'Comunicaciones', text: 'Te enviamos mensajes relacionados con el servicio, como confirmaciones, recordatorios y cambios en tus turnos.' },
            { title: 'Propiedad intelectual', text: COMMON_IP },
            { title: 'Responsabilidad', text: COMMON_LIABILITY },
            { title: 'Baja de la cuenta', text: `Podés eliminar tu cuenta cuando quieras escribiendo a ${LEGAL_CONTACT_EMAIL}. SAMSA puede suspender o cerrar cuentas que incumplan estos Términos.` },
            { title: 'Cambios en los Términos', text: COMMON_CHANGES },
            { title: 'Ley aplicable y jurisdicción', text: COMMON_LAW },
        ],
        privacy: [
            { title: 'Responsable del tratamiento', text: `SAMSA es responsable de la base de datos donde se almacenan tus datos. Contacto: ${LEGAL_CONTACT_EMAIL}.` },
            { title: 'Qué datos recopilamos', text: ['Identificación y contacto: nombre y apellido, DNI, CUIL (opcional), fecha de nacimiento, correo electrónico y teléfono.', 'Cuenta: tu contraseña.', 'Cobertura: obra social, plan, número de afiliado y condición de titular o adherente (con los datos del titular, si sos adherente).', 'Uso del servicio: historial de turnos.', 'Los datos de salud y de cobertura son datos sensibles. Solo los tratamos con tu consentimiento expreso y para la prestación del servicio que solicitás.'] },
            { title: 'Para qué usamos tus datos', text: ['Crear y administrar tu cuenta.', 'Reservar, confirmar, recordar, modificar y cancelar turnos.', 'Informar tu cobertura al profesional o a la institución.', 'Comunicarnos con vos sobre tus turnos o tu cuenta.', 'Cumplir obligaciones legales.'] },
            { title: 'Base del tratamiento y consentimiento', text: `Tratamos tus datos con tu consentimiento libre, expreso e informado, que das al aceptar esta política, y porque son necesarios para prestarte el servicio que pedís. Podés retirar tu consentimiento en cualquier momento escribiendo a ${LEGAL_CONTACT_EMAIL}, lo que puede impedirte seguir usando el servicio.` },
            { title: 'Con quién compartimos tus datos', text: [COMMON_SHARING, COMMON_TRANSFER] },
            { title: 'Cuánto tiempo conservamos tus datos', text: [
                'Cuenta: mientras esté activa. Al darla de baja, eliminamos o anonimizamos tus datos dentro de los 30 días, salvo los que debamos conservar por ley.',
                'Registros técnicos de seguridad: 6 meses.',
                'Datos de facturación (si corresponde): 10 años, por obligaciones legales y contables.',
                'La historia clínica que lleve cada profesional o institución se rige por su propia normativa (Ley 26.529) y sus plazos de conservación.',
            ] },
            { title: 'Seguridad', text: COMMON_SECURITY },
            { title: 'Tus derechos', text: [`${RIGHTS_BASE} Escribinos a ${LEGAL_CONTACT_EMAIL} con tu nombre y un medio de contacto.`, RIGHTS_DEADLINES, 'También podés retirar tu consentimiento y eliminar tu cuenta.', AAIP] },
            { title: 'Almacenamiento del navegador', text: COMMON_STORAGE },
            { title: 'Menores de edad', text: COMMON_MINORS },
            { title: 'Cambios en esta política', text: COMMON_POLICY_CHANGES },
        ],
    },

    'turno-invitado': {
        title: 'Turno sin registro',
        subtitle: 'Condiciones de uso y tratamiento de tus datos al solicitar un turno como invitado/a.',
        updatedAt: UPDATED_AT,
        checkbox: { lead: 'Acepto' },
        terms: [
            { title: 'Quiénes somos y qué aceptás', text: 'S.A.M.S.A. ("SAMSA") ofrece una plataforma para solicitar turnos médicos. Al solicitar un turno sin registrarte declarás haber leído y aceptado estos Términos y la Política de Privacidad. Si no estás de acuerdo, no uses el servicio.' },
            { title: 'Quiénes pueden usar el servicio', text: COMMON_USE },
            { title: 'Turno como invitado/a', text: ['Solo te pedimos los datos necesarios para reservar el turno. No se crea una cuenta, un perfil ni un historial.', 'Para consultar o cancelar el turno vas a necesitar el código que te enviamos por correo electrónico.', 'Si querés guardar tus datos para futuras reservas, podés registrarte cuando quieras.'] },
            { title: 'Veracidad de los datos', text: 'Los datos que cargues, incluida tu cobertura (obra social, plan y número de afiliado), deben ser verídicos. Al confirmar el turno declarás que esos datos son verídicos y que vas a presentar tu credencial y tu DNI en la consulta. SAMSA puede cancelar turnos ante datos falsos o un uso indebido.' },
            { title: 'Turnos: reserva, cambios y cancelaciones', text: ['Un turno queda confirmado cuando recibís la confirmación por correo electrónico.', 'Podés cancelar o reprogramar hasta 24 horas antes del horario.', 'SAMSA o el profesional pueden reprogramar o cancelar un turno por causas operativas o de fuerza mayor, y te avisan a la brevedad.'] },
            { title: 'Alcance del servicio', text: COMMON_SCOPE },
            { title: 'Uso aceptable', text: COMMON_ACCEPTABLE },
            { title: 'Comunicaciones', text: 'Te enviamos mensajes relacionados con este turno, como la confirmación, recordatorios y cambios.' },
            { title: 'Propiedad intelectual', text: COMMON_IP },
            { title: 'Responsabilidad', text: COMMON_LIABILITY },
            { title: 'Cambios en los Términos', text: COMMON_CHANGES },
            { title: 'Ley aplicable y jurisdicción', text: COMMON_LAW },
        ],
        privacy: [
            { title: 'Responsable del tratamiento', text: `SAMSA es responsable de la base de datos donde se almacenan tus datos. Contacto: ${LEGAL_CONTACT_EMAIL}.` },
            { title: 'Qué datos recopilamos', text: ['Solo los necesarios para el turno: nombre completo, DNI, fecha de nacimiento y correo electrónico.', 'Cobertura: obra social, plan, número de afiliado y condición de titular o adherente (con los datos del titular, si sos adherente).', 'Los datos de cobertura y de salud son datos sensibles. Solo los tratamos con tu consentimiento expreso y para gestionar este turno.'] },
            { title: 'Para qué usamos tus datos', text: ['Reservar, confirmar, recordar, modificar y cancelar este turno.', 'Informar tu cobertura al profesional o a la institución.', 'Comunicarnos con vos sobre el turno.', 'Cumplir obligaciones legales.'] },
            { title: 'Base del tratamiento y consentimiento', text: `Tratamos tus datos con tu consentimiento libre, expreso e informado, que das al aceptar esta política, y porque son necesarios para gestionar el turno que pedís. Podés retirar tu consentimiento escribiendo a ${LEGAL_CONTACT_EMAIL}.` },
            { title: 'Con quién compartimos tus datos', text: [COMMON_SHARING, COMMON_TRANSFER] },
            { title: 'Cuánto tiempo conservamos tus datos', text: [
                'Datos del turno como invitado/a: 6 meses desde la fecha del turno, y luego los eliminamos o anonimizamos.',
                'Registros técnicos de seguridad: 6 meses.',
            ] },
            { title: 'Seguridad', text: COMMON_SECURITY },
            { title: 'Tus derechos', text: [`${RIGHTS_BASE} Escribinos a ${LEGAL_CONTACT_EMAIL} indicando el correo usado y el código del turno, para que podamos identificarlo.`, RIGHTS_DEADLINES, 'También podés retirar tu consentimiento y pedir la eliminación de los datos de tu turno.', AAIP] },
            { title: 'Almacenamiento del navegador', text: COMMON_STORAGE },
            { title: 'Menores de edad', text: COMMON_MINORS },
            { title: 'Cambios en esta política', text: COMMON_POLICY_CHANGES },
        ],
    },

    profesional: {
        title: 'Adhesión profesional',
        subtitle: 'Condiciones y tratamiento de tus datos al enviar la solicitud de adhesión a la red de profesionales.',
        updatedAt: UPDATED_AT,
        checkbox: { lead: 'He leído y acepto' },
        terms: [
            { title: 'Objeto', text: 'Estos Términos regulan el envío de la Solicitud de Adhesión a la red de profesionales de S.A.M.S.A. ("SAMSA") y la evaluación de tu perfil. Al enviar la solicitud declarás haber leído y aceptado estos Términos y la Política de Privacidad.' },
            { title: 'Evaluación de la solicitud', text: ['Enviar la solicitud no implica aprobación automática ni habilitación.', 'SAMSA evalúa tu perfil en un plazo estimado de 48 a 72 horas hábiles y puede aceptarlo, rechazarlo o pedirte información adicional.'] },
            { title: 'Veracidad y habilitación profesional', text: 'Declarás que tus datos, tu matrícula, tu CUIT/CUIL, tu CV y tu foto son verídicos y vigentes, y que estás habilitado/a para ejercer. SAMSA puede verificar esa información y rechazar la solicitud o dar de baja la adhesión ante datos falsos.' },
            { title: 'Documentación enviada', text: 'Tu foto de perfil y tu currículum son de tu titularidad. Los usamos para evaluar tu solicitud y, si te aprueban, para armar tu perfil profesional visible para los pacientes.' },
            { title: 'Responsabilidad profesional', text: 'SAMSA es una herramienta de gestión de turnos. La atención médica y sus consecuencias son responsabilidad exclusiva del profesional.' },
            { title: 'Contacto', text: 'Te contactamos por el correo electrónico y el teléfono que informás para comunicarte el resultado y los pasos siguientes.' },
            { title: 'Cambios en los Términos', text: COMMON_CHANGES },
            { title: 'Ley aplicable y jurisdicción', text: 'Estos Términos se rigen por las leyes de la República Argentina. Para cualquier conflicto serán competentes los tribunales ordinarios de la Provincia de Tucumán.' },
        ],
        privacy: [
            { title: 'Responsable del tratamiento', text: `SAMSA es responsable de la base de datos donde se almacenan tus datos. Contacto: ${LEGAL_CONTACT_EMAIL}.` },
            { title: 'Qué datos recopilamos', text: ['Identificación y contacto: nombre y apellido, CUIT/CUIL (de donde se obtiene tu DNI), correo electrónico y teléfono celular.', 'Datos profesionales: especialidad, número de matrícula y tipo de profesional (particular, clínica u hospital).', 'Documentación: foto de perfil y currículum vitae.'] },
            { title: 'Para qué usamos tus datos', text: ['Evaluar tu solicitud de adhesión y verificar tu matrícula.', 'Contactarte sobre el estado de la solicitud.', 'Si te aprueban, crear tu perfil profesional y mostrarlo a los pacientes.', 'Cumplir obligaciones legales.'] },
            { title: 'Base del tratamiento y consentimiento', text: `Tratamos tus datos con tu consentimiento libre, expreso e informado, que das al aceptar esta política, y porque son necesarios para evaluar tu solicitud. Podés retirar tu consentimiento escribiendo a ${LEGAL_CONTACT_EMAIL}, lo que implica que no podremos continuar con la evaluación.` },
            { title: 'Con quién compartimos tus datos', text: ['No vendemos tus datos. Solo los compartimos con proveedores técnicos que nos asisten en el funcionamiento de la plataforma, bajo obligaciones de confidencialidad; con colegios u organismos de matriculación, para verificar tu habilitación; y con autoridades públicas cuando una norma o una orden judicial lo exija.', 'Si te aprueban, los datos de tu perfil profesional serán visibles para los pacientes.', COMMON_TRANSFER] },
            { title: 'Cuánto tiempo conservamos tus datos', text: [
                'Si la solicitud se rechaza o no se completa: 6 meses, y luego eliminamos los datos.',
                'Si se aprueba: mientras dure la adhesión y 5 años después, salvo obligación legal.',
            ] },
            { title: 'Seguridad', text: COMMON_SECURITY },
            { title: 'Tus derechos', text: [`${RIGHTS_BASE} Escribinos a ${LEGAL_CONTACT_EMAIL} con tu nombre y un medio de contacto.`, RIGHTS_DEADLINES, 'También podés retirar tu consentimiento y pedir la eliminación de tu solicitud.', AAIP] },
            { title: 'Cambios en esta política', text: COMMON_POLICY_CHANGES },
        ],
    },
};
