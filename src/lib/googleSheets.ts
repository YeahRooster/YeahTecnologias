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



