# CreSer — Plataforma de Bienestar Emocional y Crecimiento Personal

> Un espacio digital accesible, modular y seguro diseñado para el autoconocimiento, la gestión de las emociones y la adopción de hábitos de vida saludables, acompañado por el asistente virtual de orientación **KIRI**.

---

## 🌟 Descripción General

**CreSer** es una aplicación web multipágina (MPA) organizada modularmente para un rendimiento ligero, carga rápida y navegación limpia. Cada sección de la plataforma cuenta con su propio archivo HTML independiente, estilos centralizados y código ampliamente comentado con fines pedagógicos y de mantenimiento profesional.

---

## ✨ Estructura de Páginas y Módulos

| Página / Archivo | Propósito y Contenido |
| :--- | :--- |
| **`index.html`** | 🏠 **Página Principal**: Sección Hero con métricas, estadísticas en tiempo real y pilares de cuidado emocional. |
| **`pages/bienestar.html`** | 💚 **Centro de Bienestar**: Selector interactivo de estado de ánimo, mensajes reflexivos, racha y progresos. |
| **`pages/recursos.html`** | 📚 **Biblioteca Educativa**: Buscador en tiempo real y filtros dinámicos por artículos, guías, podcasts, videos e infografías. |
| **`pages/herramientas.html`** | 🫁 **Herramientas de Autocuidado**: Respirador rítmico guiado 4-4-4 y diario personal privado con `localStorage`. |
| **`pages/kiri.html`** | 🤖 **Asistente Virtual KIRI**: Chat conversacional con respuestas inteligentes, sugerencias rápidas y uso responsable. |
| **`pages/multimedia.html`** | 🎧 **Multimedia & Relax**: Sintetizador nativo con *Web Audio API* (*Lluvia, Bosque, Olas y 432 Hz*) y visualizador. |
| **`pages/comunidad.html`** | 👥 **Espacios Comunitarios**: Círculos de diálogo temáticos, talleres virtuales y normas de convivencia. |
| **`pages/ayuda.html`** | 🛟 **Ayuda Profesional**: Directorios verificados de terapeutas, líneas de emergencia 24/7 y preguntas frecuentes. |
| **`pages/perfil.html`** | 👤 **Perfil & Accesibilidad**: Modo oscuro, texto aumentado, gestión de sesión y exportación/borrado de datos. |
| **`pages/login.html`** | 🔐 **Portal de Autenticación**: Tarjeta *glassmorphic* con alternancia fluida entre *Iniciar Sesión* y *Crear Cuenta*. |

---

## 📁 Árbol del Proyecto

```text
XOLONICA-CRESER/
├── index.html                 # 🏠 Página de inicio principal
├── README.md                  # 📖 Documentación completa
├── pages/                     # 📄 Páginas individuales del sitio
│   ├── bienestar.html         # 💚 Monitoreo de ánimo y hábitos
│   ├── recursos.html          # 📚 Biblioteca con buscador y filtros
│   ├── herramientas.html      # 🫁 Respiración 4-4-4 y diario
│   ├── kiri.html              # 🤖 Asistente virtual KIRI
│   ├── multimedia.html        # 🎧 Reproductor de sonidos relajantes
│   ├── comunidad.html         # 👥 Círculos y talleres
│   ├── ayuda.html             # 🛟 Directorio y líneas de asistencia
│   ├── perfil.html            # 👤 Ajustes, modo oscuro y privacidad
│   └── login.html             # 🔐 Acceso y registro
└── assets/                    # 📦 Recursos compartidos
    ├── css/
    │   ├── main.css           # 🎨 Estilos globales y animaciones
    │   └── auth.css           # 💎 Estilos glassmorphism de acceso
    ├── js/
    │   ├── app.js             # ⚙️ Lógica modular (KIRI, audio, respirador)
    │   └── auth.js            # 🔑 Controlador de autenticación
    └── img/                   # 🖼️ Galería de imágenes y recursos
        ├── valores.gif
        ├── cuidado.gif
        ├── libros.gif
        ├── arte-de-ia.gif
        ├── archivo.gif
        ├── archivo.png
        ├── agave.gif
        ├── cultivo-de-semillas.gif
        ├── pensamiento-positivo.gif
        ├── relajarse.gif
        ├── tranquilidad.jpeg
        └── 4k-bosque-7sfd6znw2ry6hnlt.jpg
```

---

## 🚀 Cómo Ejecutar el Proyecto Localmente

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/xolonica26/XOLONICA-CRESER.git
   cd XOLONICA-CRESER
   ```

2. **Abrir en tu navegador**:
   - Haz doble clic en `index.html` para abrir la página principal y navegar por todas las secciones.

---

## 🛠️ Tecnologías y Estándares

- **HTML5 Multipágina**: Semántica estricta (`header`, `main`, `nav`, `aside`, `section`, `footer`) y accesibilidad ARIA.
- **CSS3 Moderno**: Variables personalizadas, Glassmorphism con `backdrop-filter`, diseño responsivo y animaciones fluidas.
- **JavaScript ES6+**: Módulos desacoplados, Web Audio API para síntesis sonora y Web Storage API (`localStorage`).
- **Código Comentado**: Documentación exhaustiva en cada archivo y función para facilitar el aprendizaje y soporte.

---

## ⚠️ Uso Responsable y Alcance

> **Aviso Importante**: CreSer y el asistente virtual KIRI ofrecen contenidos informativos, psicoeducativos y preventivos. **No constituyen un servicio de diagnóstico clínico ni reemplazan la atención médica o psicológica profesional**. Ante situaciones de crisis aguda o emergencia, se recomienda contactar de inmediato a los servicios de salud oficiales de tu localidad.

---

© 2026 **CreSer** — Plataforma de Bienestar Emocional y Cuidado Integral.