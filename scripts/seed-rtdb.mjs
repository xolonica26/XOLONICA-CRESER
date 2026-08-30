/**
 * ============================================================================
 * CreSer — Población Inicial de Realtime Database (seed-rtdb.mjs)
 * ============================================================================
 */

import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

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

const app = initializeApp(firebaseConfig);
const rtdb = getDatabase(app);

async function seedRealtimeDB() {
  console.log("🚀 Inicializando datos en Realtime Database (cresernicaragua)...");

  try {
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
          accion: "Configuración y activación de Realtime Database y App Check",
          fecha: new Date().toISOString()
        }
      }
    };

    await set(ref(rtdb, "/"), rootData);
    console.log("🎉 ¡Realtime Database poblada con éxito!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error poblando Realtime Database:", error);
    process.exit(1);
  }
}

seedRealtimeDB();
