#!/bin/bash

echo "🚀 Iniciando BondApp en modo desarrollo..."
echo ""
echo "Opciones disponibles:"
echo "1. 🌐 Navegador web (recomendado para desarrollo rápido)"
echo "2. 🖥️  Aplicación de escritorio (para probar experiencia final)"
echo ""

read -p "Selecciona una opción (1 o 2): " choice

case $choice in
    1)
        echo "📱 Iniciando en navegador web..."
        npm run dev
        ;;
    2)
        echo "🖥️  Iniciando aplicación de escritorio..."
        npm run electron-dev
        ;;
    *)
        echo "❌ Opción no válida. Iniciando en navegador por defecto..."
        npm run dev
        ;;
esac
