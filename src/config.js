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

  // Número de WhatsApp para confirmar asistencia (con código de país, sin +)
  whatsapp: '521234567890',
}
