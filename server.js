/**
 * ============================================================================
 * CreSer — Servidor Web Estático Local Nativo (server.js)
 * ============================================================================
 * 
 * ¿POR QUÉ?:
 * Brindar un entorno de ejecución HTTP local rápido, confiable, sin dependencias
 * externas pesadas y optimizado para la arquitectura estática modular de CreSer.
 * 
 * ¿CÓMO?:
 * Empleando los módulos nativos de Node.js (`http`, `fs`, `path`, `url`),
 * sirviendo recursos con tipos MIME precisos, resolviendo rutas limpias (clean URLs)
 * y protegiendo contra vulnerabilidades de Directory Traversal.
 * 
 * ¿PARA QUÉ?:
 * Permitir el desarrollo, visualización, navegación y pruebas de todos los módulos
 * (HTML, CSS, JS, imágenes, fuentes y sintetizadores de audio Web Audio API) en localhost.
 * ============================================================================
 */

// ¿POR QUÉ?: Requerir el módulo HTTP nativo de Node.js.
// ¿CÓMO?: Importando 'http' mediante CommonJS para crear el servidor web.
// ¿PARA QUÉ?: Manejar las peticiones (request) y respuestas (response) del cliente.
const http = require('http');

// ¿POR QUÉ?: Acceder al sistema de archivos local de forma síncrona y asíncrona.
// ¿CÓMO?: Importando 'fs' nativo de Node.js.
// ¿PARA QUÉ?: Leer los archivos solicitados (HTML, CSS, JS, imágenes) desde el disco.
const fs = require('fs');

// ¿POR QUÉ?: Manejar rutas de archivos de manera multiplataforma (Windows/Linux/macOS).
// ¿CÓMO?: Importando 'path' para resolver directorios y extensiones de archivos.
// ¿PARA QUÉ?: Construir rutas absolutas seguras y normalizadas.
const path = require('path');

// ¿POR QUÉ?: Parsear y decodificar URLs recibidas en cada petición HTTP.
// ¿CÓMO?: Importando 'url' para extraer el pathname sin parámetros de consulta.
// ¿PARA QUÉ?: Determinar exactamente qué archivo está solicitando el navegador.
const url = require('url');

// ¿POR QUÉ?: Definir el puerto de escucha del servidor web.
// ¿CÓMO?: Tomando la variable de entorno PORT o usando el puerto 3000 por defecto.
// ¿PARA QUÉ?: Permitir que el usuario acceda a la aplicación en http://localhost:3000.
const PORT = process.env.PORT || 3000;

// ¿POR QUÉ?: Establecer el directorio raíz público del proyecto CreSer.
// ¿CÓMO?: Usando __dirname (la carpeta raíz donde se encuentra este server.js).
// ¿PARA QUÉ?: Delimitar el ámbito de archivos servibles y prevenir accesos no autorizados.
const PUBLIC_DIR = __dirname;

// ¿POR QUÉ?: Mapear extensiones de archivo a sus respectivos Content-Type estándar (MIME types).
// ¿CÓMO?: Creando un diccionario asociativo de extensiones a cadenas MIME con codificación utf-8.
// ¿PARA QUÉ?: Garantizar que el navegador interprete correctamente scripts, estilos, audios y fuentes.
const MIME_TYPES = {
  // Documentos Web
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  
  // Archivos de Imagen y Gráficos
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  
  // Archivos de Audio y Multimedia (Paisajes sonoros nativos)
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  
  // Tipografías y Fuentes Web
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

/**
 * Instancia del servidor HTTP nativo
 * 
 * ¿POR QUÉ?: Procesar cada solicitud entrante del navegador y entregar el archivo correspondiente.
 * ¿CÓMO?: Con una función callback que recibe `req` (petición) y `res` (respuesta).
 * ¿PARA QUÉ?: Servir la plataforma web CreSer de manera ágil y segura.
 */
const server = http.createServer((req, res) => {
  // ¿POR QUÉ?: Extraer la ruta solicitada descartando query parameters.
  // ¿CÓMO?: Parseando la URL de la petición con url.parse.
  // ¿PARA QUÉ?: Saber qué recurso específico del sistema de archivos se solicita.
  const parsedUrl = url.parse(req.url);

  // ¿POR QUÉ?: Decodificar caracteres especiales en la URL (espacios, tildes, etc.).
  // ¿CÓMO?: Usando decodeURIComponent sobre el pathname.
  // ¿PARA QUÉ?: Evitar errores de lectura al buscar rutas con caracteres codificados.
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // ¿POR QUÉ?: Manejar la ruta raíz '/' por defecto.
  // ¿CÓMO?: Si el pathname es '/' o vacío, reescribirlo a '/index.html'.
  // ¿PARA QUÉ?: Mostrar la página principal de inicio de CreSer al entrar a la raíz.
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  // ¿POR QUÉ?: Construir la ruta absoluta completa en el disco local.
  // ¿CÓMO?: Uniendo PUBLIC_DIR con el pathname normalizado mediante path.join.
  // ¿PARA QUÉ?: Ubicar la posición exacta del archivo en el sistema operativo.
  let filePath = path.join(PUBLIC_DIR, pathname);

  // ¿POR QUÉ?: Seguridad contra ataques de 'Directory Traversal' (ej: ../../windows).
  // ¿CÓMO?: Verificando que filePath inicie estrictamente con el prefijo de PUBLIC_DIR.
  // ¿PARA QUÉ?: Impedir que un atacante lea archivos sensibles fuera de la carpeta del proyecto.
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden - Acceso denegado fuera de la raíz pública.');
    return;
  }

  // ¿POR QUÉ?: Permitir URLs limpias (Clean URLs) como '/pages/login' sin necesidad de escribir '.html'.
  // ¿CÓMO?: Comprobando si el archivo existe tal cual, y si no, verificando si agregando '.html' existe.
  // ¿PARA QUÉ?: Mejorar la experiencia de usuario y facilitar enlaces más limpios y legibles.
  if (!fs.existsSync(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else {
      // Si no existe ni directo ni con .html, responder con error 404
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found - El recurso solicitado no existe en CreSer.');
      return;
    }
  }

  // ¿POR QUÉ?: Manejar solicitudes que apuntan a subdirectorios (ej: /pages/).
  // ¿CÓMO?: Verificando con fs.statSync si es un directorio y buscando un index.html interno.
  // ¿PARA QUÉ?: Servir automáticamente el índice de dicho directorio si existe.
  if (fs.statSync(filePath).isDirectory()) {
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      filePath = indexPath;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found - Índice de directorio no encontrado.');
      return;
    }
  }

  // ¿POR QUÉ?: Determinar el Content-Type correcto para la respuesta HTTP.
  // ¿CÓMO?: Extrayendo la extensión del archivo con path.extname y buscando en MIME_TYPES.
  // ¿PARA QUÉ?: Asegurar que el navegador renderice correctamente HTML, CSS, JS, imágenes o fuentes.
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // ¿POR QUÉ?: Leer el contenido del archivo en memoria y enviarlo al navegador.
  // ¿CÓMO?: Usando fs.readFile de forma asíncrona no bloqueante.
  // ¿PARA QUÉ?: Entregar los datos al cliente con código de estado HTTP 200 y encabezados CORS.
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // En caso de fallo de lectura de disco, retornar código de error 500
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Internal Server Error - Error al leer el recurso solicitado.');
      return;
    }
    // Encabezados exitosos con soporte CORS para recursos locales
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
});

/**
 * Inicialización y puesta en marcha del servidor
 * 
 * ¿POR QUÉ?: Escuchar conexiones entrantes en el puerto asignado.
 * ¿CÓMO?: Invocando server.listen() con el puerto configurado y un callback informativo.
 * ¿PARA QUÉ?: Notificar en la terminal que el servidor está listo para recibir tráfico en localhost.
 */
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌿 CreSer — Servidor Web Activo`);
  console.log(`👉 URL Local: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
