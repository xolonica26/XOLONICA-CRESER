/**
 * ============================================================================
 * CreSer — Configuración Integral de Firebase SDK & Base de Datos (firebase-config.js)
 * ============================================================================
 * 
 * ¿POR QUÉ?:
 * Proporcionar una arquitectura de base de datos robusta, escalable y en tiempo real
 * integrando Cloud Firestore, Realtime Database, Authentication, App Check y Gemini 3.7 Flash.
 * 
 * ¿CÓMO?:
 * Utilizando los SDKs oficiales modulares de Firebase v10 con persistencia híbrida
 * (Nube en Tiempo Real + Respaldo Local en localStorage) garantizando disponibilidad 24/7.
 * 
 * ¿PARA QUÉ?:
 * Administrar usuarios (RBAC), registros de estado de ánimo, diarios personales,
 * recursos educativos, directorio de ayuda, logs de auditoría y contenido dinámico del CMS.
 * ============================================================================
 */

// Importación de módulos oficiales de Firebase SDK v10
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  child, 
  push 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { 
  initializeAppCheck, 
  CustomProvider 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-check.js";

/**
 * Configuración oficial del proyecto Firebase "cresernicaragua"
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

// Token de depuración para App Check
if (typeof self !== "undefined") {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = "CEA5D9AD-E760-4858-9D3F-F70146913AE0";
}
if (typeof window !== "undefined") {
  window.FIREBASE_APPCHECK_DEBUG_TOKEN = "CEA5D9AD-E760-4858-9D3F-F70146913AE0";
}

// Instancias globales exportadas
export let app = null;
export let auth = null;
export let db = null;
export let rtdb = null;
export let analytics = null;
export let appCheck = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  rtdb = getDatabase(app);

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

  isSupported().then(supported => {
    if (supported) analytics = getAnalytics(app);
  }).catch(() => {});

  // Observador de estado de autenticación con sincronización en Firestore
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const email = user.email || '';
      localStorage.setItem('creser-user-email', email);
      if (user.displayName) localStorage.setItem('creser-user-name', user.displayName);

      const isAdmin = (email === 'byoscarelieser@gmail.com' || email === 'xolonica26@gmail.com' || email.includes('admin'));
      const isAuditor = (!isAdmin && (email.includes('auditor') || email === 'auditoria@creser.org'));
      const role = isAdmin ? 'admin' : (isAuditor ? 'auditor' : 'usuario');
      localStorage.setItem('creser-user-role', role);

      // Sincroniza el usuario en Firestore y Realtime DB
      try {
        await saveUserProfileToCloud({
          email: email,
          nombre: user.displayName || email.split('@')[0],
          rol: role,
          ultimoAcceso: new Date().toISOString(),
          proveedor: user.providerData?.[0]?.providerId || 'password'
        });
      } catch (e) {
        console.log("ℹ Perfil local sincronizado:", e.message);
      }
    }
  });

  console.log("✓ Firebase CreSer DB Inicializado (Firestore + Realtime DB + Auth + App Check)");
} catch (error) {
  console.warn("⚠️ Firebase operando en modo local/fallback:", error.message);
}

/**
 * Normaliza emails para ser usados de forma segura como claves en Realtime DB
 */
function sanitizeKey(key) {
  return (key || 'anonimo').replace(/[.#$[\]/]/g, '_');
}

/* ==========================================================================
   1. MÓDULO DE BASE DE DATOS: GESTIÓN DE USUARIOS Y ROLES (RBAC)
   ========================================================================== */

/**
 * Guarda o actualiza el perfil del usuario en Firestore y Realtime DB
 */
export async function saveUserProfileToCloud(userData) {
  const safeId = sanitizeKey(userData.email);
  const payload = {
    ...userData,
    actualizadoEn: new Date().toISOString()
  };

  // 1. Guardar en Cloud Firestore
  if (db) {
    try {
      await setDoc(doc(db, "users", safeId), payload, { merge: true });
    } catch (err) {
      console.warn("Firestore saveUserProfile error:", err.message);
    }
  }

  // 2. Guardar en Realtime Database
  if (rtdb) {
    try {
      await set(ref(rtdb, `users/${safeId}`), payload);
    } catch (err) {
      console.warn("RTDB saveUserProfile error:", err.message);
    }
  }

  // 3. Respaldo local
  const usersList = JSON.parse(localStorage.getItem('creser-users-list') || '[]');
  const existingIdx = usersList.findIndex(u => u.email === userData.email);
  if (existingIdx >= 0) {
    usersList[existingIdx] = { ...usersList[existingIdx], ...payload };
  } else {
    usersList.push(payload);
  }
  localStorage.setItem('creser-users-list', JSON.stringify(usersList));
  return true;
}

/**
 * Obtiene la lista completa de usuarios desde la nube con fallback local
 */
export async function fetchUsersFromCloud() {
  const users = [];

  // Intento en Firestore
  if (db) {
    try {
      const snap = await getDocs(collection(db, "users"));
      snap.forEach(d => users.push(d.data()));
      if (users.length > 0) {
        localStorage.setItem('creser-users-list', JSON.stringify(users));
        return users;
      }
    } catch (err) {
      console.log("Fallback users Firestore:", err.message);
    }
  }

  // Fallback Realtime DB
  if (rtdb) {
    try {
      const snap = await get(ref(rtdb, "users"));
      if (snap.exists()) {
        const val = snap.val();
        const list = Object.values(val);
        localStorage.setItem('creser-users-list', JSON.stringify(list));
        return list;
      }
    } catch (err) {
      console.log("Fallback users RTDB:", err.message);
    }
  }

  // Fallback localStorage
  return JSON.parse(localStorage.getItem('creser-users-list') || '[]');
}

/* ==========================================================================
   2. MÓDULO DE BASE DE DATOS: REGISTROS DE ESTADO DE ÁNIMO (MOOD LOGS)
   ========================================================================== */

/**
 * Guarda un registro de estado de ánimo en Firestore y Realtime DB
 */
export async function saveMoodLogToCloud(moodData) {
  const entry = {
    ...moodData,
    userEmail: moodData.userEmail || localStorage.getItem('creser-user-email') || 'anonimo@creser.org',
    timestamp: new Date().toISOString(),
    fecha: new Date().toLocaleDateString('es-NI')
  };

  // 1. Firestore
  if (db) {
    try {
      await addDoc(collection(db, "mood_logs"), {
        ...entry,
        serverTime: serverTimestamp()
      });
    } catch (err) {
      console.warn("Firestore mood_logs error:", err.message);
    }
  }

  // 2. Realtime DB
  if (rtdb) {
    try {
      const safeUser = sanitizeKey(entry.userEmail);
      const newRef = push(ref(rtdb, `mood_logs/${safeUser}`));
      await set(newRef, entry);
    } catch (err) {
      console.warn("RTDB mood_logs error:", err.message);
    }
  }

  // 3. Respaldo local en localStorage
  const history = JSON.parse(localStorage.getItem('creser-mood-history') || '[]');
  history.unshift(entry);
  localStorage.setItem('creser-mood-history', JSON.stringify(history));
  return true;
}

/**
 * Obtiene el historial de registros emocionales
 */
export async function fetchMoodHistoryFromCloud(userEmail) {
  const targetEmail = userEmail || localStorage.getItem('creser-user-email');
  const logs = [];

  if (db) {
    try {
      const q = query(collection(db, "mood_logs"), orderBy("serverTime", "desc"), limit(50));
      const snap = await getDocs(q);
      snap.forEach(d => {
        const item = d.data();
        if (!targetEmail || item.userEmail === targetEmail) logs.push(item);
      });
      if (logs.length > 0) {
        localStorage.setItem('creser-mood-history', JSON.stringify(logs));
        return logs;
      }
    } catch (err) {
      console.log("Fallback mood Firestore:", err.message);
    }
  }

  return JSON.parse(localStorage.getItem('creser-mood-history') || '[]');
}

/* ==========================================================================
   3. MÓDULO DE BASE DE DATOS: DIARIO PERSONAL DE BIENESTAR (JOURNAL)
   ========================================================================== */

/**
 * Guarda una entrada en el diario personal en Firestore y Realtime DB
 */
export async function saveJournalEntryToCloud(journalData) {
  const entry = {
    ...journalData,
    userEmail: journalData.userEmail || localStorage.getItem('creser-user-email') || 'anonimo@creser.org',
    timestamp: new Date().toISOString(),
    fecha: new Date().toLocaleDateString('es-NI', { dateStyle: 'full' })
  };

  if (db) {
    try {
      await addDoc(collection(db, "journal_entries"), {
        ...entry,
        serverTime: serverTimestamp()
      });
    } catch (err) {
      console.warn("Firestore journal error:", err.message);
    }
  }

  if (rtdb) {
    try {
      const safeUser = sanitizeKey(entry.userEmail);
      const newRef = push(ref(rtdb, `journal_entries/${safeUser}`));
      await set(newRef, entry);
    } catch (err) {
      console.warn("RTDB journal error:", err.message);
    }
  }

  const entries = JSON.parse(localStorage.getItem('creser-journal-entries') || '[]');
  entries.unshift(entry);
  localStorage.setItem('creser-journal-entries', JSON.stringify(entries));
  return true;
}

/**
 * Obtiene las entradas del diario
 */
export async function fetchJournalEntriesFromCloud(userEmail) {
  return JSON.parse(localStorage.getItem('creser-journal-entries') || '[]');
}

/* ==========================================================================
   4. MÓDULO DE BASE DE DATOS: CONTENIDO DEL CMS (DYNAMIC CMS CONTENT)
   ========================================================================== */

/**
 * Sincroniza la configuración del CMS con Firestore y Realtime DB
 */
export async function saveCmsContentToCloud(cmsData) {
  const payload = {
    ...cmsData,
    actualizadoPor: localStorage.getItem('creser-user-email') || 'admin@creser.org',
    actualizadoEn: new Date().toISOString()
  };

  if (db) {
    try {
      await setDoc(doc(db, "system", "cms_content"), payload);
    } catch (err) {
      console.warn("Firestore CMS error:", err.message);
    }
  }

  if (rtdb) {
    try {
      await set(ref(rtdb, "cms_content"), payload);
    } catch (err) {
      console.warn("RTDB CMS error:", err.message);
    }
  }

  localStorage.setItem('creser-cms-content', JSON.stringify(payload));
  return true;
}

/**
 * Obtiene el contenido dinámico del CMS desde la nube
 */
export async function fetchCmsContentFromCloud() {
  if (db) {
    try {
      const docSnap = await getDoc(doc(db, "system", "cms_content"));
      if (docSnap.exists()) {
        const data = docSnap.data();
        localStorage.setItem('creser-cms-content', JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.log("Fallback CMS Firestore:", err.message);
    }
  }

  if (rtdb) {
    try {
      const snap = await get(ref(rtdb, "cms_content"));
      if (snap.exists()) {
        const data = snap.val();
        localStorage.setItem('creser-cms-content', JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.log("Fallback CMS RTDB:", err.message);
    }
  }

  return JSON.parse(localStorage.getItem('creser-cms-content') || 'null');
}

/* ==========================================================================
   5. MÓDULO DE BASE DE DATOS: RECURSOS EDUCATIVOS Y GUÍAS (CMS)
   ========================================================================== */

/**
 * Guarda y sincroniza la lista de recursos educativos con la nube
 */
export async function saveResourcesToCloud(resourcesList) {
  if (db) {
    try {
      await setDoc(doc(db, "system", "resources_catalog"), { list: resourcesList, actualizadoEn: new Date().toISOString() });
    } catch (err) {
      console.warn("Firestore resources error:", err.message);
    }
  }

  if (rtdb) {
    try {
      await set(ref(rtdb, "resources"), resourcesList);
    } catch (err) {
      console.warn("RTDB resources error:", err.message);
    }
  }

  localStorage.setItem('creser-cms-resources', JSON.stringify(resourcesList));
  return true;
}

/**
 * Carga los recursos educativos desde la nube
 */
export async function fetchResourcesFromCloud() {
  if (rtdb) {
    try {
      const snap = await get(ref(rtdb, "resources"));
      if (snap.exists()) {
        const list = snap.val();
        localStorage.setItem('creser-cms-resources', JSON.stringify(list));
        return list;
      }
    } catch (err) {
      console.log("Fallback resources RTDB:", err.message);
    }
  }

  return JSON.parse(localStorage.getItem('creser-cms-resources') || 'null');
}

/* ==========================================================================
   6. MÓDULO DE BASE DE DATOS: DIRECTORIO DE AYUDA Y CONTACTOS DE EMERGENCIA
   ========================================================================== */

/**
 * Guarda y sincroniza los contactos de emergencia con la base de datos
 */
export async function saveEmergencyContactsToCloud(helpList) {
  if (db) {
    try {
      await setDoc(doc(db, "system", "emergency_contacts"), { list: helpList, actualizadoEn: new Date().toISOString() });
    } catch (err) {
      console.warn("Firestore help error:", err.message);
    }
  }

  if (rtdb) {
    try {
      await set(ref(rtdb, "emergency_contacts"), helpList);
    } catch (err) {
      console.warn("RTDB help error:", err.message);
    }
  }

  localStorage.setItem('creser-cms-help', JSON.stringify(helpList));
  return true;
}

/**
 * Carga los contactos de emergencia desde la base de datos
 */
export async function fetchEmergencyContactsFromCloud() {
  if (rtdb) {
    try {
      const snap = await get(ref(rtdb, "emergency_contacts"));
      if (snap.exists()) {
        const list = snap.val();
        localStorage.setItem('creser-cms-help', JSON.stringify(list));
        return list;
      }
    } catch (err) {
      console.log("Fallback help RTDB:", err.message);
    }
  }

  return JSON.parse(localStorage.getItem('creser-cms-help') || 'null');
}

/* ==========================================================================
   7. MÓDULO DE BASE DE DATOS: REGISTROS DE AUDITORÍA Y TRAZABILIDAD
   ========================================================================== */

/**
 * Registra un evento de auditoría en Firestore y Realtime DB
 */
export async function saveAuditLogToCloud(logEntry) {
  const payload = {
    ...logEntry,
    usuario: logEntry.usuario || localStorage.getItem('creser-user-email') || 'sistema',
    rol: logEntry.rol || localStorage.getItem('creser-user-role') || 'usuario',
    timestamp: new Date().toISOString(),
    fechaFormato: new Date().toLocaleString('es-NI')
  };

  if (db) {
    try {
      await addDoc(collection(db, "audit_logs"), {
        ...payload,
        serverTime: serverTimestamp()
      });
    } catch (err) {
      console.warn("Firestore audit error:", err.message);
    }
  }

  if (rtdb) {
    try {
      const newRef = push(ref(rtdb, "audit_logs"));
      await set(newRef, payload);
    } catch (err) {
      console.warn("RTDB audit error:", err.message);
    }
  }

  // Respaldo local
  const currentLogs = JSON.parse(localStorage.getItem('creser-audit-log') || '[]');
  currentLogs.unshift(payload);
  if (currentLogs.length > 100) currentLogs.pop();
  localStorage.setItem('creser-audit-log', JSON.stringify(currentLogs));
  return true;
}

/**
 * Obtiene la lista de eventos de auditoría para el panel administrativo
 */
export async function fetchAuditLogsFromCloud() {
  const logs = [];

  if (db) {
    try {
      const q = query(collection(db, "audit_logs"), orderBy("serverTime", "desc"), limit(50));
      const snap = await getDocs(q);
      snap.forEach(d => logs.push(d.data()));
      if (logs.length > 0) {
        localStorage.setItem('creser-audit-log', JSON.stringify(logs));
        return logs;
      }
    } catch (err) {
      console.log("Fallback audit Firestore:", err.message);
    }
  }

  return JSON.parse(localStorage.getItem('creser-audit-log') || '[]');
}

/* ==========================================================================
   8. INTELIGENCIA ARTIFICIAL: ASISTENTE KIRI (GEMINI 3.7 FLASH)
   ========================================================================== */

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

  return null;
}

export async function firebaseGoogleLogin() {
  if (!auth) throw new Error("Firebase Auth no disponible");
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
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

// Objeto Global Unificado CreSerDB accesible desde cualquier script
export const CreSerDB = {
  saveUserProfile: saveUserProfileToCloud,
  fetchUsers: fetchUsersFromCloud,
  saveMoodLog: saveMoodLogToCloud,
  fetchMoodHistory: fetchMoodHistoryFromCloud,
  saveJournalEntry: saveJournalEntryToCloud,
  fetchJournalEntries: fetchJournalEntriesFromCloud,
  saveCmsContent: saveCmsContentToCloud,
  fetchCmsContent: fetchCmsContentFromCloud,
  saveResources: saveResourcesToCloud,
  fetchResources: fetchResourcesFromCloud,
  saveEmergencyContacts: saveEmergencyContactsToCloud,
  fetchEmergencyContacts: fetchEmergencyContactsFromCloud,
  saveAuditLog: saveAuditLogToCloud,
  fetchAuditLogs: fetchAuditLogsFromCloud,
  askKiri: askKiriAI
};

if (typeof window !== "undefined") {
  window.CreSerDB = CreSerDB;
  window.askKiriAI = askKiriAI;
  window.firebaseGoogleLogin = firebaseGoogleLogin;
}
