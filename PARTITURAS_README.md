# 🎼 Sistema de Gestión de Partituras - BondApp

## Descripción General

El sistema de gestión de partituras permite a las bandas musicales organizar, almacenar y distribuir sus partituras de manera profesional y eficiente. Utiliza una estructura jerárquica **Marcha → Instrumento → Voz** con almacenamiento en la nube Firebase y funcionalidad de distribución por email.

## ✨ Características Principales

### 📁 Organización Jerárquica
- **Marchas**: 8 categorías predefinidas (Procesionales, Concierto, Fúnebres, etc.)
- **Instrumentos**: Organizados por secciones (Viento Madera, Viento Metal, Percusión, Director)
- **Voces**: Específicas para cada instrumento (1º, 2º, 3º, etc.)

### ☁️ Almacenamiento en la Nube
- Integración con **Firebase Storage** para archivos seguros
- Respaldo automático y acceso desde cualquier dispositivo
- URLs de descarga directa para cada partitura

### 🔍 Búsqueda y Filtrado
- Búsqueda por título, compositor, arreglista, etiquetas
- Filtros por marcha, instrumento y nivel de dificultad
- Vista organizada por categorías expandibles

### 📊 Información Detallada
- Metadatos completos: compositor, arreglista, duración
- Sistema de dificultad (1-5 estrellas)
- Etiquetas personalizables para clasificación
- Fechas de subida y última modificación

### 📧 Distribución por Email
- Envío masivo a toda la banda
- Distribución por instrumento o voz específica
- Mensajes personalizados con adjuntos automáticos

## 🚀 Configuración e Instalación

### Requisitos Previos
- Node.js 16+ 
- Proyecto Firebase configurado
- Cuenta de email para distribución (Gmail recomendado)

### Configuración Firebase

1. **Crear proyecto Firebase**:
   ```bash
   # Visitar https://console.firebase.google.com
   # Crear nuevo proyecto
   # Habilitar Storage y Firestore
   ```

2. **Configurar `src/config/firebase.ts`**:
   ```typescript
   import { initializeApp } from 'firebase/app';
   import { getFirestore } from 'firebase/firestore';
   import { getAuth } from 'firebase/auth';
   import { getStorage } from 'firebase/storage';

   const firebaseConfig = {
     apiKey: "tu-api-key",
     authDomain: "tu-proyecto.firebaseapp.com",
     projectId: "tu-proyecto-id",
     storageBucket: "tu-proyecto.appspot.com",
     messagingSenderId: "123456789",
     appId: "tu-app-id"
   };

   const app = initializeApp(firebaseConfig);
   export const db = getFirestore(app);
   export const auth = getAuth(app);
   export const storage = getStorage(app);
   ```

3. **Reglas de seguridad Firebase Storage**:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /scores/{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

### Configuración Email (Opcional)

Para habilitar el envío por email, configurar servidor SMTP:

```typescript
// En el componente ScoresManagerPage
const emailSettings = {
  senderEmail: 'banda@tudominio.com',
  senderPassword: 'tu-app-password', // Usar App Passwords para Gmail
  smtpServer: 'smtp.gmail.com',
  smtpPort: 587
};
```

## 📖 Guía de Uso

### 1. Subir Partituras

1. **Clic en el botón "+" (Agregar)**
2. **Completar formulario**:
   - Título de la partitura
   - Seleccionar marcha (categoría)
   - Elegir sección instrumental
   - Especificar instrumento/voz
   - Añadir información opcional (compositor, arreglista, etc.)
3. **Seleccionar archivo PDF**
4. **Hacer clic en "Subir Partitura"**

### 2. Organizar y Buscar

- **Navegación jerárquica**: Expandir acordeones por Marcha → Instrumento → Voz
- **Búsqueda rápida**: Usar barra de búsqueda superior
- **Filtros**: Aplicar filtros por marcha e instrumento
- **Vista de estadísticas**: Consultar resumen en cards superiores

### 3. Gestionar Partituras

- **Descargar**: Clic en icono de descarga verde
- **Eliminar**: Clic en icono de basura rojo (confirmación requerida)
- **Ver detalles**: Información completa en cada entrada

### 4. Distribución por Email

1. **Clic en "Enviar por Email"**
2. **Seleccionar destinatarios**:
   - Toda la banda
   - Por instrumento específico
   - Por voz específica
3. **Personalizar mensaje**
4. **Enviar**

## 🎯 Categorías de Marchas

| Categoría | Descripción | Personalizable |
|-----------|-------------|----------------|
| **Marchas Semana Santa** | Para procesiones y actos religiosos de Semana Santa | ✅ |
| **Ordinario** | Repertorio general y variado | ✅ |
| **Categorías Personalizadas** | Creadas por el usuario según necesidades | ✅ |

### Gestión de Categorías

El sistema permite **crear y eliminar categorías** según las necesidades específicas de cada banda:

- **Crear nueva categoría**: Botón "Gestionar Categorías" → "Agregar Nueva Categoría"
- **Eliminar categoría**: Solo si no tiene partituras asociadas
- **Validaciones**: No se pueden eliminar categorías con partituras, ni dejar el sistema sin categorías

## 🎺 Instrumentos y Voces

### Viento Madera
- **Flautas**: Flautín, Flauta
- **Oboes**: Oboe
- **Clarinetes**: Requinto, Clarinete 1º, 2º, 3º
- **Saxofones**: Soprano, Alto 1º/2º, Tenor, Barítono
- **Otros**: Fagot

### Viento Metal
- **Trompetas**: Trompeta 1º, 2º, 3º
- **Fliscornos**: Fliscorno 1º, 2º
- **Trompas**: Trompa 1º, 2º
- **Trombones**: Trombón 1º, 2º, 3º
- **Graves**: Bombardino, Tuba, Tuba Mib

### Percusión
- **Timbales**, **Bombo**, **Platillos**, **Caja**
- **Redoblante**, **Xilófono**, **Vibráfono**
- **Triangulo**, **Pandereta**, **Castañuelas**

### Director
- **Partitura Completa**, **Reducción Piano**

## 📈 Sistema de Dificultad

| Nivel | Denominación | Descripción | Color |
|-------|--------------|-------------|--------|
| 1 ⭐ | Muy Fácil | Principiantes, figuras simples | 🟢 Verde |
| 2 ⭐⭐ | Fácil | Músicos con experiencia básica | 🟡 Amarillo claro |
| 3 ⭐⭐⭐ | Intermedio | Nivel medio, requiere práctica | 🟠 Naranja |
| 4 ⭐⭐⭐⭐ | Difícil | Avanzado, técnica compleja | 🟠 Naranja oscuro |
| 5 ⭐⭐⭐⭐⭐ | Muy Difícil | Experto, máxima complejidad | 🔴 Rojo |

## 🔧 Funcionalidades Técnicas

### Almacenamiento
- **Firebase Storage**: Archivos en la nube
- **Firestore**: Metadatos de partituras
- **localStorage**: Fallback para desarrollo sin Firebase

### Formatos Soportados
- **PDF**: Formato principal recomendado
- **MusicXML**: Intercambio entre software musical
- **MIDI**: Archivos de audio/secuencias

### Estructura de Datos
```typescript
interface Score {
  id: string;
  title: string;
  march: string;        // Categoría de marcha
  instrument: string;   // Sección instrumental
  voice: string;        // Voz específica
  composer?: string;
  arranger?: string;
  difficulty: number;   // 1-5
  duration?: string;
  description?: string;
  tags: string[];
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadDate: Date;
  lastModified: Date;
}
```

## 🚨 Troubleshooting

### Problemas Comunes

1. **Firebase no configurado**:
   - Verificar `src/config/firebase.ts`
   - Comprobar claves API y proyecto ID
   - Habilitar servicios en consola Firebase

2. **Errores de subida**:
   - Verificar reglas de seguridad Storage
   - Comprobar autenticación de usuario
   - Revisar tamaño máximo de archivo (10MB recomendado)

3. **Email no funciona**:
   - Configurar credenciales SMTP correctas
   - Para Gmail: usar "Contraseñas de aplicación"
   - Verificar conexión a internet

### Logs de Desarrollo
```javascript
// Habilitar logs detallados
localStorage.setItem('debug', 'bondapp:*');
```

## 🛠️ Desarrollo y Personalización

### Agregar Nuevas Marchas
```typescript
// El sistema ahora permite gestión dinámica de categorías
// Usar la interfaz: "Gestionar Categorías" → "Agregar Nueva Categoría"
// Las categorías se guardan automáticamente en localStorage
```

### Personalizar Instrumentos
```typescript
// En ScoresManagerPage.tsx
const defaultInstruments = {
  'Tu Nueva Sección': ['Instrumento 1', 'Instrumento 2'],
  // ... resto de secciones
};
```

### Temas y Estilos
El sistema utiliza Material-UI con tema oscuro personalizado. Para modificar colores:

```typescript
// En App.tsx o tema personalizado
const theme = createTheme({
  palette: {
    primary: { main: '#8B0000' }, // Color principal (rojo banda)
    // ... otras configuraciones
  },
});
```

## 📄 Licencia

Este sistema es parte de **BondApp** - Software de gestión integral para bandas musicales.

---

**Desarrollado con ❤️ para la comunidad musical**

Para soporte técnico o sugerencias, contactar al equipo de desarrollo.
