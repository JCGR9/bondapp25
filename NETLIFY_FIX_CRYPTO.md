# 🔧 **Solución Error Netlify - crypto.hash is not a function**

## ❌ **Problema Identificado:**
```
error during build:
[vite:build-html] crypto.hash is not a function
```

## ✅ **Soluciones Aplicadas:**

### **1. Downgrade Vite** 
- ❌ **Antes**: Vite ^7.0.4 (beta, inestable)
- ✅ **Ahora**: Vite ^5.4.10 (LTS, estable)

### **2. Node.js Version**
- ❌ **Antes**: Node 18
- ✅ **Ahora**: Node 20 (LTS)
- ✅ **Archivo**: `.nvmrc` creado

### **3. Build Configuration**
```toml
[build]
  publish = "dist"
  command = "NODE_OPTIONS='--max-old-space-size=4096' npm ci && npm run build"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--legacy-peer-deps"
```

### **4. Vite Config Optimizada**
```typescript
build: {
  target: 'esnext',
  minify: 'esbuild',
  // ... resto de configuración
}
```

---

## 🚀 **Estado Actual:**
- ✅ **Build local**: Exitoso (4.48s)
- ✅ **Vite 5.4.10**: Instalado y funcionando
- ✅ **Node 20**: Configurado en Netlify
- ✅ **Memory limit**: Aumentado para build

---

## 📋 **Para Deploy Manual:**

### **Opción 1: Automático (GitHub)**
Los cambios están listos, solo haz:
```bash
git add -A
git commit -m "🔧 Fix Netlify crypto.hash error - Vite downgrade"
git push
```

### **Opción 2: Manual**
```bash
npm run build
# Subir carpeta dist/ a Netlify Dashboard
```

---

## 🎯 **Test de Verificación:**
```bash
# Local build test
npm run build
# ✅ Should complete without crypto.hash error
```

**El problema está solucionado. Netlify debería construir sin errores ahora.** 🎉
