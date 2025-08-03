#!/bin/bash

# Script de despliegue automático para BondApp
# Este script prepara y despliega la aplicación en Vercel

echo "🚀 BondApp - Despliegue Automático a la Nube"
echo "============================================="

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    log_error "No se encontró package.json. Ejecuta este script desde el directorio raíz del proyecto."
    exit 1
fi

# Verificar Node.js y npm
log_info "Verificando entorno..."
node --version
npm --version

# Verificar archivo de variables de entorno
if [ ! -f ".env.local" ]; then
    log_error "No se encontró .env.local"
    echo "Crea el archivo .env.local con las siguientes variables:"
    echo "VITE_FIREBASE_API_KEY=tu_api_key"
    echo "VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com"
    echo "VITE_FIREBASE_PROJECT_ID=tu_proyecto_id"
    echo "VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com"
    echo "VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id"
    echo "VITE_FIREBASE_APP_ID=tu_app_id"
    echo "VITE_GOOGLE_CLIENT_ID=tu_google_client_id"
    echo "VITE_GOOGLE_CLIENT_SECRET=tu_google_client_secret"
    exit 1
fi

log_info "Archivo .env.local encontrado"

# Instalar dependencias
log_info "Instalando dependencias..."
npm ci

# Ejecutar lint
log_info "Ejecutando lint..."
npm run lint

# Build del proyecto
log_info "Construyendo proyecto para producción..."
npm run build:vercel

# Verificar que el build fue exitoso
if [ ! -d "dist" ]; then
    log_error "El build falló. No se encontró el directorio dist."
    exit 1
fi

log_info "Build completado exitosamente"

# Mostrar información del build
echo ""
echo "📊 Información del Build:"
echo "========================"
du -sh dist/
echo ""
echo "Archivos principales:"
ls -lh dist/assets/*.js 2>/dev/null | head -3
ls -lh dist/assets/*.css 2>/dev/null | head -2

# Verificar si Vercel CLI está instalado
if command -v vercel &> /dev/null; then
    echo ""
    read -p "¿Deseas desplegar ahora en Vercel? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Desplegando en Vercel..."
        vercel --prod
    else
        log_warning "Despliegue cancelado por el usuario"
    fi
else
    log_warning "Vercel CLI no está instalado"
    echo "Para desplegar manualmente:"
    echo "1. Instala Vercel CLI: npm i -g vercel"
    echo "2. Ejecuta: vercel --prod"
    echo "3. O sube los cambios a GitHub y Vercel desplegará automáticamente"
fi

echo ""
log_info "Proceso completado"
echo ""
echo "🔗 Enlaces útiles:"
echo "  📱 Vista previa local: http://localhost:4173"
echo "  🌐 Vercel Dashboard: https://vercel.com/dashboard"
echo "  🔥 Firebase Console: https://console.firebase.google.com"
echo "  ☁️  Google Cloud Console: https://console.cloud.google.com"
echo ""
echo "📋 Siguiente pasos:"
echo "  1. Configura las variables de entorno en Vercel Dashboard"
echo "  2. Actualiza las URLs autorizadas en Google Cloud Console"
echo "  3. Verifica las reglas de seguridad en Firebase"
echo "  4. Prueba la aplicación en producción"
