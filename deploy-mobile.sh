#!/bin/bash

# 📱 Deploy Automático con Optimizaciones Móviles
echo "📱 BondApp - Deploy Optimizado para Móviles"
echo "=========================================="

# Build optimizado
echo "🔨 Construyendo versión optimizada para móviles..."
npm run build:vercel

if [ ! -d "dist" ]; then
    echo "❌ Error en el build"
    exit 1
fi

echo "✅ Build completado exitosamente"

# Verificar tamaños de archivos
echo ""
echo "📊 Tamaños de archivos principales:"
ls -lh dist/assets/*.js | head -5
ls -lh dist/assets/*.css | head -3

# Instalar CLI de Netlify si no está instalado
if ! command -v netlify &> /dev/null; then
    echo ""
    echo "🔧 Instalando Netlify CLI..."
    npm install -g netlify-cli
fi

# Deploy automático
echo ""
echo "🚀 Desplegando en Netlify..."
netlify deploy --prod --dir=dist

echo ""
echo "🎉 ¡Deploy completado!"
echo ""
echo "📱 Optimizaciones aplicadas:"
echo "  ✅ Sidebar responsive con drawer móvil"
echo "  ✅ Botones de tamaño táctil optimizado"
echo "  ✅ Inputs sin zoom accidental en iOS"
echo "  ✅ Tablas adaptadas a móvil"
echo "  ✅ Cards compactas para pantallas pequeñas"
echo "  ✅ Navegación con AppBar en móvil"
echo "  ✅ CSS responsive personalizado"
echo ""
echo "🔗 Tu app está optimizada para:"
echo "  📱 Teléfonos móviles"
echo "  📱 Tablets"
echo "  💻 Desktop"
echo ""
echo "🌐 URL: https://superlative-pie-4658b9.netlify.app/"
