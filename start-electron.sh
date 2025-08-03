#!/bin/bash

echo "🚀 Iniciando BondApp en modo Electron..."

# Verificar si hay procesos corriendo en el puerto 5175
if lsof -Pi :5175 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Puerto 5175 ocupado, terminando procesos..."
    lsof -ti:5175 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Verificar si hay procesos de Electron corriendo
if pgrep -f "electron.*bondapp" > /dev/null; then
    echo "⚠️  Terminando procesos de Electron existentes..."
    pkill -f "electron.*bondapp" || true
    sleep 2
fi

echo "📦 Iniciando servidor de desarrollo Vite..."
npm run dev &
VITE_PID=$!

echo "⏳ Esperando a que el servidor esté listo..."
sleep 5

echo "🖥️  Iniciando aplicación Electron..."
npm run electron &
ELECTRON_PID=$!

echo "✅ BondApp iniciado exitosamente!"
echo "📋 PIDs: Vite=$VITE_PID, Electron=$ELECTRON_PID"
echo "🛑 Para terminar: Ctrl+C"

# Función para limpiar procesos al salir
cleanup() {
    echo "🧹 Limpiando procesos..."
    kill $VITE_PID 2>/dev/null || true
    kill $ELECTRON_PID 2>/dev/null || true
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Esperar a que termine
wait
