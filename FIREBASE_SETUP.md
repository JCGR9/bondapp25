# 🔥 Obtener Credenciales de Firebase - bondad-sistema-bandas

## 📋 Paso a Paso para Obtener las Credenciales Reales

### 1. Acceder a Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto **"bondad-sistema-bandas"**

### 2. Obtener Configuración Web
1. En el panel izquierdo, haz clic en el ⚙️ **"Configuración del proyecto"**
2. Baja hasta la sección **"Tus aplicaciones"**
3. Si no tienes una aplicación web creada:
   - Haz clic en **"Agregar aplicación"** → **"Web"** 🌐
   - Nombre de la aplicación: `BondApp Web`
   - ✅ Marca "Configurar también Firebase Hosting"
   - Haz clic en **"Registrar aplicación"**

### 3. Copiar Configuración
Verás algo así:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "bondad-sistema-bandas.firebaseapp.com",
  projectId: "bondad-sistema-bandas",
  storageBucket: "bondad-sistema-bandas.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};
```

### 4. Actualizar .env.local
Reemplaza los valores en tu archivo `.env.local`:
```bash
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=bondad-sistema-bandas.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bondad-sistema-bandas
VITE_FIREBASE_STORAGE_BUCKET=bondad-sistema-bandas.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef
```

### 5. Habilitar Servicios Necesarios

#### 5.1 Authentication
1. En el panel izquierdo → **"Authentication"**
2. Pestaña **"Sign-in method"**
3. Habilita **"Correo electrónico/Contraseña"**
4. Haz clic en **"Guardar"**

#### 5.2 Firestore Database
1. En el panel izquierdo → **"Firestore Database"**
2. Haz clic en **"Crear base de datos"**
3. Selecciona **"Empezar en modo de producción"**
4. Elige ubicación (recomendado: `europe-west1`)
5. Haz clic en **"Listo"**

#### 5.3 Storage
1. En el panel izquierdo → **"Storage"**
2. Haz clic en **"Comenzar"**
3. Acepta las reglas por defecto
4. Elige la misma ubicación que Firestore
5. Haz clic en **"Listo"**

### 6. Configurar Reglas de Seguridad

#### 6.1 Firestore Rules
Ve a **Firestore Database** → **"Reglas"** y reemplaza con:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura solo a usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### 6.2 Storage Rules
Ve a **Storage** → **"Reglas"** y reemplaza con:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 7. Crear Usuario Administrador
1. Ve a **Authentication** → **"Usuarios"**
2. Haz clic en **"Agregar usuario"**
3. Email: `admin@bondapp.com`
4. Contraseña: `admin` (o la que prefieras)
5. Haz clic en **"Agregar usuario"**

### 8. Verificar Configuración
```bash
# En tu terminal, en el directorio del proyecto:
npm run build:vercel
npm run preview
```

Abre http://localhost:4173 y prueba hacer login con:
- Usuario: `admin@bondapp.com`
- Contraseña: `admin`

### 🔒 Seguridad
- **NUNCA** subas el archivo `.env.local` a GitHub
- Las reglas actuales permiten acceso a usuarios autenticados
- En producción, considera reglas más específicas

### ⚠️ Problemas Comunes
1. **"Firebase config not found"**: Verifica que copiaste bien las credenciales
2. **"Auth domain not authorized"**: Añade tu dominio en Authentication → Settings
3. **"Permission denied"**: Verifica las reglas de Firestore y Storage

### ✅ Verificar que Todo Funciona
Una vez configurado, deberías poder:
- ✅ Hacer login en la aplicación
- ✅ Ver el dashboard
- ✅ Crear/editar datos (se guardan en Firestore)
- ✅ Subir archivos (se guardan en Storage)

¿Necesitas ayuda con algún paso específico?
