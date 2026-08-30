# CreSer — Plataforma de Bienestar Emocional y Crecimiento Personal

> Un espacio digital accesible, seguro y reflexivo diseñado para el autoconocimiento, la gestión de las emociones y la adopción de hábitos de vida saludables, acompañado por el asistente virtual de orientación **KIRI**.

---

## 🌟 Descripción General

**CreSer** es una aplicación web interactiva y responsiva concebida para brindar apoyo preventivo, herramientas de autorregulación emocional y recursos educativos en salud mental. La plataforma combina un diseño visual moderno con efecto de cristal (*glassmorphism*), modo nocturno de descanso visual y utilidades interactivas nativas.

---

## ✨ Características Principales

### 🧠 1. Asistente Virtual de Orientación — KIRI
- **Acompañamiento 24/7**: Orientación inmediata sobre manejo de estrés, técnicas de estudio, higiene del sueño y calma emocional.
- **Sugerencias Rápidas**: Píldoras interactivas para acceder a recomendaciones con un solo clic.
- **Enfoque Preventivo**: Canalización transparente hacia servicios de ayuda profesional cuando se requiere atención especializada.

### 💚 2. Centro de Bienestar y Monitoreo Emocional
- **Registro Diario del Estado de Ánimo**: Selección intuitiva con 5 niveles emocionales y mensajes reflexivos personalizados.
- **Contador de Racha y Progreso**: Seguimiento visual de la consistencia en el autocuidado semanal.
- **Accesos Rápidos**: Atajos directos a pausas de respiración, diario y audios relajantes.

### 🫁 3. Herramientas Interactivas de Autocuidado
- **Respiración Consciente (Ciclo 4-4-4)**: Círculo animado con guía visual rítmica (*Inhala, Sostén, Exhala*) y temporizador.
- **Diario Personal de Gratitud y Reflexión**: Gestor de notas privadas con almacenamiento en tu propio navegador (`localStorage`), marcas de fecha/hora y opción de eliminación.

### 🎧 4. Multimedia & Paisajes Sonoros (Web Audio API)
- **Sintetizador de Sonidos Naturales**: Generación de frecuencias y ambientes relajantes nativos:
  - 🌧️ *Lluvia Serena*
  - 🌲 *Bosque Calmo*
  - 🌊 *Olas de Mar*
  - ✨ *Frecuencia Armónica 432 Hz*
- **Visualizador de Ondas**: Ecualizador gráfico animado y control dinámico de volumen.

### 📚 5. Biblioteca de Recursos Educativos
- **Buscador en Tiempo Real**: Filtrado predictivo por palabras clave mientras escribes.
- **Filtros por Categoría**: Acceso ordenado a *Artículos*, *Guías Prácticas*, *Podcasts*, *Videos* e *Infografías*.

### 🔐 6. Portal de Autenticación y Acceso
- **Diseño Glassmorphism**: Interfaz estética con fondos translúcidos sobre escenarios naturales.
- **Conmutador de Pestañas**: Alternancia fluida entre *Iniciar Sesión* y *Crear Cuenta*.
- **Campos Flotantes Accesibles**: Formularios con validación en cliente y navegación fluida hacia la plataforma.

### ⚙️ 7. Accesibilidad y Preferencias
- **Modo Oscuro Integrado**: Paleta profunda para reducir la fatiga visual nocturna con persistencia local.
- **Modo de Texto Aumentado**: Opción de escalado tipográfico para personas con necesidades de accesibilidad.
- **Control Total de Datos**: Opciones para exportar o eliminar el historial y notas almacenadas.

---

## 📁 Estructura del Proyecto

```text
creser/
├── CreSer_Prototipo_Responsive.html   # Aplicación principal y vistas navegables
├── Creser.css                         # Sistema de diseño, variables CSS y animaciones
├── creser_app.js                      # Lógica de navegación, KIRI, respirador y audio
├── CreSerfunciones.js                 # Controlador de autenticación y pestañas
├── Creserlogin/
│   ├── CreSerlogin.html               # Interfaz de inicio de sesión y registro
│   ├── CreSerlogin.css                # Estilos glassmorphic para el portal de acceso
│   └── tranquilidad.jpeg              # Fondo de la pantalla de autenticación
├── img/                               # Ilustraciones y recursos visuales locales
│   ├── valores.gif
│   ├── cuidado.gif
│   ├── libros.gif
│   ├── arte-de-ia.gif
│   └── archivo.gif
└── README.md                          # Documentación del proyecto
```

---

## 🚀 Cómo Ejecutar el Proyecto Localmente

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/xolonica26/XOLONICA-CRESER.git
   cd XOLONICA-CRESER
   ```

2. **Abrir en el navegador**:
   - Puedes abrir directamente el archivo `creser/CreSer_Prototipo_Responsive.html` en tu navegador favorito (Chrome, Edge, Firefox, Safari).
   - O utilizar una extensión como *Live Server* en VS Code.

---

## 🛠️ Tecnologías Empleadas

- **HTML5 Semántico**: Estructura accesible (`header`, `main`, `section`, `nav`, `aside`, `footer`, roles ARIA).
- **CSS3 Moderno**: Variables personalizadas (*CSS Custom Properties*), Glassmorphism con `backdrop-filter`, Flexbox, CSS Grid y animaciones fluidas con `@keyframes`.
- **JavaScript ES6+**: Arquitectura modular desacoplada, gestión de eventos, Web Audio API para síntesis sonora y Web Storage API (`localStorage`).
- **Tipografías**: *Plus Jakarta Sans* y *Outfit* vía Google Fonts.

---

## ⚠️ Uso Responsable y Alcance

> **Aviso Importante**: CreSer y el asistente virtual KIRI ofrecen contenidos de carácter informativo, psicoeducativo y preventivo. **No constituyen un servicio de diagnóstico clínico ni reemplazan la atención médica o psicoterapéutica profesional**. Ante situaciones de crisis aguda o emergencia, se recomienda contactar de inmediato a los servicios de salud oficiales de tu localidad.

---

© 2026 **CreSer** — Plataforma de Bienestar Emocional y Cuidado Integral.