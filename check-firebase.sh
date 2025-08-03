#!/bin/bash

# Script para verificar la configuración de Firebase
echo "🔥 Verificación de Configuración Firebase"
echo "=========================================="

# Verificar archivo .env.local
if [ -f ".env.local" ]; then
    echo "✅ Archivo .env.local encontrado"
    
    # Verificar variables críticas
    echo ""
    echo "📋 Variables de entorno configuradas:"
    
    if grep -q "VITE_FIREBASE_PROJECT_ID=bondad-sistema-bandas" .env.local; then
        echo "✅ Project ID: bondad-sistema-bandas"
    else
        echo "❌ Project ID no configurado correctamente"
    fi
    
    if grep -q "VITE_FIREBASE_AUTH_DOMAIN=bondad-sistema-bandas.firebaseapp.com" .env.local; then
        echo "✅ Auth Domain: bondad-sistema-bandas.firebaseapp.com"
    else
        echo "❌ Auth Domain no configurado correctamente"
    fi
    
    if grep -q "VITE_FIREBASE_STORAGE_BUCKET=bondad-sistema-bandas.firebasestorage.app" .env.local; then
        echo "✅ Storage Bucket: bondad-sistema-bandas.firebasestorage.app"
    else
        echo "❌ Storage Bucket no configurado correctamente"
    fi
    
    echo ""
    echo "🔧 Para obtener las credenciales reales:"
    echo "1. Ve a https://console.firebase.google.com/"
    echo "2. Selecciona el proyecto 'bondad-sistema-bandas'"
    echo "3. Ve a Configuración → Configuración del proyecto"
    echo "4. Busca la sección 'Configuración del SDK'"
    echo "5. Copia las credenciales reales a .env.local"
    echo ""
    echo "📖 Guía completa: cat FIREBASE_SETUP.md"
    
else
    echo "❌ Archivo .env.local no encontrado"
    echo "   Ejecuta: cp .env.example .env.local"
    echo "   Luego edita .env.local con las credenciales reales"
fi

echo ""
echo "🚀 Una vez configurado, ejecuta:"
echo "   npm run build:vercel  # Para probar el build"
echo "   npm run preview       # Para probar localmente"
echo "   ./deploy-cloud.sh     # Para desplegar"
