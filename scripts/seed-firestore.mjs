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

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBcVDa116djv85HEo0BPf0-6_LOdDfBPHQ",
  authDomain: "cresernicaragua.firebaseapp.com",
  projectId: "cresernicaragua",
  storageBucket: "cresernicaragua.firebasestorage.app",
  messagingSenderId: "826974092135",
  appId: "1:826974092135:web:2f7158a99519cd3bd2cdc2",
  measurementId: "G-FL857SSYHW"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedFirestore() {
  console.log("🌱 Iniciando población de colecciones en Cloud Firestore...");

  try {
    // 1. Colección: usuarios (3 Roles)
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

    for (const u of usuarios) {
      const docRef = await addDoc(collection(db, "usuarios"), u);
      console.log(`✓ Usuario creado [${u.rol}]: ${u.email} (ID: ${docRef.id})`);
    }

    // 2. Colección: auditoria_logs
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

    for (const l of logs) {
      const docRef = await addDoc(collection(db, "auditoria_logs"), l);
      console.log(`✓ Log de auditoría registrado: ${l.id_evento} (ID: ${docRef.id})`);
    }

    // 3. Colección: recursos
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

    for (const r of recursos) {
      const docRef = await addDoc(collection(db, "recursos"), r);
      console.log(`✓ Recurso educativo creado: ${r.titulo} (ID: ${docRef.id})`);
    }

    // 4. Colección: registros_emocionales
    const emociones = [
      {
        usuario: "andrea@ejemplo.com",
        estado_emocional: "tranquilo",
        nota: "Sesión de respiración 4-4-4 completada",
        racha_dias: 7,
        fecha: new Date()
      }
    ];

    for (const e of emociones) {
      const docRef = await addDoc(collection(db, "registros_emocionales"), e);
      console.log(`✓ Registro emocional creado para: ${e.usuario} (ID: ${docRef.id})`);
    }

    console.log("\n🎉 ¡Todas las colecciones de Firestore han sido creadas y pobladas con éxito!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al poblar Firestore:", error);
    process.exit(1);
  }
}

seedFirestore();
