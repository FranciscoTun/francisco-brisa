// ═══════════════════════════════════════════════════
//  EDITA AQUÍ LOS DATOS DE LA BODA
// ═══════════════════════════════════════════════════
export const WEDDING = {
  him: 'Francisco',
  her: 'Brisa',

  // Fecha y hora de la boda (formato ISO)
  dateISO: '2026-12-12T16:00:00',

  ceremony: {
    place: 'Registro Civil del Centro',
    address: 'Centro',
    time: '4:00 PM',
    mapsUrl: 'https://maps.app.goo.gl/kyTAGWBhPiczPbLt8',
  },

  reception: {
    place: 'Salón Backtun',
    address: 'Dirección por confirmar',
    time: '7:00 PM',
    mapsUrl: 'https://maps.app.goo.gl/R7REQrX18cWiroNKA',
  },

  dressCode: {
    label: 'Formal',
    hint: 'Este es un estilo sugerido',
    ellas: 'Vestido largo o cóctel',
    ellos: 'Ropa formal',
    reserved: [
      ['Blanco', '#ffffff'],
      ['Marfil', '#efe8d8'],
      ['Verde oliva', '#5c5c3d'],
    ],
    pinterestUrl: '', // opcional: enlace a un tablero de Pinterest
  },

  // Sección de regalos
  gifts: {
    teaser: 'Si quieres darnos algo más que tu hermosa presencia…',
    intro:
      'Tu presencia es nuestro mejor regalo. Si además deseas tener un detalle con nosotros, te dejamos algunas opciones:',
    envelopeText:
      'El día de la boda habrá un cofre en la recepción para tus sobres.',
    bank: 'Nombre del banco',
    holder: 'Titular de la cuenta',
    methods: [
      { label: 'CLABE', value: '000 000 00000000000 0' },
      { label: 'Tarjeta', value: '0000 0000 0000 0000' },
    ],
  },

  // Notas que se muestran en la sección "Tips y notas"
  tips: [
    {
      title: 'Llega con tiempo',
      text: 'La ceremonia empieza puntual. Te recomendamos llegar 20 minutos antes.',
    },
    {
      title: 'Confirma tu asistencia',
      text: 'Avísanos lo antes posible para preparar todo con cariño.',
    },
    {
      title: 'Celebración para adultos',
      text: 'Queremos que disfrutes la noche sin preocupaciones: la fiesta será solo para adultos.',
    },
    {
      title: 'A bailar',
      text: 'Olvídate de todo y ven con ganas de bailar hasta el final.',
    },
  ],

  // Número de WhatsApp para confirmar asistencia (con código de país, sin +)
  whatsapp: '521234567890',

  // Link directo al álbum compartido (Google Photos)
  albumUrl: 'https://photos.app.goo.gl/ESm9NKEGbPLG1Lny7',
}
