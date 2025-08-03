# 🌟 Despliegue SÚPER FÁCIL con Netlify

## ⚡ Opción 1: Drag & Drop (5 minutos)

### Paso 1: Build Local
```bash
npm run build:vercel
```

### Paso 2: Netlify Deploy
1. Ve a https://app.netlify.com/
2. Arrastra la carpeta `dist/` completa
3. ¡LISTO! Tu app está online

## 🔗 Opción 2: GitHub + Netlify (10 minutos)

### Paso 1: Subir a GitHub
```bash
git add .
git commit -m "App lista para Netlify"
git push origin main
```

### Paso 2: Conectar Netlify
1. Ve a https://app.netlify.com/
2. "New site from Git" → Conecta GitHub
3. Selecciona tu repo `bondapp25`
4. Build command: `npm run build:vercel`
5. Publish directory: `dist`
6. ¡Deploy!

## 🎯 Ventajas de Netlify
- ✅ Más fácil que Vercel
- ✅ Deploy automático desde GitHub
- ✅ HTTPS gratuito
- ✅ Sin configuración compleja
- ✅ Funciona con localStorage
- ✅ Dominio personalizado gratis

## 📝 No necesitas:
- ❌ Firebase (nada de backend)
- ❌ Google Drive API
- ❌ Variables de entorno complejas
- ❌ Configuración de servidores
