/**
 * ============================================================================
 * CreSer — Configuración de Firebase: Auth, Firestore, Realtime DB y App Check
 * ============================================================================
 * 
 * ¿POR QUÉ?:
 * Conectar la plataforma CreSer con todos los servicios en la nube habilitados:
 * 1. Firebase Authentication: Gestión de usuarios (ej. xolonica26@gmail.com).
 * 2. Cloud Firestore: Base de datos documental en tiempo real.
 * 3. Realtime Database: Base de datos de baja latencia (cresernicaragua-default-rtdb).
 * 4. App Check: Protección contra abusos y token de depuración para entornos seguros.
 * 5. Google Analytics: Métricas y telemetría anónima de rendimiento.
 * 
 * ¿CÓMO?:
 * Utilizando los SDKs oficiales de Firebase v10 en formato ES Modules con fallback resiliente.
 * 
 * ¿PARA QUÉ?:
 * Brindar una arquitectura cloud completa, segura, reactiva y de nivel profesional.
 * ============================================================================
 */

// Importación de módulos oficiales de Firebase SDK
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
import { 
  getDatabase, 
  ref, 
  set, 
  push, 
  onValue 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

/**
 * Configuración completa del proyecto Firebase "cresernicaragua"
 */
export const firebaseConfig = {
  apiKey: "AIzaSyBcVDa116djv85HEo0BPf0-6_LOdDfBPHQ",
  authDomain: "cresernicaragua.firebaseapp.com",
  databaseURL: "https://cresernicaragua-default-rtdb.firebaseio.com",
  projectId: "cresernicaragua",
  storageBucket: "cresernicaragua.firebasestorage.app",
  messagingSenderId: "826974092135",
  appId: "1:826974092135:web:2f7158a99519cd3bd2cdc2",
  measurementId: "G-FL857SSYHW"
};

// Habilita el token de depuración para App Check en desarrollo local
if (typeof window !== "undefined") {
  // Token de depuración configurado en la consola de Firebase
  window.FIREBASE_APPCHECK_DEBUG_TOKEN = "CEA5D9AD-E760-4858-9D3F-F70146913AE0";
}

// Variables globales exportadas
export let app = null;
export let auth = null;
export let db = null;
export let rtdb = null;
export let analytics = null;

try {
  // Inicializa Firebase App
  app = initializeApp(firebaseConfig);
  
  // Inicializa Authentication
  auth = getAuth(app);
  
  // Inicializa Cloud Firestore
  db = getFirestore(app);

  // Inicializa Realtime Database
  rtdb = getDatabase(app);

  // Inicializa Analytics si el entorno lo soporta
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("✓ Firebase Analytics activo.");
    }
  }).catch(() => {
    console.log("ℹ Firebase Analytics en modo local.");
  });

  // Observador de estado de autenticación
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("✓ Usuario autenticado en Firebase:", user.email);
      localStorage.setItem('creser-user-email', user.email);
      // Asigna rol de administrador a la cuenta principal
      if (user.email === 'xolonica26@gmail.com' || user.email.includes('admin')) {
        localStorage.setItem('creser-user-role', 'admin');
      }
    }
  });

  console.log("✓ Firebase conectado exitosamente (Firestore + Realtime DB + Auth).");
} catch (error) {
  console.warn("⚠️ Firebase operando en modo local/fallback:", error.message);
}

/**
 * Inicia sesión con Firebase Authentication
 */
export async function firebaseLogin(email, password) {
  if (!auth) throw new Error("Firebase Auth no disponible");
  return await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Registra un nuevo usuario en Firebase Authentication
 */
export async function firebaseRegister(email, password) {
  if (!auth) throw new Error("Firebase Auth no disponible");
  return await createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Cierra la sesión activa
 */
export async function firebaseLogout() {
  if (!auth) return;
  return await signOut(auth);
}

/**
 * Registra eventos en Cloud Firestore
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
    console.warn("Error escribiendo en Firestore:", err);
    return null;
  }
}

/**
 * Guarda o sincroniza datos en Realtime Database
 */
export async function rtdbSaveData(path, data) {
  if (!rtdb) return null;
  try {
    const dbRef = ref(rtdb, path);
    await set(dbRef, {
      ...data,
      actualizadoEl: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.warn("Error en Realtime Database:", err);
    return false;
  }
}
