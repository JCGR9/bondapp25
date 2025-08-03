#!/bin/bash

# Script SUPER SIMPLE para desplegar en Netlify
echo "🌟 Despliegue SÚPER SIMPLE con Netlify"
echo "===================================="

# Build del proyecto
echo "📦 Construyendo la aplicación..."
npm run build:vercel

# Verificar que existe dist
if [ ! -d "dist" ]; then
    echo "❌ Error en el build"
    exit 1
fi

echo "✅ Build completado!"
echo ""
echo "🌐 DESPLIEGUE MANUAL (SÚPER FÁCIL):"
echo "=================================="
echo "1. Ve a https://app.netlify.com/"
echo "2. Arrastra la carpeta 'dist' a la página"
echo "3. ¡Ya está online!"
echo ""
echo "📁 Carpeta a arrastrar: $(pwd)/dist"
echo ""
echo "🔥 ALTERNATIVA AÚN MÁS FÁCIL:"
echo "============================="
echo "1. Instala Netlify CLI: npm install -g netlify-cli"
echo "2. Ejecuta: netlify deploy --prod --dir=dist"
echo "3. ¡Listo!"
