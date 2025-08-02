# 🎵 BondApp - Sistema de Gestión para Bandas de Música

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JCGR9/bondad25)

BondApp es una aplicación completa para la gestión integral de bandas de música, desarrollada con React, TypeScript y Firebase para almacenamiento en la nube.

## 🚀 **ACCESO ONLINE**: [https://bondad25.vercel.app](https://bondad25.vercel.app)

## 🎵 Características Principales

### Módulos Disponibles
- **🎭 Actuaciones**: Gestión de conciertos y presentaciones
- **👥 Componentes**: Administración de miembros de la banda
- **📄 Contratos**: Manejo de contratos y acuerdos
- **📊 Estadísticas**: Análisis y reportes detallados
- **💰 Ingresos y Gastos**: Control financiero completo
- **🎺 Inventario**: Gestión de instrumentos y equipos
- **📋 Gestiones**: Tareas administrativas
- **🎼 Partituras**: Biblioteca musical digital

### Tecnologías Utilizadas
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Material-UI (MUI)
- **Backend**: Firebase (Firestore, Storage, Auth)
- **Navegación**: React Router
- **Estilo**: Material Design con tema personalizado

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn
- Cuenta de Firebase (para producción)

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd BondApp
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Firebase** (Opcional para desarrollo)
   - Crear un proyecto en [Firebase Console](https://console.firebase.google.com)
   - Obtener las credenciales de configuración
   - Actualizar `src/services/firebase.ts` con tus credenciales

4. **Iniciar en modo desarrollo**
   ```bash
   # Opción 1: Script interactivo (recomendado)
   ./start-dev.sh
   
   # Opción 2: Navegador web (desarrollo rápido)
   npm run dev
   
   # Opción 3: Aplicación de escritorio (experiencia final)
   npm run electron-dev
   ```

## 🛠️ **Desarrollo y Pruebas**

### **Flujo de Desarrollo Recomendado**

1. **Desarrollo principal**: `npm run dev` 
   - ✅ Recarga instantánea (hot reload)
   - ✅ DevTools del navegador
   - ✅ Desarrollo más rápido
   - 🌐 Acceso en: http://localhost:5175

2. **Pruebas de UX**: `npm run electron-dev`
   - ✅ Experiencia de aplicación nativa
   - ✅ Menús y atajos de teclado
   - ✅ Comportamiento de ventana
   - 🖥️ Se abre como aplicación de escritorio

3. **Compilación de prueba**: `npm run build && npm run electron-build`
   - ✅ Prueba la versión de producción
   - ✅ Detecta errores de build
   - ❌ Sin hot reload (solo para testing)

### **Cambios en Tiempo Real**

Durante el desarrollo puedes:
- ✅ Editar código y ver cambios instantáneos
- ✅ Cambiar entre navegador y Electron sin perder estado
- ✅ Usar DevTools en ambos entornos
- ✅ Probar responsive design en el navegador
- ✅ Probar experiencia nativa en Electron

## 📦 Distribución y Despliegue

### 🌐 **Aplicación Web**
Ideal para acceso universal desde cualquier navegador:

```bash
# Compilar para producción
npm run build

# Los archivos se generan en /dist
# Subir a servicios como:
# - Firebase Hosting: firebase deploy
# - Netlify: netlify deploy --prod --dir=dist
# - Vercel: vercel --prod
```

### 🖥️ **Aplicación de Escritorio (.exe, .dmg, .AppImage)**
Para instalación local en computadoras:

**Desarrollo:**
```bash
# Probar app de escritorio en desarrollo
npm run electron-dev
```

**Construcción para distribución:**
```bash
# Generar instaladores para todas las plataformas
./build-app.sh

# O manualmente:
npm run dist        # Solo tu plataforma actual
npm run dist-all    # Todas las plataformas
```

**Instaladores generados:**
- **Windows**: `BondApp Setup.exe` (instalador NSIS)
- **macOS**: `BondApp.dmg` (imagen de disco)
- **Linux**: `BondApp.AppImage` (aplicación portable)

### 📱 **Aplicación Web Progresiva (PWA)**
Para instalación en móviles y acceso offline:

```bash
# La app ya incluye configuración PWA básica
# Los usuarios pueden "Añadir a pantalla de inicio"
```

## 🎯 **¿Cuál elegir?**

| Tipo | Ventajas | Desventajas | Ideal para |
|------|----------|-------------|------------|
| **Web** | ✅ Sin instalación<br>✅ Actualizaciones automáticas<br>✅ Multiplataforma | ❌ Requiere internet<br>❌ Depende del navegador | Bandas que viajan<br>Acceso remoto |
| **Escritorio** | ✅ No requiere internet*<br>✅ Rendimiento nativo<br>✅ Integración con SO | ❌ Requiere instalación<br>❌ Actualizaciones manuales | Estudios de ensayo<br>Uso local |
| **PWA** | ✅ Instalable<br>✅ Funciona offline*<br>✅ Notificaciones push | ❌ Funcionalidad limitada<br>❌ Soporte variable | Acceso móvil<br>Uso híbrido |

_*Requiere configuración adicional para modo offline_

## 🔐 Acceso al Sistema

**Credenciales por defecto:**
- **Usuario**: `admin`
- **Contraseña**: `admin`

## 📱 Interfaz de Usuario

### Diseño Responsivo
- Interfaz adaptable para escritorio, tablet y móvil
- Navegación intuitiva con sidebar colapsible
- Tema moderno con gradientes y animaciones suaves

### Características de UI/UX
- ✨ Interfaz elegante y profesional
- 🎨 Tema personalizado con colores corporativos
- 📱 Diseño responsive para todos los dispositivos
- 🔍 Navegación clara y organizada
- ⚡ Transiciones y animaciones fluidas

## 🛠️ Desarrollo

### Estructura del Proyecto
```
src/
├── components/          # Componentes reutilizables
│   ├── LoginPage.tsx   # Página de autenticación
│   └── MainLayout.tsx  # Layout principal con navegación
├── pages/              # Páginas principales
│   └── Dashboard.tsx   # Panel principal
├── context/            # Contextos de React
│   └── AuthContext.tsx # Contexto de autenticación
├── services/           # Servicios y APIs
│   └── firebase.ts     # Configuración de Firebase
├── types/              # Definiciones de TypeScript
│   └── index.ts        # Interfaces y tipos
└── App.tsx             # Componente principal
```

### Scripts Disponibles
```bash
# Desarrollo
npm run dev              # Servidor web de desarrollo
npm run electron-dev     # Aplicación de escritorio en desarrollo

# Construcción
npm run build            # Compilar aplicación web
npm run electron-build   # Construir app de escritorio (sin empaquetar)
npm run dist             # Generar instalador para tu plataforma
npm run dist-all         # Generar instaladores para todas las plataformas
./build-app.sh           # Script automatizado de construcción

# Utilidades
npm run preview          # Vista previa de la build de producción
npm run lint             # Verificar código con ESLint
```

## 🔥 Firebase Integration

### Servicios Utilizados
- **Firestore**: Base de datos NoSQL para almacenar datos
- **Authentication**: Sistema de autenticación de usuarios
- **Storage**: Almacenamiento de archivos (partituras, fotos, etc.)

### Configuración de Datos
Los datos se organizan en las siguientes colecciones:
- `performances` - Actuaciones y conciertos
- `members` - Miembros de la banda
- `contracts` - Contratos y acuerdos
- `finances` - Registros financieros
- `inventory` - Inventario de instrumentos
- `sheetMusic` - Partituras digitales
- `tasks` - Tareas y gestiones

## 🎯 Próximas Funcionalidades

- [ ] Implementación completa de todos los módulos
- [ ] Sistema de notificaciones
- [ ] Calendario integrado
- [ ] Exportación de reportes
- [ ] API REST para integraciones
- [ ] Aplicación móvil (React Native)
- [ ] Sistema de backup automático

## 🤝 Contribución

1. Fork del proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 💡 Soporte

Si tienes preguntas o necesitas ayuda:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

---

**BondApp** - Llevando la gestión de bandas al siguiente nivel 🎵
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
