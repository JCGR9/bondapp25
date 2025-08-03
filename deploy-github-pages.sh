#!/bin/bash

# Deploy automático a GitHub Pages
echo "🚀 Desplegando en GitHub Pages..."

# Build de la aplicación
echo "📦 Construyendo aplicación..."
npm run build:vercel

# Verificar que el build existe
if [ ! -d "dist" ]; then
    echo "❌ Error: No se encontró el directorio dist"
    exit 1
fi

# Crear rama gh-pages si no existe
git checkout -b gh-pages 2>/dev/null || git checkout gh-pages

# Copiar archivos del build
echo "📋 Copiando archivos..."
rm -rf *.html *.js *.css assets/ 2>/dev/null
cp -r dist/* .

# Añadir archivos al git
git add .
git commit -m "Deploy to GitHub Pages - $(date)"

# Push a GitHub Pages
echo "🌐 Subiendo a GitHub Pages..."
git push origin gh-pages --force

# Volver a main
git checkout main

echo ""
echo "✅ ¡Despliegue completado!"
echo "🔗 Tu app estará disponible en:"
echo "   https://jcgr9.github.io/bondapp25/"
echo ""
echo "⏱️  Puede tardar 1-2 minutos en estar disponible"
