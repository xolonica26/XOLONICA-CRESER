/**
 * ============================================================================
 * CreSer — Script de Inicialización y Población de Colecciones en Cloud Firestore
 * ============================================================================
 * 
 * ¿POR QUÉ?:
 * Crear y estructurar las colecciones iniciales en la base de datos Cloud Firestore
 * de Firebase ('cresernicaragua') basadas en el modelo de datos formal en 2FN.
 * 
 * ¿CÓMO?:
 * Utilizando el SDK modular de Firebase para insertar documentos representativos
 * en las colecciones: 'usuarios', 'auditoria_logs', 'recursos' y 'registros_emocionales'.
 * 
 * ¿PARA QUÉ?:
 * Disponer de datos listos en la consola de Firebase para pruebas de roles y auditoría.
 * ============================================================================
 */

// ¿POR QUÉ?: Importar la función principal de inicialización de la app de Firebase.
// ¿CÓMO?: Importando initializeApp desde el paquete npm 'firebase/app'.
// ¿PARA QUÉ?: Establecer la conexión con el proyecto 'cresernicaragua'.
import { initializeApp } from "firebase/app";

// ¿POR QUÉ?: Importar métodos necesarios para interactuar con Cloud Firestore.
// ¿CÓMO?: Importando getFirestore, collection, addDoc y serverTimestamp desde 'firebase/firestore'.
// ¿PARA QUÉ?: Obtener la instancia de base de datos y añadir nuevos documentos.
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// ¿POR QUÉ?: Configurar las credenciales del proyecto Firebase para el entorno de scripts.
// ¿CÓMO?: Definiendo un objeto inmutable con apiKey, authDomain, projectId y measurementId.
// ¿PARA QUÉ?: Autenticar las peticiones del script contra la nube de Google Firebase.
const firebaseConfig = {
  apiKey: "AIzaSyBcVDa116djv85HEo0BPf0-6_LOdDfBPHQ",
  authDomain: "cresernicaragua.firebaseapp.com",
  projectId: "cresernicaragua",
  storageBucket: "cresernicaragua.firebasestorage.app",
  messagingSenderId: "826974092135",
  appId: "1:826974092135:web:2f7158a99519cd3bd2cdc2",
  measurementId: "G-FL857SSYHW"
};

// ¿POR QUÉ?: Instanciar la aplicación de Firebase en memoria.
// ¿CÓMO?: Pasando el objeto firebaseConfig a initializeApp.
// ¿PARA QUÉ?: Servir como punto de partida para todos los servicios de Firebase.
const app = initializeApp(firebaseConfig);

// ¿POR QUÉ?: Obtener el cliente de Cloud Firestore.
// ¿CÓMO?: Pasando la instancia de la app a getFirestore.
// ¿PARA QUÉ?: Realizar operaciones de lectura y escritura en la base de datos documental.
const db = getFirestore(app);

/**
 * Función principal asíncrona para sembrar colecciones
 * 
 * ¿POR QUÉ?: Ejecutar las inserciones secuencialmente asegurando que cada una complete con éxito.
 * ¿CÓMO?: Iterando con bucles for...of y llamadas asíncronas await addDoc().
 * ¿PARA QUÉ?: Llenar la base de datos con registros representativos de los 3 roles y sus entidades.
 */
async function seedFirestore() {
  console.log("🌱 Iniciando población de colecciones en Cloud Firestore...");

  try {
    // ========================================================================
    // 1. Colección: usuarios (Modelo RBAC con 3 Roles)
    // ========================================================================
    // ¿POR QUÉ?: Representar a los usuarios de los tres roles definidos en la matriz de acceso.
    // ¿CÓMO?: Creando un arreglo de objetos con nombre, correo, rol y fecha de registro.
    // ¿PARA QUÉ?: Permitir autenticación y pruebas de permisos diferenciados.
    const usuarios = [
      {
        nombre_completo: "Administrador CreSer",
        email: "admin@creser.org",
        rol: "ADMIN",
        estado_activo: true,
        fecha_registro: new Date()
      },
      {
        nombre_completo: "Auditor de Seguridad",
        email: "auditor@creser.org",
        rol: "AUDITOR",
        estado_activo: true,
        fecha_registro: new Date()
      },
      {
        nombre_completo: "Andrea Mendoza",
        email: "andrea@ejemplo.com",
        rol: "USUARIO",
        estado_activo: true,
        fecha_registro: new Date()
      }
    ];

    // ¿POR QUÉ?: Insertar cada usuario individualmente en la colección 'usuarios'.
    // ¿CÓMO?: Recorriendo el arreglo con for...of y esperando la respuesta con await addDoc().
    // ¿PARA QUÉ?: Generar un documento con ID automático en Firestore e imprimir su confirmación.
    for (const u of usuarios) {
      const docRef = await addDoc(collection(db, "usuarios"), u);
      console.log(`✓ Usuario creado [${u.rol}]: ${u.email} (ID: ${docRef.id})`);
    }

    // ========================================================================
    // 2. Colección: auditoria_logs (Trazabilidad y Seguridad)
    // ========================================================================
    // ¿POR QUÉ?: Registrar la bitácora de eventos del sistema para el rol Auditor y Administrador.
    // ¿CÓMO?: Creando entradas con id_evento, usuario, rol, acción, dirección IP y fecha.
    // ¿PARA QUÉ?: Garantizar la transparencia operativa y cumplimiento de políticas de seguridad.
    const logs = [
      {
        id_evento: "LOG-1001",
        usuario: "admin@creser.org",
        rol: "ADMIN",
        accion: "Inicialización de infraestructura y reglas en Cloud Firestore",
        ip: "127.0.0.1",
        fecha: new Date()
      },
      {
        id_evento: "LOG-1002",
        usuario: "auditor@creser.org",
        rol: "AUDITOR",
        accion: "Validación de políticas de privacidad y anonimización de datos",
        ip: "127.0.0.1",
        fecha: new Date()
      },
      {
        id_evento: "LOG-1003",
        usuario: "andrea@ejemplo.com",
        rol: "USUARIO",
        accion: "Inicio de sesión y acceso a herramientas de bienestar",
        ip: "127.0.0.1",
        fecha: new Date()
      }
    ];

    // ¿POR QUÉ?: Guardar los eventos en la colección 'auditoria_logs'.
    // ¿CÓMO?: Ejecutando addDoc en cada iteración del bucle.
    // ¿PARA QUÉ?: Disponer de datos iniciales en la vista de perfil/auditoría.
    for (const l of logs) {
      const docRef = await addDoc(collection(db, "auditoria_logs"), l);
      console.log(`✓ Log de auditoría registrado: ${l.id_evento} (ID: ${docRef.id})`);
    }

    // ========================================================================
    // 3. Colección: recursos (Catálogo Educativo y Formativo)
    // ========================================================================
    // ¿POR QUÉ?: Dotar al CMS de artículos, guías prácticas y podcasts de salud mental.
    // ¿CÓMO?: Creando objetos estructurados por título, categoría, tipo, descripción y autor.
    // ¿PARA QUÉ?: Ofrecer contenido psicoeducativo navegable en la página de Recursos.
    const recursos = [
      {
        titulo: "Manejo Efectivo del Estrés Académico y Laboral",
        categoria: "articulos",
        tipo: "Artículo",
        descripcion: "Técnicas prácticas para organizar prioridades y prevenir saturación.",
        autor: "admin@creser.org",
        fecha: new Date()
      },
      {
        titulo: "Identificación y Expresión Emocional Asertiva",
        categoria: "guias",
        tipo: "Guía Práctica",
        descripcion: "Herramientas para comunicar lo que sientes con asertividad.",
        autor: "admin@creser.org",
        fecha: new Date()
      },
      {
        titulo: "Mente en Calma: El Poder de la Autocompasión",
        categoria: "podcasts",
        tipo: "Podcast",
        descripcion: "Episodio de 15 minutos sobre transformación del diálogo interno.",
        autor: "admin@creser.org",
        fecha: new Date()
      }
    ];

    // ¿POR QUÉ?: Insertar los recursos educativos en la colección 'recursos'.
    // ¿CÓMO?: Invocando addDoc con la referencia de la colección.
    // ¿PARA QUÉ?: Hacer accesible el catálogo desde la interfaz web.
    for (const r of recursos) {
      const docRef = await addDoc(collection(db, "recursos"), r);
      console.log(`✓ Recurso educativo creado: ${r.titulo} (ID: ${docRef.id})`);
    }

    // ========================================================================
    // 4. Colección: registros_emocionales (Mood Tracking)
    // ========================================================================
    // ¿POR QUÉ?: Demostrar el almacenamiento de registros anímicos de los usuarios.
    // ¿CÓMO?: Creando un registro con estado_emocional, nota, racha_dias y timestamp.
    // ¿PARA QUÉ?: Graficar estadísticas y rachas de bienestar personal.
    const emociones = [
      {
        usuario: "andrea@ejemplo.com",
        estado_emocional: "tranquilo",
        nota: "Sesión de respiración 4-4-4 completada",
        racha_dias: 7,
        fecha: new Date()
      }
    ];

    // ¿POR QUÉ?: Insertar la entrada emocional en la colección 'registros_emocionales'.
    // ¿CÓMO?: Usando addDoc de forma asíncrona.
    // ¿PARA QUÉ?: Alimentar el módulo de bienestar del usuario.
    for (const e of emociones) {
      const docRef = await addDoc(collection(db, "registros_emocionales"), e);
      console.log(`✓ Registro emocional creado para: ${e.usuario} (ID: ${docRef.id})`);
    }

    console.log("\n🎉 ¡Todas las colecciones de Firestore han sido creadas y pobladas con éxito!");
    // Finalizar el proceso con código 0 de éxito
    process.exit(0);
  } catch (error) {
    // ¿POR QUÉ?: Capturar y reportar cualquier excepción durante la siembra de datos.
    // ¿CÓMO?: Imprimiendo el error en consola y terminando el proceso con código 1.
    // ¿PARA QUÉ?: Alertar al desarrollador sobre problemas de conexión o permisos.
    console.error("❌ Error al poblar Firestore:", error);
    process.exit(1);
  }
}

// ¿POR QUÉ?: Disparar la ejecución de la función de sembrado.
// ¿CÓMO?: Llamando directamente a seedFirestore().
// ¿PARA QUÉ?: Ejecutar el flujo de inicio a fin al correr el script con Node.js.
seedFirestore();
