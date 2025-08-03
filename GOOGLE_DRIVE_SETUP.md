# 🔧 Guía de Configuración de Google Drive API

## Paso 1: Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el **Project ID** que aparece en la barra superior

## Paso 2: Habilitar Google Drive API

1. En el menú lateral, ve a **APIs & Services** → **Library**
2. Busca "Google Drive API"
3. Haz clic en **ENABLE**

## Paso 3: Crear Credenciales OAuth 2.0

1. Ve a **APIs & Services** → **Credentials**
2. Haz clic en **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**
3. Si es la primera vez, configura la pantalla de consentimiento OAuth:
   - Selecciona **External** (para uso personal)
   - Completa los campos obligatorios:
     - **App name**: BondApp
     - **User support email**: tu email
     - **Developer contact information**: tu email
   - Guarda y continúa
4. En **Scopes**, haz clic en **ADD OR REMOVE SCOPES** y añade:
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/drive.appdata`
5. En **Test users**, añade tu email personal
6. Revisa y vuelve al dashboard

## Paso 4: Configurar OAuth Client ID

1. De vuelta en **Credentials**, haz clic en **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**
2. Selecciona **Web application**
3. Configura:
   - **Name**: BondApp OAuth Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:5174`
   - **Authorized redirect URIs**:
     - `http://localhost:5174`
4. Haz clic en **CREATE**
5. **IMPORTANTE**: Copia el **Client ID** y **Client Secret**

## Paso 5: Actualizar credentials.json

Abre el archivo `credentials.json` en la raíz del proyecto y reemplaza:

```json
{
  "web": {
    "client_id": "TU_CLIENT_ID_AQUI.apps.googleusercontent.com",
    "project_id": "tu-proyecto-id", 
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "TU_CLIENT_SECRET_aqui",
    "redirect_uris": [
      "http://localhost:5174"
    ]
  }
}
```

**Reemplaza:**
- `TU_CLIENT_ID_AQUI` → Tu Client ID real
- `tu-proyecto-id` → Tu Project ID real  
- `TU_CLIENT_SECRET_aqui` → Tu Client Secret real

## Paso 6: Activar Google Drive en el código

Una vez configuradas las credenciales, activa Google Drive descomentando las importaciones:

### En ContractsManagerPage.tsx:
```typescript
// Cambiar estas líneas:
// import { GoogleDriveService } from '../services/googleDriveService';
// import { driveFolderManager } from '../services/googleDriveFolderManager';

// Por estas:
import { GoogleDriveService } from '../services/googleDriveService';
import { driveFolderManager } from '../services/googleDriveFolderManager';
```

### En ScoresManagerPage.tsx:
```typescript
// Cambiar estas líneas:  
// import { GoogleDriveService } from '../services/googleDriveService';
// import { driveFolderManager } from '../services/googleDriveFolderManager';

// Por estas:
import { GoogleDriveService } from '../services/googleDriveService';
import { driveFolderManager } from '../services/googleDriveFolderManager';
```

## Paso 7: Probar la Configuración

1. Reinicia la aplicación Electron
2. Ve a la sección de Contratos o Partituras
3. Intenta subir un archivo
4. La primera vez te pedirá autorización en el navegador
5. Autoriza la aplicación
6. Los archivos se subirán a Google Drive

## ⚠️ Notas Importantes

- **credentials.json** está en .gitignore para proteger tus credenciales
- La primera autorización abrirá una ventana del navegador
- Los archivos se organizarán automáticamente en carpetas en Google Drive
- Para producción, considera usar variables de entorno

## 🔍 Solución de Problemas

- **Error "redirect_uri_mismatch"**: Verifica que `http://localhost:5174` esté en redirect URIs
- **Error "invalid_client"**: Verifica que client_id y client_secret sean correctos
- **Error "access_denied"**: Asegúrate de que tu email esté en "Test users"
- **No aparece código de verificación**: Si después de autorizar no ves un código, revisa la URL en tu navegador - el código está ahí como parámetro

## 💡 Obtener el código de autorización

Después de autorizar la aplicación en Google, serás redirigido a:
```
http://localhost:5174/?code=4/0AfJohXlih8aR9Q-ejemplo-codigo-muy-largo&scope=https://www.googleapis.com/auth/drive.file...
```

**El código que necesitas está después de `code=` y antes del siguiente `&`**

Por ejemplo, en esta URL:
```
http://localhost:5174/?code=4/0AfJohXlih8aR9Q-ejemplo-codigo-muy-largo&scope=...
```

El código sería: `4/0AfJohXlih8aR9Q-ejemplo-codigo-muy-largo`

### 📋 Pasos para obtener el código:

1. **Después de autorizar** en Google, serás redirigido a localhost:5174
2. **La página puede mostrar error** (es normal si no hay servidor)
3. **En la barra de direcciones del navegador**, busca `?code=`
4. **Copia todo el texto** desde después de `code=` hasta el siguiente `&`
5. **Pega ese código** en la aplicación BondApp

¿Tienes ya un proyecto en Google Cloud Console o necesitas que te guíe desde cero?
