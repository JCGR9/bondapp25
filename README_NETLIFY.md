# 🎵 **BondApp - Sistema de Gestión Musical**

## 🚀 **Despliegue en Netlify**

### **URL de Producción**
https://superlative-pie-4658b9.netlify.app/

### **Credenciales**
- **Usuario**: admin
- **Contraseña**: admin

---

## 🛠️ **Desarrollo Local**

### **Instalación**
```bash
npm install
```

### **Desarrollo**
```bash
npm run dev
```

### **Build**
```bash
npm run build
```

---

## 📱 **Características**

- ✅ **Responsive Design** - Mobile y Desktop
- ✅ **Firebase Integration** - Base de datos en tiempo real
- ✅ **Sincronización Cross-Device** - Entre móvil y PC
- ✅ **Material-UI** - Interfaz profesional
- ✅ **PWA Ready** - Instalable como app móvil

---

## 🌐 **Deploy Manual en Netlify**

1. **Build local**:
   ```bash
   npm run build
   ```

2. **Subir carpeta `dist/`** al dashboard de Netlify

3. **¡Listo!** - Tu app estará disponible en tu dominio de Netlify

---

## 🔧 **Configuración**

### **Variables de Entorno (Opcional)**
En Netlify Dashboard > Site Settings > Environment Variables:

```bash
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=bondad-sistema-bandas.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bondad-sistema-bandas
VITE_FIREBASE_STORAGE_BUCKET=bondad-sistema-bandas.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### **Configuración Automática**
La app funciona sin variables de entorno usando configuración por defecto.

---

## 🎯 **100% Netlify - Sin Vercel**

Este proyecto está completamente optimizado para **Netlify**:
- ✅ `netlify.toml` configurado
- ✅ Redirects para SPA
- ✅ Headers de seguridad
- ✅ Build automático desde GitHub

---

**¡Disfruta tu BondApp!** 🎉
