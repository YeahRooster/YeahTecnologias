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
  imageUrl?: string;
  category: string;
  cost?: number;
  percentage?: number;
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
}

// Obtener todos los productos
export async function getProducts(): Promise<Product[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle['Hoja 1'] || doc.sheetsByIndex[0];

  const rows = await sheet.getRows();

  return rows.map((row) => ({
    id: row.get('ID') || '',
    name: row.get('Nombre') || '',
    description: row.get('Descripcion') || '',
    price: parseFloat(row.get('Precio') || '0'),
    stock: parseInt(row.get('Stock') || '0'),
    image: row.get('ImagenURL') || '',
    category: row.get('Categoria') || '',
    cost: parseFloat(row.get('Costo') || '0'),
  }));
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
  };
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
  });

  return { ...userData, fechaRegistro };
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
  }));
}

// Crear un nuevo pedido
export async function createOrder(order: {
  email: string;
  products: { id: string; name: string; quantity: number; price: number }[];
  total: number;
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
  });

  // Descontar stock
  const productsSheet = doc.sheetsByTitle['Hoja 1'] || doc.sheetsByIndex[0];
  const productRows = await productsSheet.getRows();

  for (const item of order.products) {
    let productRow = productRows.find(row => row.get('ID') === item.id);
    if (!productRow) {
      productRow = productRows.find(row => row.get('Nombre') === item.name);
    }

    if (productRow) {
      const currentStock = parseInt(productRow.get('Stock') || '0');
      const newStock = Math.max(0, currentStock - item.quantity);
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
