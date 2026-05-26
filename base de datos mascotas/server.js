import http from 'http';
import fs from 'fs/promises';
import { URL } from 'url';

const PORT = 3000;
const FILE_PATH = './mascotas.json';

// Funciones auxiliares para leer y escribir el JSON de forma non-blocking
async function leerMascotas() {
    try {
        const data = await fs.readFile(FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return []; // Retorna un arreglo vacío si el archivo no existe aún
    }
}

async function guardarMascotas(mascotas) {
    await fs.writeFile(FILE_PATH, JSON.stringify(mascotas, null, 2), 'utf-8');
}

const server = http.createServer(async (req, res) => {
    // Habilitar CORS para que el frontend se comunique sin problemas
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    if (pathname !== '/api/mascotas') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
        return;
    }

    // ==========================================
    // METODOS GET
    // ==========================================
    if (req.method === 'GET') {
        const mascotas = await leerMascotas();
        const nombreParam = parsedUrl.searchParams.get('nombre');
        const rutParam = parsedUrl.searchParams.get('rut');

        // GET con el parámetro nombre
        if (nombreParam) {
            const mascota = mascotas.find(m => m.nombre.toLowerCase() === nombreParam.toLowerCase());
            if (!mascota) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: `Mascota con el nombre '${nombreParam}' no encontrada` }));
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(mascota));
        }

        // GET con el parámetro rut
        if (rutParam) {
            const filtradas = mascotas.filter(m => m.rut_dueno.trim() === rutParam.trim());
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(filtradas));
        }

        // GET sin parámetros: Retornar todas las mascotas
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(mascotas));
    }

    // ==========================================
    // METODO POST: Inserta una mascota al archivo
    // ==========================================
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const { nombre, rut_dueno } = data;

                // Validación básica de campos requeridos
                if (!nombre || !rut_dueno) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Faltan campos obligatorios: nombre y rut_dueno' }));
                }

                let mascotas = await leerMascotas();
                
                // Evitar duplicar mascotas con el mismo nombre exactamente (opcional pero ideal)
                const existe = mascotas.some(m => m.nombre.toLowerCase() === nombre.trim().toLowerCase());
                if (existe) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Ya existe una mascota registrada con ese nombre' }));
                }

                // Insertar nueva mascota
                const nuevaMascota = { 
                    nombre: nombre.trim(), 
                    rut_dueno: rut_dueno.trim() 
                };
                
                mascotas.push(nuevaMascota);
                await guardarMascotas(mascotas);

                res.writeHead(201, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ mensaje: 'Mascota inscrita exitosamente en el Registro Civil', mascota: nuevaMascota }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Error al procesar el JSON recibido' }));
            }
        });
        return;
    }

    // ==========================================
    // METODOS DELETE
    // ==========================================
    if (req.method === 'DELETE') {
        const nombreParam = parsedUrl.searchParams.get('nombre');
        const rutParam = parsedUrl.searchParams.get('rut');
        let mascotas = await leerMascotas();

        // DELETE con parámetro nombre
        if (nombreParam) {
            const longitudInicial = mascotas.length;
            mascotas = mascotas.filter(m => m.nombre.toLowerCase() !== nombreParam.toLowerCase());

            if (mascotas.length === longitudInicial) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: `No existe ninguna mascota llamada '${nombreParam}'` }));
            }

            await guardarMascotas(mascotas);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ mensaje: `Mascota '${nombreParam}' eliminada correctamente del registro` }));
        }

        // DELETE con parámetro rut
        if (rutParam) {
            const longitudInicial = mascotas.length;
            mascotas = mascotas.filter(m => m.rut_dueno.trim() !== rutParam.trim());

            if (mascotas.length === longitudInicial) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: `No se encontraron mascotas asociadas al RUT dueño '${rutParam}'` }));
            }

            await guardarMascotas(mascotas);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ mensaje: `Todas las mascotas asociadas al dueño RUT ${rutParam} fueron removidas` }));
        }

        // Si entran a DELETE sin parámetros válidos
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Se requiere especificar parámetro "nombre" o "rut" para eliminar' }));
    }
});

server.listen(PORT, () => {
    console.log(`🐾 Servidor del Registro Civil de Mascotas escuchando en http://localhost:${PORT}`);
});