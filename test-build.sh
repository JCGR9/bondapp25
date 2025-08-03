#!/bin/bash

# Script para probar el build de producción localmente
# Este script simula el proceso que ejecutará Vercel

echo "🚀 BondApp - Build Test para Producción"
echo "========================================"

# Verificar Node.js
echo "📋 Verificando Node.js..."
node --version
npm --version

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci

# Verificar variables de entorno
echo "🔧 Verificando variables de entorno..."
if [ ! -f ".env.local" ]; then
    echo "❌ Error: No se encontró .env.local"
    echo "   Crea el archivo .env.local con las variables de Firebase y Google Drive"
    exit 1
fi

# Lint del código
echo "🔍 Ejecutando lint..."
npm run lint

# Build para producción
echo "🔨 Construyendo para producción..."
npm run build:vercel

# Verificar que el build fue exitoso
if [ -d "dist" ]; then
    echo "✅ Build exitoso! Archivos generados en /dist"
    
    # Mostrar tamaño de los archivos principales
    echo "📊 Tamaño de archivos principales:"
    ls -lh dist/assets/*.js 2>/dev/null | head -5
    ls -lh dist/assets/*.css 2>/dev/null | head -3
    
    # Verificar que index.html existe
    if [ -f "dist/index.html" ]; then
        echo "✅ index.html generado correctamente"
    else
        echo "❌ Error: index.html no encontrado"
        exit 1
    fi
    
    echo ""
    echo "🎉 Build completado exitosamente!"
    echo "   Puedes probar el build localmente con: npm run preview"
    echo "   O subir a Vercel para despliegue en producción"
    
else
    echo "❌ Error: El build falló"
    exit 1
fi
