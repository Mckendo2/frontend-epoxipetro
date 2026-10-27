/**
 * Datos comerciales de la landing page.
 *
 * Todo lo que se debe reemplazar por información real está en este archivo.
 * Los valores marcados con  // EJEMPLO  son contenido provisional:
 * cámbialos antes de publicar.
 */

export const siteConfig = {
  brand: {
    name: 'Alvarez',
    descriptor: 'Ferretería',
    fullName: 'Alvarez Ferretería',
  },

  contact: {
    // Número tomado del catálogo público (CatalogoPublicoPage.jsx).
    // Formato internacional sin "+" ni espacios, como lo pide wa.me.
    whatsapp: '59165555942',
    whatsappDisplay: '+591 655 55942',
    phone: '', // Teléfono fijo opcional. Si queda vacío no se muestra.
    email: '', // Correo opcional. Si queda vacío no se muestra.
    address: 'Dirección de ejemplo 123, Bolivia', // EJEMPLO
    mapsUrl: '', // Enlace de Google Maps opcional.
    hours: [
      // EJEMPLO
      { days: 'Lunes a viernes', time: '8:30 a 19:00' },
      { days: 'Sábado', time: '8:30 a 13:00' },
    ],
  },

  // Solo se muestran las redes que tengan una URL.
  social: [
    { id: 'facebook', label: 'Facebook', url: '' }, // EJEMPLO: agrega la URL
    { id: 'instagram', label: 'Instagram', url: '' }, // EJEMPLO: agrega la URL
    { id: 'tiktok', label: 'TikTok', url: '' }, // EJEMPLO: agrega la URL
  ],

  // Destinos de los botones de conversión.
  links: {
    catalog: '/catalogo', // Ruta pública que ya existe en la app.
    quote: '#cotizar', // Formulario de cotización de esta página.
    staffLogin: '/login',
  },

  // Marcas registradas en la base de datos de la tienda. Verifica que sigan vigentes.
  brands: ['Yale', 'Cisa', 'Master Lock', 'Petro', 'Ultra'],

  // Texto inicial del mensaje cuando el cliente escribe directo por WhatsApp.
  whatsappGreeting: 'Hola, vengo de la página web de Alvarez Ferretería y quiero hacer una consulta.',
};
