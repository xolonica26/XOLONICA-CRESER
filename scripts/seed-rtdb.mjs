/**
 * ============================================================================
 * CreSer — Script de Inicialización y Población en Realtime Database (seed-rtdb.mjs)
 * ============================================================================
 * 
 * ¿POR QUÉ?:
 * Estructurar y precargar los nodos JSON raíz en Firebase Realtime Database
 * garantizando la disponibilidad de configuraciones de plataforma, métricas globales
 * y definiciones de roles para sincronización instantánea.
 * 
 * ¿CÓMO?:
 * Utilizando el SDK oficial de Firebase Realtime Database (`getDatabase`, `ref`, `set`)
 * para escribir un árbol de datos estructurado en el nodo raíz de la base de datos.
 * 
 * ¿PARA QUÉ?:
 * Proporcionar acceso en tiempo real de baja latencia a estadísticas de uso,
 * estados de servicio y bitácora de auditoría reciente.
 * ============================================================================
 */

// ¿POR QUÉ?: Inicializar la instancia principal de Firebase.
// ¿CÓMO?: Importando initializeApp desde 'firebase/app'.
// ¿PARA QUÉ?: Conectar con el proyecto en la nube 'cresernicaragua'.
import { initializeApp } from "firebase/app";

// ¿POR QUÉ?: Interactuar con la base de datos NoSQL de árbol JSON en tiempo real.
// ¿CÓMO?: Importando getDatabase, ref y set desde 'firebase/database'.
// ¿PARA QUÉ?: Obtener la instancia y escribir datos en rutas de referencia específicas.
import { getDatabase, ref, set } from "firebase/database";

// ¿POR QUÉ?: Especificar las credenciales y la URL única de Realtime Database.
// ¿CÓMO?: Declarando el objeto con databaseURL y credenciales del proyecto.
// ¿PARA QUÉ?: Permitir que el SDK apunte al clúster de Realtime Database correspondiente.
const firebaseConfig = {
  apiKey: "AIzaSyBcVDa116djv85HEo0BPf0-6_LOdDfBPHQ",
  authDomain: "cresernicaragua.firebaseapp.com",
  databaseURL: "https://cresernicaragua-default-rtdb.firebaseio.com",
  projectId: "cresernicaragua",
  storageBucket: "cresernicaragua.firebasestorage.app",
  messagingSenderId: "826974092135",
  appId: "1:826974092135:web:2f7158a99519cd3bd2cdc2",
  measurementId: "G-FL857SSYHW"
};

// ¿POR QUÉ?: Iniciar la aplicación de Firebase con la configuración definida.
// ¿CÓMO?: Llamando a initializeApp con firebaseConfig.
// ¿PARA QUÉ?: Habilitar el canal de comunicación con los servicios de Google Cloud.
const app = initializeApp(firebaseConfig);

// ¿POR QUÉ?: Crear el cliente de Realtime Database.
// ¿CÓMO?: Invocando getDatabase con la app inicializada.
// ¿PARA QUÉ?: Ejecutar operaciones de lectura y escritura en el árbol JSON.
const rtdb = getDatabase(app);

/**
 * Función principal para sembrar Realtime Database
 * 
 * ¿POR QUÉ?: Escribir la estructura completa de datos en el nodo raíz de RTDB.
 * ¿CÓMO?: Definiendo un objeto JSON anidado y aplicándolo mediante set(ref(rtdb, '/'), rootData).
 * ¿PARA QUÉ?: Dejar la base de datos lista para pruebas de sincronización en tiempo real.
 */
async function seedRealtimeDB() {
  console.log("🚀 Inicializando datos en Realtime Database (cresernicaragua)...");

  try {
    // ¿POR QUÉ?: Modelar la información global de la plataforma, roles, métricas y auditoría.
    // ¿CÓMO?: Creando una estructura de datos jerárquica y modular en un objeto JavaScript.
    // ¿PARA QUÉ?: Mantener consistencia entre el backend en tiempo real y la interfaz de usuario.
    const rootData = {
      plataforma: {
        nombre: "CreSer",
        descripcion: "Plataforma de Bienestar Emocional y Cuidado Integral",
        version: "3.3.0",
        ambiente: "Producción",
        despliegue_url: "https://cresernicaragua.web.app"
      },
      roles_sistema: {
        ADMIN: {
          descripcion: "Administrador general del sistema",
          cuenta_principal: "xolonica26@gmail.com",
          permisos: ["lectura_total", "escritura_total", "auditoria", "gestion_recursos"]
        },
        AUDITOR: {
          descripcion: "Supervisor de trazabilidad y seguridad",
          permisos: ["lectura_auditoria", "inspeccion_logs", "cumplimiento_privacidad"]
        },
        USUARIO: {
          descripcion: "Usuario estándar de bienestar",
          permisos: ["bienestar", "respirador", "kiri_chat", "multimedia", "diario_privado"]
        }
      },
      metricas_globales: {
        usuarios_activos: 1,
        recursos_disponibles: 6,
        modulos_activos: 10,
        estado_servicios: "Operativo 100%"
      },
      auditoria_reciente: {
        "log_1001": {
          id_evento: "LOG-1001",
          usuario: "xolonica26@gmail.com",
          rol: "ADMIN",
          accion: "Inicialización de Realtime Database",
          timestamp: new Date().toISOString()
        }
      }
    };

    // ¿POR QUÉ?: Guardar todo el árbol de datos en la raíz ('/') de la base de datos.
    // ¿CÓMO?: Utilizando await set() con la referencia raíz generada por ref(rtdb, '/').
    // ¿PARA QUÉ?: Reemplazar/actualizar el estado de la base de datos de manera atómica.
    await set(ref(rtdb, "/"), rootData);

    console.log("✅ ¡Estructura de Realtime Database creada y sincronizada con éxito!");
    // Finalizar el proceso con código 0 de éxito
    process.exit(0);
  } catch (error) {
    // ¿POR QUÉ?: Manejar errores si falla la conexión de red o las reglas de seguridad deniegan la escritura.
    // ¿CÓMO?: Mostrando el mensaje de error en consola y saliendo con código 1.
    // ¿PARA QUÉ?: Facilitar la depuración inmediata durante el despliegue.
    console.error("❌ Error al poblar Realtime Database:", error);
    process.exit(1);
  }
}

// ¿POR QUÉ?: Iniciar la ejecución de la función de siembra.
// ¿CÓMO?: Invocando seedRealtimeDB().
// ¿PARA QUÉ?: Ejecutar el proceso automáticamente al correr el archivo con Node.
seedRealtimeDB();
