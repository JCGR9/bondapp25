#!/bin/bash

# Script de troubleshooting para Netlify
echo "🔧 BondApp Netlify Troubleshooting"
echo "=================================="

echo "📋 Verificando configuración..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

echo "📦 Limpiando caché..."
npm ci --force

echo "🔨 Build con configuración optimizada..."
NODE_OPTIONS="--max-old-space-size=4096" npm run build

echo "✅ Build completado"
