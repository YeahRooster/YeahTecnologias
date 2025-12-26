import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testConnection() {
    console.log('Iniciando prueba de conexión...');

    if (!process.env.GOOGLE_SHEET_ID) {
        console.error('ERROR: GOOGLE_SHEET_ID no encontrado.');
        return;
    }

    const jwt = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, jwt);

    try {
        await doc.loadInfo();
        console.log(`\n¡Conexión Exitosa!`);
        console.log(`Título del documento: ${doc.title}`);
        console.log(`Número de hojas: ${doc.sheetCount}\n`);

        for (let i = 0; i < doc.sheetCount; i++) {
            const sheet = doc.sheetsByIndex[i];
            console.log(`--- Hoja ${i + 1}: ${sheet.title} ---`);
            await sheet.loadHeaderRow();
            console.log(`Encabezados: [${sheet.headerValues.join(', ')}]`);

            const rows = await sheet.getRows({ limit: 3 });
            console.log(`Filas de ejemplo (${rows.length}):`);
            rows.forEach((row, index) => {
                const rowData = sheet.headerValues.map(header => `${header}: ${row.get(header)}`).join(' | ');
                console.log(`  Fila ${index + 1}: ${rowData}`);
            });
            console.log('\n');
        }

    } catch (error) {
        console.error('❌ Error al conectar con Google Sheets:', error);
    }
}

// Wrapper con timeout
const TIMEOUT_MS = 15000; // 15 segundos
const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('⏳ Tiempo de espera agotado (15s). Verifica tu conexión a internet o las credenciales.')), TIMEOUT_MS);
});

console.log('⏱️ Iniciando prueba con timeout de 15s...');
Promise.race([testConnection(), timeoutPromise])
    .then(() => console.log('✅ Prueba finalizada.'))
    .catch((err) => {
        console.error('\n🔴 FALLÓ LA PRUEBA:');
        console.error(err.message || err);
        process.exit(1);
    });
