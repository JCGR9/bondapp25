# 🌟 BondApp - Lista de Verificación para Despliegue en la Nube

## ✅ Estado Actual
- [x] **Build exitoso**: La aplicación compila correctamente
- [x] **Variables de entorno**: Configuración básica en `.env.local`
- [x] **Firebase**: Configuración preparada
- [x] **Vercel**: Configuración lista
- [x] **Google Drive**: Servicio preparado (modo fallback)

## 📋 Pasos para Completar el Despliegue

### 1. Configuración de Firebase (OBLIGATORIO)
```bash
# Ve a https://console.firebase.google.com/
# 1. Selecciona tu proyecto "bondad-sistema-bandas"
# 2. Habilita Authentication (Email/Password)
# 3. Crea Firestore Database
# 4. Habilita Storage
# 5. Copia las credenciales a .env.local
```

### 2. Configuración de Google Drive API (OPCIONAL)
```bash
# Ve a https://console.cloud.google.com/
# 1. Crea/selecciona un proyecto
# 2. Habilita Google Drive API
# 3. Crea credenciales OAuth 2.0
# 4. Añade URLs autorizadas:
#    - http://localhost:5175 (desarrollo)
#    - https://tu-dominio.vercel.app (producción)
```

### 3. Despliegue en Vercel
```bash
# Opción A: Conectar repositorio GitHub
# 1. Ve a https://vercel.com/dashboard
# 2. Importa tu repositorio
# 3. Configura variables de entorno
# 4. Despliega

# Opción B: CLI de Vercel
npm i -g vercel
vercel --prod
```

### 4. Variables de Entorno en Vercel
En el dashboard de Vercel, configura estas variables:
```
VITE_FIREBASE_API_KEY=tu_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=bondad-sistema-bandas.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bondad-sistema-bandas
VITE_FIREBASE_STORAGE_BUCKET=bondad-sistema-bandas.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_GOOGLE_CLIENT_ID=tu_google_client_id (opcional)
VITE_GOOGLE_CLIENT_SECRET=tu_google_client_secret (opcional)
```

## 🔧 Comandos Útiles

### Desarrollo Local
```bash
npm run dev                 # Servidor de desarrollo
npm run build:vercel       # Build para producción
npm run preview            # Vista previa del build
./test-build.sh            # Probar build completo
./deploy-cloud.sh          # Script de despliegue
```

### Verificar Estado
```bash
# Verificar variables de entorno
echo $VITE_FIREBASE_API_KEY

# Probar build
npm run build:vercel

# Probar preview
npm run preview
```

## 🔍 Solución de Problemas

### Error: Variables de entorno no definidas
- Verifica que `.env.local` existe y tiene las variables correctas
- En Vercel, verifica que las variables estén configuradas en el dashboard

### Error: CORS con Google Drive API
- Verifica URLs autorizadas en Google Cloud Console
- Añade el dominio de producción a las URLs autorizadas

### Error: Firebase no configurado
- Verifica credenciales en Firebase Console
- Confirma que los servicios están habilitados

### Error: Build falla
- Ejecuta `npm run lint` para verificar errores
- Verifica que todas las dependencias estén instaladas

## 📱 URLs de la Aplicación

### Desarrollo
- Local: http://localhost:5175
- Preview: http://localhost:4173

### Producción
- Vercel: https://tu-proyecto.vercel.app
- Custom domain: (configurar después)

## 🚀 Estado del Despliegue

### ✅ Completado
- [x] Configuración de build
- [x] Variables de entorno locales
- [x] Servicios preparados
- [x] Scripts de despliegue

### 🔄 Pendiente (requiere acción manual)
- [ ] Configurar proyecto Firebase real
- [ ] Configurar Google Drive API (opcional)
- [ ] Desplegar en Vercel
- [ ] Configurar variables de entorno en producción
- [ ] Actualizar URLs autorizadas
- [ ] Probar aplicación en producción

## 🎯 Siguiente Paso
**Ejecuta: `./deploy-cloud.sh`** para comenzar el proceso de despliegue.
