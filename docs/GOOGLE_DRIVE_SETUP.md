# Configuración de Google Drive para BondApp

Esta guía te ayudará a configurar Google Drive API para almacenar archivos de contratos y partituras en la nube.

## ¿Por qué Google Drive?

- **Gratuito**: 15GB de almacenamiento gratuito
- **Accesible**: Los archivos son accesibles desde cualquier dispositivo
- **Seguro**: Respaldo automático en la nube de Google
- **Integrado**: Los archivos aparecen en tu Google Drive personal

## Configuración paso a paso

### 1. Crear un proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombra tu proyecto (ej: "BondApp")

### 2. Habilitar Google Drive API

1. En el menú lateral, ve a "APIs y servicios" > "Biblioteca"
2. Busca "Google Drive API"
3. Haz clic en "Habilitar"

### 3. Crear credenciales OAuth 2.0

1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" > "ID de cliente de OAuth 2.0"
3. Selecciona "Aplicación web"
4. Configura los orígenes autorizados:
   - Para desarrollo: `http://localhost:5173`
   - Para producción: tu dominio de la app
5. Configura URIs de redirección:
   - Para desarrollo: `http://localhost:5173`
   - Para producción: tu dominio de la app

### 4. Configurar variables de entorno

1. Copia `.env.example` como `.env.local`
2. Completa las variables de Google Drive:

```bash
VITE_GOOGLE_CLIENT_ID=tu_client_id_aqui
VITE_GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
```

### 5. Configurar la pantalla de consentimiento OAuth

1. Ve a "APIs y servicios" > "Pantalla de consentimiento de OAuth"
2. Selecciona "Externo" para usuarios fuera de tu organización
3. Completa la información básica:
   - Nombre de la aplicación: "BondApp"
   - Correo de soporte al usuario: tu email
   - Logotipo (opcional)
4. Agrega ámbitos necesarios:
   - `https://www.googleapis.com/auth/drive.file`
5. Agrega usuarios de prueba (mientras está en desarrollo)

## Estructura de carpetas en Google Drive

BondApp creará automáticamente esta estructura en tu Google Drive:

```
BondApp/
├── Contratos/
│   ├── contrato1.pdf
│   ├── contrato2.docx
│   └── ...
└── Partituras/
    ├── partitura1.pdf
    ├── partitura2.pdf
    └── ...
```

## Funcionamiento

### Subida de archivos
- Los archivos se suben directamente a Google Drive
- Se almacenan en carpetas organizadas por módulo
- Se guarda una referencia con el ID del archivo en Firestore

### Descarga de archivos
- Los archivos se descargan directamente desde Google Drive
- Se mantienen los nombres originales
- Los archivos siguen siendo accesibles desde tu Google Drive

### Permisos
- Los archivos son privados por defecto
- Solo tu cuenta de Google puede acceder a ellos
- La aplicación solo puede crear y acceder a archivos que ella misma creó

## Ventajas de esta configuración

1. **Sin límites de almacenamiento de Firebase**: Usamos Firestore solo para metadatos
2. **15GB gratuitos**: Mucho espacio para documentos y partituras
3. **Respaldo automático**: Los archivos están seguros en Google Drive
4. **Acceso universal**: Puedes acceder a los archivos desde cualquier dispositivo
5. **Organización**: Carpetas automáticas para cada módulo

## Solución de problemas

### Error: "invalid_client"
- Verifica que las URLs de origen estén correctamente configuradas
- Asegúrate de que el CLIENT_ID y CLIENT_SECRET sean correctos

### Error: "access_denied"
- El usuario debe autorizar el acceso a Google Drive
- Verifica que los ámbitos estén correctamente configurados

### Archivos no aparecen
- Verifica que las carpetas se hayan creado correctamente
- Revisa la consola del navegador para errores de API

## Desarrollo vs Producción

### Desarrollo (localhost:5173)
- Usa las credenciales de desarrollo
- Los archivos se crean en tu Google Drive personal

### Producción
- Configura las mismas variables en tu plataforma de hosting
- Los usuarios autorizan el acceso con sus propias cuentas de Google
- Cada usuario tiene sus propios archivos en su Google Drive
