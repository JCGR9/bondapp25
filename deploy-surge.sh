#!/bin/bash

# Script para desplegar con Surge.sh (SÚPER RÁPIDO)
echo "⚡ Despliegue INSTANTÁNEO con Surge.sh"
echo "===================================="

# Instalar Surge si no está instalado
if ! command -v surge &> /dev/null; then
    echo "📦 Instalando Surge.sh..."
    npm install -g surge
fi

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
echo "🚀 Desplegando en Surge.sh..."
echo "=============================="

# Crear archivo 200.html para SPA routing
cp dist/index.html dist/200.html

# Desplegar
cd dist
surge . bondapp-$(date +%s).surge.sh

echo ""
echo "🎉 ¡DESPLEGADO!"
echo "Tu app está online en la URL que apareció arriba"
