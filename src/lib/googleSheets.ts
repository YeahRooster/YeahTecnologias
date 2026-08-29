import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Configuración de credenciales y scopes
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

// Variable global para cachear la conexión
let cachedDoc: GoogleSpreadsheet | null = null;
let lastConnectionTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export async function getDoc() {
  const now = Date.now();

  // Si tenemos conexión y es reciente (menos de 5 min), la usamos
  if (cachedDoc && (now - lastConnectionTime < CACHE_TTL)) {
    return cachedDoc;
  }

  console.log('🔄 Iniciando conexión con Google Sheets (Caché expirada o inexistente)...');

  if (!process.env.GOOGLE_SHEET_ID) {
    console.error('❌ Error: GOOGLE_SHEET_ID no definido');
    throw new Error('GOOGLE_SHEET_ID no está definido en las variables de entorno');
  }

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.error('❌ Error: Credenciales faltantes');
    throw new Error('Faltan las credenciales de la cuenta de servicio en las variables de entorno');
  }

  try {
    const jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: SCOPES,
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, jwt);

    console.log('🔄 Cargando info del documento...');
    await doc.loadInfo();
    console.log(`✅ Conexión exitosa: ${doc.title}`);

    cachedDoc = doc;
    lastConnectionTime = now;

    return doc;
  } catch (error) {
    console.error('❌ Error FATAL conectando con Google Sheets:', error);
    cachedDoc = null;
    lastConnectionTime = 0;
    throw error;
  }
}

// Interfaz para Producto
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  images: string[];
  category: string;
  cost?: number;
  percentage?: number;
  originalPrice?: number;
  tags?: string[];
}

// Interfaz para Usuario
export interface User {
  email: string;
  password: string;
  nombreCompleto: string;
  domicilio: string;
  telefono: string;
  cuitCuil: string;
  nombreLocal: string;
  localidad: string;
  fechaRegistro: string;
  habilitado: boolean;
}

// Interfaz para Pedido
export interface Order {
  idPedido: string;
  email: string;
  fecha: string;
  productos: string;
  cantidades: string;
  total: number;
  estado: string;
  estadoPago?: string;
}

// Obtener todos los productos
export async function getProducts(): Promise<Product[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle['Hoja 1'] || doc.sheetsByIndex[0];

  const rows = await sheet.getRows();

  const products: Product[] = [];

  rows.forEach((row, index) => {
    const name = row.get('Nombre');
    if (!name) return; // Saltar si no tiene nombre

    const rawImages = row.get('ImagenURL') || '';
    const images = rawImages.split(',').map((url: string) => url.trim()).filter(Boolean);
    const mainImage = images[0] || '';

    // Generar un ID único: Prioridad al ID de la hoja, luego slug de nombre, luego índice por si hay nombres repetidos
    const idFromSheet = row.get('ID');
    const fallbackId = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`;
    const id = idFromSheet ? idFromSheet.toString().trim() : fallbackId;

    products.push({
      id: id,
      name: name.toString(),
      description: (row.get('Descripcion') || '').toString(),
      price: parseFloat(row.get('Precio') || '0'),
      stock: parseInt(row.get('Stock') || '0'),
      image: mainImage,
      images: images,
      category: (row.get('Categoria') || '').toString(),
      cost: parseFloat(row.get('Costo') || '0'),
      originalPrice: parseFloat(
        row.get('PrecioOriginal') ||
        row.get('Precio Original') ||
        row.get('PrecioLista') ||
        row.get('Precio Lista') ||
        row.get('PrecioAnterior') ||
        '0'
      ),
      tags: (row.get('Etiquetas') || row.get('Tags') || '').split(',').map((t: string) => t.trim()).filter(Boolean),
    });
  });

  return products;
}

// Buscar usuario por email
export async function findUserByEmail(email: string): Promise<User | null> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle['Usuarios'];

  if (!sheet) return null;

  const rows = await sheet.getRows();
  const userRow = rows.find(row => row.get('Email')?.toLowerCase() === email.toLowerCase());

  if (!userRow) return null;

  return {
    email: userRow.get('Email') || '',
    password: userRow.get('Contraseña') || '',
    nombreCompleto: userRow.get('Nombre') || userRow.get('NombreCompleto') || '',
    domicilio: userRow.get('Domicilio') || '',
    telefono: userRow.get('Telefono') || '',
    cuitCuil: userRow.get('CUIT/CUIL') || userRow.get('CuitCuil') || '',
    nombreLocal: userRow.get('Nombre del local') || userRow.get('Nombre del Local') || userRow.get('NombreLocal') || '',
    localidad: userRow.get('Localidad') || '',
    fechaRegistro: userRow.get('Fecha de registro') || userRow.get('FechaRegistro') || '',
    habilitado: (userRow.get('Habilitado') || '').toLowerCase() === 'si',
  };
}

// Obtener todos los usuarios (para admin)
export async function getAllUsers(): Promise<User[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle['Usuarios'];
  if (!sheet) return [];

  const rows = await sheet.getRows();
  return rows.map(row => ({
    email: row.get('Email') || '',
    password: '',
    nombreCompleto: row.get('Nombre') || row.get('NombreCompleto') || '',
    domicilio: row.get('Domicilio') || '',
    telefono: row.get('Telefono') || '',
    cuitCuil: row.get('CUIT/CUIL') || row.get('CuitCuil') || '',
    nombreLocal: row.get('Nombre del local') || row.get('NombreLocal') || '',
    localidad: row.get('Localidad') || '',
    fechaRegistro: row.get('Fecha de registro') || '',
    habilitado: (row.get('Habilitado') || '').toLowerCase() === 'si',
  }));
}

// Habilitar/Deshabilitar usuario
export async function toggleUserStatus(email: string, enabled: boolean): Promise<boolean> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle['Usuarios'];
  if (!sheet) return false;

  const rows = await sheet.getRows();
  const userRow = rows.find(r => (r.get('Email') || '').toLowerCase() === email.toLowerCase());

  if (userRow) {
    userRow.set('Habilitado', enabled ? 'Si' : 'No');
    await userRow.save();
    return true;
  }
  return false;
}

// Registrar un nuevo usuario
export async function registerUser(userData: Omit<User, 'fechaRegistro'>): Promise<User> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle['Usuarios'];

  if (!sheet) {
    throw new Error('No se encontró la hoja de Usuarios');
  }

  const existingUser = await findUserByEmail(userData.email);
  if (existingUser) {
    throw new Error('El email ya está registrado');
  }

  const fechaRegistro = new Date().toLocaleDateString('es-AR');

  await sheet.addRow({
    'Email': userData.email,
    'Contraseña': userData.password,
    'Nombre': userData.nombreCompleto,
    'Fecha de registro': fechaRegistro,
    'Telefono': userData.telefono,
    'Domicilio': userData.domicilio,
    'Localidad': userData.localidad,
    'CUIT/CUIL': userData.cuitCuil,
    'Nombre del local': userData.nombreLocal,
    'Habilitado': 'No',
  });

  return { ...userData, fechaRegistro, habilitado: false };
}

// Actualizar datos del usuario
export async function updateUser(email: string, updates: Partial<User>): Promise<boolean> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle['Usuarios'];

  if (!sheet) return false;

  const rows = await sheet.getRows();
  const userRow = rows.find(row => row.get('Email')?.toLowerCase() === email.toLowerCase());

  if (!userRow) return false;

  if (updates.nombreCompleto) {
    userRow.set('Nombre', updates.nombreCompleto);
    if (userRow.get('NombreCompleto') !== undefined) {
      userRow.set('NombreCompleto', updates.nombreCompleto);
    }
  }
  if (updates.domicilio) userRow.set('Domicilio', updates.domicilio);
  if (updates.telefono) userRow.set('Telefono', updates.telefono);
  if (updates.cuitCuil) {
    userRow.set('CUIT/CUIL', updates.cuitCuil);
    if (userRow.get('CuitCuil') !== undefined) {
      userRow.set('CuitCuil', updates.cuitCuil);
    }
  }
  if (updates.nombreLocal) {
    const possibleColumns = ['NombreLocal', 'Nombre del local', 'Nombre del Local'];
    let updated = false;
    for (const colName of possibleColumns) {
      try {
        userRow.set(colName, updates.nombreLocal);
        updated = true;
        console.log(`✅ Actualizado NombreLocal en columna: ${colName}`);
      } catch (e) {
      }
    }
    if (!updated) {
      console.warn('⚠️ No se pudo encontrar la columna para NombreLocal');
    }
  }
  if (updates.localidad) userRow.set('Localidad', updates.localidad);
  if (updates.password) userRow.set('Contraseña', updates.password);

  await userRow.save();
  return true;
}

// Obtener pedidos de un usuario
export async function getUserOrders(email: string): Promise<Order[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle['Pedidos'];

  if (!sheet) return [];

  const rows = await sheet.getRows();
  const userOrders = rows.filter(row => row.get('Email')?.toLowerCase() === email.toLowerCase());

  return userOrders.map(row => ({
    idPedido: row.get('ID de pedido') || '',
    email: row.get('Email') || '',
    fecha: row.get('Fecha') || '',
    productos: row.get('Productos') || '',
    cantidades: row.get('Cantidades') || '',
    total: parseFloat(row.get('Total') || '0'),
    estado: row.get('Estado') || 'Pendiente',
    estadoPago: row.get('EstadoPago') || row.get('Estado Pago') || row.get('Pago') || row.get('Estado de Pago') || 'Pendiente',
  }));
}

// Obtener TODOS los pedidos (para admin)
export async function getAllOrders(): Promise<Order[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle['Pedidos'];

  if (!sheet) return [];

  const rows = await sheet.getRows();

  return rows.map(row => ({
    idPedido: row.get('ID de pedido') || '',
    email: row.get('Email') || '',
    fecha: row.get('Fecha') || '',
    productos: row.get('Productos') || '',
    cantidades: row.get('Cantidades') || '',
    total: parseFloat(row.get('Total') || '0'),
    estado: row.get('Estado') || 'Pendiente',
    tipo: row.get('Tipo') || 'Remito',
  }));
}

// Crear un nuevo pedido
export async function createOrder(order: {
  email: string;
  products: { id: string; name: string; quantity: number; price: number }[];
  total: number;
  tipo?: string; // Remito, Presupuesto, Nota de Crédito
}): Promise<string> {
  const doc = await getDoc();
  const ordersSheet = doc.sheetsByTitle['Pedidos'];

  if (!ordersSheet) {
    throw new Error('No se encontró la hoja de Pedidos');
  }

  const orderId = `PED-${Date.now()}`;
  const fecha = new Date().toLocaleDateString('es-AR');

  const itemsDetalle = order.products.map(p => `${p.name} (x${p.quantity})`).join('; ');

  await ordersSheet.addRow({
    'ID de pedido': orderId,
    'Email': order.email,
    'Fecha': fecha,
    'Productos': itemsDetalle,
    'Cantidades': '',
    'Total': order.total.toString(),
    'Estado': 'Pendiente',
    'Tipo': order.tipo || 'Remito',
  });

  // Descontar stock (Solo si es Remito o Nota de Crédito)
  // Presupuesto no toca stock.
  if (order.tipo === 'Presupuesto') return orderId;
  const productsSheet = doc.sheetsByTitle['Hoja 1'] || doc.sheetsByIndex[0];
  const productRows = await productsSheet.getRows();

  for (const item of order.products) {
    let productRow = productRows.find(row => row.get('ID') === item.id);
    if (!productRow) {
      productRow = productRows.find(row => row.get('Nombre') === item.name);
    }

    if (productRow) {
      const currentStock = parseInt(productRow.get('Stock') || '0');
      let newStock = currentStock;

      if (!order.tipo || order.tipo === 'Remito' || order.tipo === 'remito') {
        newStock = Math.max(0, currentStock - item.quantity);
      } else if (order.tipo === 'Nota de Crédito' || order.tipo === 'nota_credito') {
        newStock = currentStock + item.quantity;
      }

      productRow.set('Stock', newStock.toString());
      await productRow.save();
    }
  }

  return orderId;
}

// Actualizar estado de un pedido
export async function updateOrderStatus(orderId: string, newStatus: string): Promise<{ success: boolean; email?: string; customerName?: string }> {
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Pedidos'];
    if (!sheet) return { success: false };

    const rows = await sheet.getRows();
    const orderRow = rows.find(row => row.get('ID de pedido') === orderId);

    if (!orderRow) return { success: false };

    // Actualizar estado con robustez
    try {
      orderRow.set('Estado', newStatus);
    } catch (e) {
      // Fallback si la columna se llama 'estado'
      orderRow.set('estado', newStatus);
    }

    await orderRow.save();

    // IMPORTANTE: Limpiar la caché para que la próxima lectura traiga el cambio real
    cachedDoc = null;
    lastConnectionTime = 0;

    // Obtener datos para el email
    const email = orderRow.get('Email');
    let customerName = 'Cliente';

    // Intentar buscar el nombre del cliente
    try {
      if (email) {
        const user = await findUserByEmail(email);
        if (user) customerName = user.nombreCompleto;
      }
    } catch (e) {
      console.warn('No se pudo obtener nombre del usuario para el email:', email);
    }

    return { success: true, email, customerName };
  } catch (error) {
    console.error("Error actualizando estado del pedido:", error);
    return { success: false };
  }
}

// Crear alerta de stock
export async function createStockAlert(email: string, productName: string): Promise<boolean> {
  const doc = await getDoc();
  let alertsSheet = doc.sheetsByTitle['Alertas'];

  if (!alertsSheet) {
    try {
      alertsSheet = await doc.addSheet({ title: 'Alertas', headerValues: ['Email', 'Producto', 'Fecha'] });
      console.log('✅ Hoja de Alertas creada automáticamente');
    } catch (e) {
      console.warn('⚠️ No se encontró la hoja de Alertas y no se pudo crear automáticamente. Por favor, créala manualmente.');
      return false;
    }
  }

  const fecha = new Date().toLocaleDateString('es-AR');

  await alertsSheet.addRow({
    'Email': email,
    'Producto': productName,
    'Fecha': fecha
  });

  return true;
}

// =============================================
// RMA - GESTIÓN DE GARANTÍAS Y DEVOLUCIONES
// =============================================

export interface Rma {
  idRma: string;
  email: string;
  producto: string;
  nroSerie: string;
  falla: string;
  fechaCompra: string;
  observaciones: string;
  estado: string;
  fecha: string;
}

async function getRmaSheet() {
  const doc = await getDoc();
  let rmaSheet = doc.sheetsByTitle['RMA'];

  if (!rmaSheet) {
    try {
      rmaSheet = await doc.addSheet({
        title: 'RMA',
        headerValues: ['ID RMA', 'Email', 'Producto', 'NroSerie', 'Falla', 'FechaCompra', 'Observaciones', 'Estado', 'Fecha']
      });
      console.log('✅ Hoja RMA creada automáticamente');
    } catch (e) {
      console.error('❌ No se pudo crear la hoja RMA:', e);
      throw new Error('No se encontró ni se pudo crear la hoja RMA');
    }
  }

  return rmaSheet;
}

// Crear un nuevo RMA
export async function createRma(data: Omit<Rma, 'idRma' | 'fecha' | 'estado'>): Promise<string> {
  const sheet = await getRmaSheet();
  const idRma = `RMA-${Date.now()}`;
  const fecha = new Date().toLocaleDateString('es-AR');

  await sheet.addRow({
    'ID RMA': idRma,
    'Email': data.email,
    'Producto': data.producto,
    'NroSerie': data.nroSerie || '-',
    'Falla': data.falla,
    'FechaCompra': data.fechaCompra || '-',
    'Observaciones': data.observaciones || '-',
    'Estado': 'Pendiente',
    'Fecha': fecha,
  });

  return idRma;
}

// Obtener los RMA de un cliente
export async function getRmaByEmail(email: string): Promise<Rma[]> {
  const sheet = await getRmaSheet();
  const rows = await sheet.getRows();

  return rows
    .filter(row => (row.get('Email') || '').toLowerCase() === email.toLowerCase())
    .map(row => ({
      idRma: row.get('ID RMA') || '',
      email: row.get('Email') || '',
      producto: row.get('Producto') || '',
      nroSerie: row.get('NroSerie') || '-',
      falla: row.get('Falla') || '',
      fechaCompra: row.get('FechaCompra') || '-',
      observaciones: row.get('Observaciones') || '-',
      estado: row.get('Estado') || 'Pendiente',
      fecha: row.get('Fecha') || '',
    }))
    .reverse();
}

// Obtener TODOS los RMA (para admin)
export async function getAllRmas(): Promise<Rma[]> {
  const sheet = await getRmaSheet();
  const rows = await sheet.getRows();

  return rows.map(row => ({
    idRma: row.get('ID RMA') || '',
    email: row.get('Email') || '',
    producto: row.get('Producto') || '',
    nroSerie: row.get('NroSerie') || '-',
    falla: row.get('Falla') || '',
    fechaCompra: row.get('FechaCompra') || '-',
    observaciones: row.get('Observaciones') || '-',
    estado: row.get('Estado') || 'Pendiente',
    fecha: row.get('Fecha') || '',
  })).reverse();
}

// Actualizar estado de un RMA
export async function updateRmaStatus(rmaId: string, newStatus: string): Promise<boolean> {
  const sheet = await getRmaSheet();
  const rows = await sheet.getRows();
  const rmaRow = rows.find(row => row.get('ID RMA') === rmaId);

  if (!rmaRow) return false;

  rmaRow.set('Estado', newStatus);
  await rmaRow.save();

  // Limpiar caché
  cachedDoc = null;
  lastConnectionTime = 0;

  return true;
}

// =============================================
// BANNERS - PÁGINA PRINCIPAL
// =============================================

export interface Banner {
  id: string;
  imagenUrl: string;
  titulo: string;
  descripcion: string;
  link: string;
  textoBoton: string;
  activo: boolean;
}

async function getBannersSheet() {
  const doc = await getDoc();
  let bannersSheet = doc.sheetsByTitle['Banners'];

  if (!bannersSheet) {
    try {
      bannersSheet = await doc.addSheet({
        title: 'Banners',
        headerValues: ['ID', 'ImagenURL', 'Titulo', 'Descripcion', 'Link', 'TextoBoton', 'Activo']
      });
      console.log('✅ Hoja Banners creada automáticamente');
      
      // Auto-populate with default banners so they don't disappear
      await bannersSheet.addRow({ 'ID': '3', 'ImagenURL': '/banners/peripherals.png', 'Titulo': 'PERIFÉRICOS & AUDIO', 'Descripcion': 'Equipá tu negocio con las mejores marcas en teclados, mouse y sonido.', 'Link': '/catalogo?categoria=Perifericos', 'TextoBoton': 'Ver Productos', 'Activo': 'Si' });
      await bannersSheet.addRow({ 'ID': '2', 'ImagenURL': '/banners/social_media.png', 'Titulo': 'SEGUINOS EN REDES', 'Descripcion': 'Enterate antes que nadie de los nuevos ingresos y sorteos.', 'Link': 'https://www.instagram.com/yeahtecnologias/', 'TextoBoton': 'Ir a Instagram', 'Activo': 'Si' });
      
    } catch (e) {
      console.error('❌ No se pudo crear la hoja Banners:', e);
      throw new Error('No se encontró ni se pudo crear la hoja Banners');
    }
  }

  return bannersSheet;
}

// Obtener todos los banners
export async function getAllBanners(): Promise<Banner[]> {
  const sheet = await getBannersSheet();
  const rows = await sheet.getRows();

  return rows.map(row => ({
    id: row.get('ID') || '',
    imagenUrl: row.get('ImagenURL') || '',
    titulo: row.get('Titulo') || '',
    descripcion: row.get('Descripcion') || '',
    link: row.get('Link') || '',
    textoBoton: row.get('TextoBoton') || '',
    activo: (row.get('Activo') || 'Si').toLowerCase() === 'si',
  }));
}

// Crear un nuevo banner
export async function createBanner(data: Omit<Banner, 'id'>): Promise<string> {
  const sheet = await getBannersSheet();
  const idBanner = `BAN-${Date.now()}`;

  await sheet.addRow({
    'ID': idBanner,
    'ImagenURL': data.imagenUrl,
    'Titulo': data.titulo || '',
    'Descripcion': data.descripcion || '',
    'Link': data.link || '',
    'TextoBoton': data.textoBoton || 'Ver Más',
    'Activo': data.activo ? 'Si' : 'No',
  });

  cachedDoc = null;
  lastConnectionTime = 0;

  return idBanner;
}

// Actualizar banner
export async function updateBanner(id: string, updates: Partial<Banner>): Promise<boolean> {
  const sheet = await getBannersSheet();
  const rows = await sheet.getRows();
  const row = rows.find(r => r.get('ID') === id);

  if (!row) return false;

  if (updates.imagenUrl !== undefined) row.set('ImagenURL', updates.imagenUrl);
  if (updates.titulo !== undefined) row.set('Titulo', updates.titulo);
  if (updates.descripcion !== undefined) row.set('Descripcion', updates.descripcion);
  if (updates.link !== undefined) row.set('Link', updates.link);
  if (updates.textoBoton !== undefined) row.set('TextoBoton', updates.textoBoton);
  if (updates.activo !== undefined) row.set('Activo', updates.activo ? 'Si' : 'No');

  await row.save();

  cachedDoc = null;
  lastConnectionTime = 0;

  return true;
}

// Eliminar banner
export async function deleteBanner(id: string): Promise<boolean> {
  const sheet = await getBannersSheet();
  const rows = await sheet.getRows();
  const row = rows.find(r => r.get('ID') === id);

  if (!row) return false;

  await row.delete();

  cachedDoc = null;
  lastConnectionTime = 0;

  return true;
}

// Reordenar banners (guarda el nuevo orden en Google Sheets)
export async function reorderBanners(idList: string[]): Promise<boolean> {
  const sheet = await getBannersSheet();
  const rows = await sheet.getRows();

  // Crear mapa de datos por ID
  const dataMap = new Map<string, Record<string, string>>();
  rows.forEach(row => {
    dataMap.set(row.get('ID'), {
      imagenUrl: row.get('ImagenURL') || '',
      titulo: row.get('Titulo') || '',
      descripcion: row.get('Descripcion') || '',
      link: row.get('Link') || '',
      textoBoton: row.get('TextoBoton') || 'Ver Más',
      activo: row.get('Activo') || 'Si',
    });
  });

  // Sobreescribir cada fila en el nuevo orden
  for (let i = 0; i < rows.length && i < idList.length; i++) {
    const id = idList[i];
    const data = dataMap.get(id);
    if (data) {
      rows[i].set('ID', id);
      rows[i].set('ImagenURL', data.imagenUrl);
      rows[i].set('Titulo', data.titulo);
      rows[i].set('Descripcion', data.descripcion);
      rows[i].set('Link', data.link);
      rows[i].set('TextoBoton', data.textoBoton);
      rows[i].set('Activo', data.activo);
      await rows[i].save();
    }
  }

  cachedDoc = null;
  lastConnectionTime = 0;

  return true;
}

// ----------------------------------------------------
// GESTIÓN DE BLOG EN GOOGLE SHEETS
// ----------------------------------------------------

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  tags: string[];
  imageUrl: string;
  activo: boolean;
}

export const defaultBlogPosts: BlogPostItem[] = [
  {
    id: '6',
    slug: 'guia-modo-mostrador-revendedores',
    title: 'Guía paso a paso: Cómo usar el Modo Mostrador para vender con tu propia marca',
    excerpt: 'Descubrí cómo convertir nuestro catálogo en tu propia tienda online personalizada: configurá tu margen de ganancia, cargá tu logo y recibí pedidos directos a tu WhatsApp.',
    content: `<p>¿Tenés un local de tecnología, vendés por redes sociales o te gustaría ofrecer productos a tus clientes sin invertir en crear una página web desde cero? El <strong>Modo Mostrador (Marca Blanca)</strong> de Yeah! Tecnologías está pensado especialmente para vos.</p><p>Con esta herramienta podés usar todo nuestro catálogo frente a tus clientes o enviarles un link por WhatsApp con <strong>tus propios precios de venta, tu logo y tus datos de contacto</strong>, sin que nadie vea tus costos mayoristas.</p><h3>💼 ¿Qué ventajas te da el Modo Mostrador?</h3><ul><li><strong>Precios automáticos con tu ganancia:</strong> Elegís tu margen de recargo (+30%, +40%, +50%, +70% o personalizado) y todos los precios se recalculan en tiempo real.</li><li><strong>Tu marca en primer plano:</strong> Podés cargar el nombre de tu local y subir tu propio logo para que reemplace cualquier información institucional.</li><li><strong>Pedidos directos a tu WhatsApp:</strong> Tus clientes finales verán un botón verde <em>“📲 Pedir por WhatsApp a [Tu Local]”</em> para encargarte el producto directamente a tu teléfono.</li><li><strong>Descarga de fotos limpias y textos para redes:</strong> Cada producto cuenta con un botón para descargar la foto en alta resolución sin marcas y copiar el texto listo para tus historias o estados.</li></ul>`,
    date: '28 Ago, 2026',
    category: 'Revendedores',
    tags: ['Revendedores', 'Modo Mostrador', 'Marca Blanca', 'Ventas', 'Tutorial'],
    imageUrl: '/blog/modo-mostrador-guia.jpg',
    activo: true
  },
  {
    id: '5',
    slug: 'cables-carga-lenta-reclamos',
    title: 'Por qué algunos cables cargan lento (aunque sean nuevos) y cómo evitar reclamos',
    excerpt: 'No todos los cables son iguales. Aprende a identificar un cable de calidad y evita el reclamo más común en accesorios de celulares.',
    content: `<p>Uno de los reclamos más comunes en accesorios para celulares es: <strong>“El cable es nuevo, pero carga lento”.</strong></p><p>La realidad es que no todos los cables son iguales, y muchos problemas se pueden evitar si se entiende qué mirar antes de vender o comprar.</p><h3>🔌 No todos los cables cargan igual</h3><ul><li><strong>Grosor interno del cable:</strong> Los cables más finos pierden energía. Cuanto más largo y más fino, peor rinde la carga.</li><li><strong>Material interno:</strong> Un buen cable usa cobre de mejor calidad.</li><li><strong>Carga vs carga + datos:</strong> Un cable de mala calidad puede fallar en ambas cosas.</li></ul>`,
    date: '12 Ene, 2026',
    category: 'Accesorios',
    tags: ['Cables', 'Carga', 'Consejos', 'Ventas'],
    imageUrl: '/blog/cables-carga-lenta.png',
    activo: true
  },
  {
    id: '4',
    slug: 'cargadores-rapidos-bateria',
    title: 'Cargadores rápidos y batería del celular: lo que de verdad importa',
    excerpt: 'No todo es marketing. Aprende a identificar un buen cargador, qué es el amperaje y cómo cuidar la vida útil de tu batería sin mitos.',
    content: `<p>Hoy casi todos los celulares prometen “carga rápida”, “turbo” o “fast charge”. El problema es que no siempre está claro qué es real, qué es marketing y qué conviene usar para no arruinar la batería con el tiempo.</p><h3>🔌 Voltaje y Amperaje</h3><p>El amperaje estable importa mucho más que una caja llena de Watts y promesas de marketing.</p>`,
    date: '03 Ene, 2026',
    category: 'Tecnología',
    tags: ['Cargadores', 'Batería', 'Guía', 'Mitos'],
    imageUrl: '/blog/charger-battery.png',
    activo: true
  },
  {
    id: '1',
    slug: 'guia-auriculares-gamer',
    title: 'Guía definitiva: Cómo elegir tus auriculares gamer',
    excerpt: 'No todos los auriculares son iguales. Descubre qué buscar en cuanto a sonido, comodidad y micrófono según tu presupuesto.',
    content: `<p>Elegir los auriculares perfectos puede marcar la diferencia entre escuchar los pasos de tu enemigo a tiempo o perder la partida. En Yeah! Tecnologías probamos cientos de modelos y aquí te traemos las claves.</p><h3>1. Comodidad: La reina olvidada</h3><p>Puedes tener el mejor sonido del mundo, pero si te duelen las orejas a los 30 minutos, no sirven. Busca almohadillas de <strong>memory foam</strong> y diademas ajustables con suspensión.</p><h3>2. ¿Sonido Surround 7.1 o Estéreo?</h3><p>Para juegos competitivos (Shooters), el estéreo de alta calidad suele ser mejor para posicionar enemigos.</p><h3>3. El Micrófono</h3><p>Si juegas con amigos, la comunicación es clave. Busca micrófonos con cancelación de ruido pasiva.</p>`,
    date: '02 Ene, 2026',
    category: 'Audio',
    tags: ['Gamer', 'Auriculares', 'Guía', 'Audio'],
    imageUrl: '/blog/headphones.png',
    activo: true
  },
  {
    id: '2',
    slug: 'mantenimiento-pc-lenta',
    title: '5 Errores que hacen que tu PC vaya lenta',
    excerpt: '¿Tu computadora ya no vuela como antes? Antes de comprar una nueva, revisa estos puntos críticos de mantenimiento.',
    content: `<p>Es la historia de siempre: compras una PC nueva, vuela, y al año parece una tortuga. No siempre es culpa del hardware, a veces es falta de cariño.</p><h3>1. El polvo es el enemigo silencioso</h3><p>El polvo obstruye los ventiladores. Menos aire = más calor. Más calor = el procesador baja su velocidad para no quemarse. Limpia tu PC cada 6 meses.</p><h3>2. Demasiados programas al inicio</h3><p>Abre el Administrador de Tareas y ve a la pestaña "Inicio". Deshabilita todo lo que no necesites.</p><h3>3. Discos llenos</h3><p>Los discos SSD pierden rendimiento si están llenos al tope. Intenta dejar siempre al menos un 15-20% de espacio libre.</p>`,
    date: '28 Dic, 2025',
    category: 'PC & Hardware',
    tags: ['Mantenimiento', 'PC', 'Tips', 'Hardware'],
    imageUrl: '/blog/pc-cleaning.png',
    activo: true
  },
  {
    id: '3',
    slug: 'smartwatch-vs-smartband',
    title: 'Smartwatch vs Smartband: ¿Cuál necesitas?',
    excerpt: 'Analizamos las diferencias clave entre estos dos wearables para ayudarte a decidir cuál se adapta mejor a tu estilo de vida.',
    content: `<p>Ambos te dan la hora y miden tus pasos, pero ahí terminan las similitudes. ¿Vale la pena pagar la diferencia por un Smartwatch?</p><h3>La Smartband: Ligera y Autónoma</h3><p>Si solo quieres medir tu sueño, pasos y ver notificaciones básicas sin cargar la batería cada día, la Smartband es para ti. Son económicas y la batería dura semanas.</p><h3>El Smartwatch: Tu teléfono en la muñeca</h3><p>Si quieres contestar llamadas, responder WhatsApps, usar mapas y tener apps completas, necesitas un Smartwatch.</p>`,
    date: '26 Dic, 2025',
    category: 'Wearables',
    tags: ['Smartwatch', 'Comparativa', 'Gadgets'],
    imageUrl: '/blog/smartwatch.png',
    activo: true
  }
];

// Obtener o crear la hoja 'Blog'
export async function getBlogSheet() {
  const doc = await getDoc();
  let blogSheet = doc.sheetsByTitle['Blog'];

  if (!blogSheet) {
    try {
      blogSheet = await doc.addSheet({
        title: 'Blog',
        headerValues: ['ID', 'Slug', 'Titulo', 'Extracto', 'Contenido', 'Fecha', 'Categoria', 'Tags', 'ImagenURL', 'Activo']
      });
      console.log('✅ Hoja Blog creada automáticamente en Google Sheets');

      // Auto-popular con los 6 posts iniciales
      for (const p of defaultBlogPosts) {
        await blogSheet.addRow({
          'ID': p.id,
          'Slug': p.slug,
          'Titulo': p.title,
          'Extracto': p.excerpt,
          'Contenido': p.content,
          'Fecha': p.date,
          'Categoria': p.category,
          'Tags': Array.isArray(p.tags) ? p.tags.join(', ') : p.tags,
          'ImagenURL': p.imageUrl,
          'Activo': p.activo ? 'Si' : 'No'
        });
      }
    } catch (e) {
      console.error('❌ Error creando la hoja Blog:', e);
      throw new Error('No se pudo crear ni acceder a la hoja Blog');
    }
  }

  return blogSheet;
}

// Obtener todos los posts del blog (para admin)
export async function getAllBlogPosts(): Promise<BlogPostItem[]> {
  const sheet = await getBlogSheet();
  const rows = await sheet.getRows();

  const postsFromSheet: BlogPostItem[] = rows.map(row => ({
    id: row.get('ID') || '',
    slug: row.get('Slug') || '',
    title: row.get('Titulo') || '',
    excerpt: row.get('Extracto') || '',
    content: row.get('Contenido') || '',
    date: row.get('Fecha') || '',
    category: row.get('Categoria') || 'General',
    tags: (row.get('Tags') || '').split(',').map((t: string) => t.trim()).filter(Boolean),
    imageUrl: row.get('ImagenURL') || '/blog/cables-carga-lenta.png',
    activo: (row.get('Activo') || 'Si').toLowerCase() === 'si',
  }));

  // Auto-sincronizar los posts base que pudieran faltar en la hoja de Sheets
  const existingSlugs = new Set(postsFromSheet.map(p => p.slug));
  const missingPosts = defaultBlogPosts.filter(p => !existingSlugs.has(p.slug));

  if (missingPosts.length > 0) {
    try {
      for (const p of missingPosts) {
        await sheet.addRow({
          'ID': p.id,
          'Slug': p.slug,
          'Titulo': p.title,
          'Extracto': p.excerpt,
          'Contenido': p.content,
          'Fecha': p.date,
          'Categoria': p.category,
          'Tags': Array.isArray(p.tags) ? p.tags.join(', ') : p.tags,
          'ImagenURL': p.imageUrl,
          'Activo': p.activo ? 'Si' : 'No'
        });
        postsFromSheet.push(p);
      }
    } catch (err) {
      console.error('Error auto-syncing missing posts to Sheets:', err);
    }
  }

  return postsFromSheet;
}

// Obtener solo los posts activos del blog (para el público)
export async function getPublicBlogPosts(): Promise<BlogPostItem[]> {
  const posts = await getAllBlogPosts();
  return posts.filter(p => p.activo);
}

// Obtener post por slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPostItem | null> {
  const posts = await getAllBlogPosts();
  return posts.find(p => p.slug === slug && p.activo) || null;
}

// Crear nuevo post
export async function createBlogPost(data: Omit<BlogPostItem, 'id'>): Promise<string> {
  const sheet = await getBlogSheet();
  const idPost = `POST-${Date.now()}`;
  const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  await sheet.addRow({
    'ID': idPost,
    'Slug': slug,
    'Titulo': data.title,
    'Extracto': data.excerpt || '',
    'Contenido': data.content || '',
    'Fecha': data.date || new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }),
    'Categoria': data.category || 'General',
    'Tags': Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
    'ImagenURL': data.imageUrl || '/blog/cables-carga-lenta.png',
    'Activo': data.activo !== false ? 'Si' : 'No'
  });

  cachedDoc = null;
  lastConnectionTime = 0;

  return idPost;
}

// Actualizar post existente
export async function updateBlogPost(id: string, updates: Partial<BlogPostItem>): Promise<boolean> {
  const sheet = await getBlogSheet();
  const rows = await sheet.getRows();
  const row = rows.find(r => r.get('ID') === id);

  if (!row) return false;

  if (updates.slug !== undefined) row.set('Slug', updates.slug);
  if (updates.title !== undefined) row.set('Titulo', updates.title);
  if (updates.excerpt !== undefined) row.set('Extracto', updates.excerpt);
  if (updates.content !== undefined) row.set('Contenido', updates.content);
  if (updates.date !== undefined) row.set('Fecha', updates.date);
  if (updates.category !== undefined) row.set('Categoria', updates.category);
  if (updates.tags !== undefined) {
    row.set('Tags', Array.isArray(updates.tags) ? updates.tags.join(', ') : updates.tags);
  }
  if (updates.imageUrl !== undefined) row.set('ImagenURL', updates.imageUrl);
  if (updates.activo !== undefined) row.set('Activo', updates.activo ? 'Si' : 'No');

  await row.save();

  cachedDoc = null;
  lastConnectionTime = 0;

  return true;
}

// Eliminar post
export async function deleteBlogPost(id: string): Promise<boolean> {
  const sheet = await getBlogSheet();
  const rows = await sheet.getRows();
  const row = rows.find(r => r.get('ID') === id);

  if (!row) return false;

  await row.delete();

  cachedDoc = null;
  lastConnectionTime = 0;

  return true;
}




