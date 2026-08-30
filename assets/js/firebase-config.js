/**
 * ============================================================================
 * CreSer — Configuración y Conexión con Google Firebase SDK (firebase-config.js)
 * ============================================================================
 * 
 * ¿POR QUÉ?:
 * Integrar servicios en la nube de Google Firebase (Autenticación, Analytics,
 * Firestore / Base de Datos en la nube) para respaldar la plataforma CreSer
 * con infraestructura escalable, segura y en tiempo real.
 * 
 * ¿CÓMO?:
 * Importando los módulos oficiales de Firebase SDK (v10 ES Modules) y proveyendo
 * inicialización segura con control de excepciones y modo offline de respaldo.
 * 
 * ¿PARA QUÉ?:
 * Permitir autenticación en la nube, sincronización de registros de bienestar,
 * telemetría anónima de uso y persistencia en servidores de Google Cloud.
 * ============================================================================
 */

// Importación de módulos oficiales de Firebase SDK mediante CDN ES Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * Objeto de Configuración del Proyecto Firebase "cresernicaragua"
 * ¿POR QUÉ?: Contiene las credenciales y puntos de enlace únicos asignados por la consola de Google.
 * ¿CÓMO?: Parámetros estructurados según la especificación de Firebase JS SDK v7.20.0+.
 * ¿PARA QUÉ?: Establecer la conexión autenticada con los servicios del backend.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyBcVDa116djv85HEo0BPf0-6_LOdDfBPHQ",
  authDomain: "cresernicaragua.firebaseapp.com",
  projectId: "cresernicaragua",
  storageBucket: "cresernicaragua.firebasestorage.app",
  messagingSenderId: "826974092135",
  appId: "1:826974092135:web:2f7158a99519cd3bd2cdc2",
  measurementId: "G-FL857SSYHW"
};

// Variables globales exportadas para los servicios de Firebase
export let app = null;
export let auth = null;
export let db = null;
export let analytics = null;

try {
  // Inicializa la aplicación Firebase principal
  app = initializeApp(firebaseConfig);
  
  // Inicializa el servicio de autenticación
  auth = getAuth(app);
  
  // Inicializa la base de datos Firestore
  db = getFirestore(app);

  // Inicializa Google Analytics si el entorno lo soporta (entornos HTTPS / Web)
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("✓ Firebase Analytics inicializado correctamente.");
    }
  }).catch(() => {
    console.log("ℹ Firebase Analytics en modo local o restringido.");
  });

  console.log("✓ Firebase conectado exitosamente al proyecto: cresernicaragua");
} catch (error) {
  console.warn("⚠️ Firebase operando en modo local/fallback:", error.message);
}

/**
 * Función auxiliar para iniciar sesión con Firebase Auth
 * ¿POR QUÉ?: Validar credenciales de usuarios contra el directorio de identidades de Google Firebase.
 * ¿CÓMO?: Invocando signInWithEmailAndPassword con manejo asíncrono de promesas.
 * ¿PARA QUÉ?: Otorgar acceso seguro a los usuarios registrados.
 */
export async function firebaseLogin(email, password) {
  if (!auth) throw new Error("Firebase Auth no disponible en modo offline");
  return await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Función auxiliar para registrar nuevos usuarios con Firebase Auth
 * ¿POR QUÉ?: Crear cuentas de usuario seguras con contraseñas encriptadas.
 * ¿CÓMO?: Invocando createUserWithEmailAndPassword.
 * ¿PARA QUÉ?: Permitir el auto-registro de participantes en la plataforma.
 */
export async function firebaseRegister(email, password) {
  if (!auth) throw new Error("Firebase Auth no disponible en modo offline");
  return await createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Función auxiliar para cerrar sesión
 * ¿POR QUÉ?: Invalidar el token de sesión activo por seguridad.
 * ¿CÓMO?: Llamando a signOut(auth).
 * ¿PARA QUÉ?: Proteger la cuenta al abandonar un equipo compartido.
 */
export async function firebaseLogout() {
  if (!auth) return;
  return await signOut(auth);
}

/**
 * Función auxiliar para registrar eventos de auditoría o estados en Firestore
 * ¿POR QUÉ?: Centralizar la trazabilidad y registros emocionales en la base de datos en la nube.
 * ¿CÓMO?: Insertando documentos en la colección 'auditoria' o 'emociones' con timestamp del servidor.
 * ¿PARA QUÉ?: Garantizar la persistencia y consulta de logs por parte del rol Auditor.
 */
export async function firebaseLogEvent(collectionName, data) {
  if (!db) return null;
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      timestampServidor: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    console.warn("No se pudo escribir en Firestore (usando log local):", err);
    return null;
  }
}
