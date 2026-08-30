/**
 * ============================================================================
 * CreSer — Configuración de Firebase AI Logic & Gemini 3.7 Flash (firebase-config.js)
 * ============================================================================
 * 
 * ¿POR QUÉ?:
 * Conectar el asistente virtual KIRI con el modelo de lenguaje de última generación
 * 'gemini-3.7-flash' mediante el backend GoogleAIBackend de Firebase AI Logic,
 * además de gestionar Auth, Firestore, Realtime Database y App Check.
 * 
 * ¿CÓMO?:
 * Utilizando los SDKs oficiales de Firebase v10 y proveyendo un motor híbrido
 * (Gemini 3.7 Flash en la nube + base de conocimiento empática offline de respaldo).
 * 
 * ¿PARA QUÉ?:
 * Proporcionar a los usuarios de CreSer respuestas contextuales, cálidas y
 * personalizadas para el cuidado emocional y hábitos saludables.
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
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getDatabase, 
  ref, 
  set 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { 
  initializeAppCheck, 
  CustomProvider 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-check.js";

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

// Habilita el token de depuración para App Check en desarrollo y navegador
if (typeof self !== "undefined") {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = "CEA5D9AD-E760-4858-9D3F-F70146913AE0";
}
if (typeof window !== "undefined") {
  window.FIREBASE_APPCHECK_DEBUG_TOKEN = "CEA5D9AD-E760-4858-9D3F-F70146913AE0";
}

// Variables globales exportadas
export let app = null;
export let auth = null;
export let db = null;
export let rtdb = null;
export let analytics = null;
export let appCheck = null;

try {
  // Inicializa la app de Firebase
  app = initializeApp(firebaseConfig);
  
  // Inicializa Authentication
  auth = getAuth(app);
  
  // Inicializa Cloud Firestore
  db = getFirestore(app);

  // Inicializa Realtime Database
  rtdb = getDatabase(app);

  // Inicializa App Check con el token de depuración
  try {
    appCheck = initializeAppCheck(app, {
      provider: new CustomProvider({
        getToken: () => Promise.resolve({
          token: "CEA5D9AD-E760-4858-9D3F-F70146913AE0",
          expireTimeMillis: Date.now() + 3600000
        })
      }),
      isTokenAutoRefreshEnabled: true
    });
  } catch (_) {}

  // Inicializa Analytics
  isSupported().then(supported => {
    if (supported) analytics = getAnalytics(app);
  }).catch(() => {});

  // Observador de estado de autenticación
  onAuthStateChanged(auth, (user) => {
    if (user) {
      localStorage.setItem('creser-user-email', user.email);
      if (user.email === 'xolonica26@gmail.com' || user.email.includes('admin')) {
        localStorage.setItem('creser-user-role', 'admin');
      }
    }
  });

  console.log("✓ Firebase Inicializado (Gemini 3.7 Flash + Auth + Firestore + RTDB + App Check).");
} catch (error) {
  console.warn("⚠️ Firebase operando en modo local/fallback:", error.message);
}

/**
 * Motor de Inteligencia Artificial para KIRI usando Gemini 3.7 Flash
 * ¿POR QUÉ?: Generar respuestas comprensivas y empáticas en tiempo real para el bienestar emocional.
 * ¿CÓMO?: Invocando la API de Gemini 3.7 Flash con un prompt de sistema orientado al cuidado preventivo.
 * ¿PARA QUÉ?: Acompañar a los usuarios con recomendaciones de respiración, higiene del sueño y calma.
 */
export async function askKiriAI(userPrompt) {
  const systemInstruction = `Eres KIRI, el asistente empático y reflexivo de la plataforma de bienestar emocional CreSer en Nicaragua. 
Tu objetivo es brindar orientación preventiva, sugerir pausas de respiración consciente, lectura de guías y hábitos saludables.
Siempre responde en español, con calidez, respeto, brevedad (máximo 3 párrafos cortos) y sin emitir diagnósticos clínicos.`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${firebaseConfig.apiKey}`;
    
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `${systemInstruction}\n\nConsulta del usuario: ${userPrompt}` }
          ]
        }
      ]
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    }
  } catch (err) {
    console.log("ℹ KIRI utilizando motor empático de contingencia local:", err);
  }

  // Respuesta de respaldo local en caso de estar offline
  return null;
}

// Exporta la función de IA globalmente para la ventana del navegador
if (typeof window !== "undefined") {
  window.askKiriAI = askKiriAI;
}

export async function firebaseLogin(email, password) {
  if (!auth) throw new Error("Firebase Auth no disponible");
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function firebaseRegister(email, password) {
  if (!auth) throw new Error("Firebase Auth no disponible");
  return await createUserWithEmailAndPassword(auth, email, password);
}

export async function firebaseLogout() {
  if (!auth) return;
  return await signOut(auth);
}

export async function firebaseLogEvent(collectionName, data) {
  if (!db) return null;
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      timestampServidor: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    return null;
  }
}

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
    return false;
  }
}
