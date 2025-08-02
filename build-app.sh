#!/bin/bash

echo "🚀 Construyendo BondApp para distribución..."

# Limpiar directorios previos
rm -rf dist
rm -rf dist-electron

echo "📦 Compilando aplicación web..."
npm run build

echo "🖥️  Creando aplicación de escritorio..."
npm run dist

echo "✅ ¡BondApp está listo para distribución!"
echo ""
echo "📁 Archivos generados:"
echo "   - dist-electron/ (contiene los instaladores)"
echo "   - dist/ (aplicación web compilada)"
echo ""
echo "🎯 Instaladores disponibles:"
ls -la dist-electron/ 2>/dev/null || echo "   (Ejecuta el script para generar instaladores)"
