# 🚀 Guía de Despliegue a la Nube - BondApp

Esta guía te ayudará a desplegar BondApp en la nube usando Firebase, Vercel y Google Drive.

## 📋 Prerrequisitos

1. **Firebase Project**: Un proyecto de Firebase configurado
2. **Vercel Account**: Cuenta en Vercel
3. **Google Cloud Console**: Proyecto configurado para Google Drive API

## 🔧 Configuración Paso a Paso

### 1. Firebase Setup

#### 1.1 Crear Proyecto Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Usa tu proyecto existente `bondad-sistema-bandas`
3. Habilita los siguientes servicios:
   - **Authentication** (Email/Password)
   - **Firestore Database**
   - **Storage**

#### 1.2 Configurar Authentication
```bash
# En Firebase Console > Authentication > Sign-in method
# Habilitar: Email/Password
```

#### 1.3 Configurar Firestore
```bash
# En Firebase Console > Firestore Database
# Crear base de datos en modo de producción
# Reglas iniciales (actualizar después):
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### 1.4 Configurar Storage
```bash
# En Firebase Console > Storage
# Crear bucket por defecto
# Reglas iniciales:
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. Google Drive API Setup

#### 2.1 Crear Proyecto en Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o usa uno existente
3. Habilita la Google Drive API

#### 2.2 Configurar OAuth2
1. Ve a "Credenciales" > "Crear credenciales" > "ID de cliente OAuth 2.0"
2. Tipo de aplicación: "Aplicación web"
3. URLs autorizadas de JavaScript:
   ```
   http://localhost:5175
   https://tu-dominio.vercel.app
   ```
4. URLs de redireccionamiento autorizadas:
   ```
   http://localhost:5175/auth/callback
   https://tu-dominio.vercel.app/auth/callback
   ```

### 3. Variables de Entorno

#### 3.1 Para Desarrollo Local (.env.local)
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=tu_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=bondad-sistema-bandas.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bondad-sistema-bandas
VITE_FIREBASE_STORAGE_BUCKET=bondad-sistema-bandas.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# Google Drive Configuration
VITE_GOOGLE_CLIENT_ID=tu_google_client_id
VITE_GOOGLE_CLIENT_SECRET=tu_google_client_secret
```

#### 3.2 Para Producción (Vercel Dashboard)
Configura las mismas variables en el dashboard de Vercel:
1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Añade todas las variables VITE_*

### 4. Despliegue en Vercel

#### 4.1 Conectar Repositorio
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Importa tu repositorio de GitHub
3. Configura el proyecto:
   - Framework Preset: Vite
   - Build Command: `npm run build:vercel`
   - Output Directory: `dist`

#### 4.2 Variables de Entorno en Vercel
```bash
# En Vercel Dashboard > Settings > Environment Variables
VITE_FIREBASE_API_KEY=tu_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=bondad-sistema-bandas.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bondad-sistema-bandas
VITE_FIREBASE_STORAGE_BUCKET=bondad-sistema-bandas.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_GOOGLE_CLIENT_ID=tu_google_client_id
VITE_GOOGLE_CLIENT_SECRET=tu_google_client_secret
```

## 🚀 Comandos de Despliegue

### Desarrollo Local
```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

### Despliegue Manual
```bash
# Build optimizado
npm run build:vercel

# Desplegar en Vercel (si tienes Vercel CLI)
vercel --prod
```

## 🔐 Configuración de Seguridad

### Firebase Security Rules

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios autenticados pueden leer/escribir sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Datos compartidos de la banda
    match /band/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Actuaciones
    match /performances/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Miembros
    match /members/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Inventario
    match /inventory/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /band/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📊 Monitoreo y Analytics

### Firebase Analytics
1. Habilita Google Analytics en Firebase Console
2. Configura eventos personalizados para monitorear el uso

### Vercel Analytics
1. Habilita Vercel Analytics en el dashboard
2. Monitorea performance y errores

## 🔄 CI/CD Pipeline

### GitHub Actions (opcional)
Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build:vercel
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🐛 Troubleshooting

### Errores Comunes

1. **Error de CORS con Google Drive API**
   - Verificar URLs autorizadas en Google Cloud Console

2. **Variables de entorno no definidas**
   - Verificar que todas las variables VITE_* estén configuradas

3. **Errores de build en Vercel**
   - Verificar que `build:vercel` script esté definido
   - Revisar logs de build en Vercel Dashboard

4. **Errores de Firebase**
   - Verificar configuración en `firebase.ts`
   - Revisar reglas de seguridad

## 📝 URLs Importantes

- **Aplicación en Desarrollo**: http://localhost:5175
- **Aplicación en Producción**: https://tu-proyecto.vercel.app
- **Firebase Console**: https://console.firebase.google.com/
- **Google Cloud Console**: https://console.cloud.google.com/
- **Vercel Dashboard**: https://vercel.com/dashboard

## ✅ Checklist de Despliegue

- [ ] Proyecto Firebase creado y configurado
- [ ] Google Drive API habilitada y configurada
- [ ] Variables de entorno configuradas en .env.local
- [ ] Variables de entorno configuradas en Vercel
- [ ] Repositorio conectado a Vercel
- [ ] Build exitoso en Vercel
- [ ] URLs de OAuth actualizadas
- [ ] Reglas de seguridad configuradas
- [ ] Aplicación funcionando en producción

¡Listo! Tu BondApp ya está funcionando en la nube 🎉
