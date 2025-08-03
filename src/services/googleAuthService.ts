interface GoogleCredentials {
  installed: {
    client_id: string;
    project_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_secret: string;
    redirect_uris: string[];
  };
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export class GoogleAuthService {
  private static instance: GoogleAuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private credentials: GoogleCredentials | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🔐 Inicializando autenticación de Google...');
      
      // Cargar credenciales desde archivo local
      this.credentials = await this.loadCredentials();
      
      // Intentar cargar tokens guardados
      const savedTokens = localStorage.getItem('google_tokens');
      if (savedTokens) {
        const tokens = JSON.parse(savedTokens);
        this.accessToken = tokens.access_token;
        this.refreshToken = tokens.refresh_token;
      }

      this.isInitialized = true;
      console.log('✅ Autenticación de Google inicializada');
    } catch (error) {
      console.error('❌ Error al inicializar autenticación de Google:', error);
      throw error;
    }
  }

  private async loadCredentials(): Promise<GoogleCredentials> {
    try {
      // Intentar múltiples métodos para cargar las credenciales
      let credentialsData: string;
      
      try {
        // Método 1: Intentar con require de electron (puede fallar en renderer)
        let appPath: string;
        
        try {
          const { app } = require('electron');
          appPath = app ? app.getAppPath() : process.cwd();
        } catch {
          // Si electron no está disponible, usar process.cwd()
          appPath = process.cwd();
        }
        
        const path = require('path');
        const fs = require('fs');
        
        const credentialsPath = path.join(appPath, 'credentials.json');
        
        console.log('🔍 Buscando credenciales en:', credentialsPath);
        
        if (fs.existsSync(credentialsPath)) {
          credentialsData = fs.readFileSync(credentialsPath, 'utf8');
          console.log('✅ Credenciales cargadas desde:', credentialsPath);
        } else {
          throw new Error('Archivo no encontrado');
        }
      } catch (fsError) {
        console.log('⚠️ Método de archivo falló, intentando método de respaldo...');
        
        // Método 2: Respaldo con credenciales hardcodeadas
        const hardcodedCredentials = {
          installed: {
            client_id: "36237009638-q3gbare7ci1vi79ldv4sb0m5pleih62c.apps.googleusercontent.com",
            project_id: "versatile-being-467909-t3",
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_secret: "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",
            redirect_uris: ["http://localhost:5174"]
          }
        };
        
        console.log('🔧 Usando credenciales hardcodeadas como respaldo');
        return hardcodedCredentials;
      }
      
      return JSON.parse(credentialsData);
    } catch (error) {
      console.error('❌ Error al cargar credenciales:', error);
      
      // Como último recurso, devolver las credenciales hardcodeadas
      console.log('🚨 Último recurso: credenciales hardcodeadas');
      return {
        installed: {
          client_id: "36237009638-q3gbare7ci1vi79ldv4sb0m5pleih62c.apps.googleusercontent.com",
          project_id: "versatile-being-467909-t3",
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_secret: "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",
          redirect_uris: ["http://localhost:5174"]
        }
      };
    }
  }

  async getAuthClient() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.credentials) {
      throw new Error('Google Auth no inicializado');
    }

    return this.credentials.installed;
  }

  async getAccessToken(): Promise<string> {
    if (!this.accessToken) {
      throw new Error('No hay token de acceso. Necesitas autorizar la aplicación primero.');
    }
    
    return this.accessToken;
  }

  getAuthUrl(): string {
    if (!this.credentials) {
      throw new Error('Credenciales no cargadas. Llama a initialize() primero.');
    }

    const params = new URLSearchParams({
      client_id: this.credentials.installed.client_id,
      redirect_uri: this.credentials.installed.redirect_uris[0],
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `${this.credentials.installed.auth_uri}?${params.toString()}`;
  }

  async authorize(): Promise<string> {
    if (!this.credentials) {
      await this.initialize();
    }

    const authUrl = this.generateAuthUrl();
    console.log('🔗 URL de autorización:', authUrl);
    
    // Método simple: usar window.open() que será interceptado por Electron
    // El setWindowOpenHandler en main.js se encargará de abrirlo en el navegador externo
    try {
      console.log('🚀 Intentando abrir URL en navegador externo...');
      window.open(authUrl, '_blank', 'noopener,noreferrer');
      console.log('✅ Comando enviado para abrir navegador');
    } catch (error) {
      console.error('❌ Error al intentar abrir navegador:', error);
      // Como respaldo, mostrar la URL al usuario
      alert(`Por favor, copia esta URL y ábrela en tu navegador:\n\n${authUrl}`);
    }
    
    // El usuario debe copiar el código de autorización manualmente
    throw new Error('Por favor, autoriza la aplicación en el navegador y copia el código de autorización.');
  }

  async exchangeCodeForTokens(code: string): Promise<void> {
    if (!this.credentials) {
      throw new Error('Credenciales no cargadas');
    }

    console.log('🔄 Intercambiando código de autorización por tokens...');
    
    const tokenUrl = this.credentials.installed.token_uri;
    const params = new URLSearchParams({
      client_id: this.credentials.installed.client_id,
      client_secret: this.credentials.installed.client_secret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: this.credentials.installed.redirect_uris[0]
    });

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error al obtener tokens: ${response.status} - ${errorText}`);
      }

      const tokens: TokenResponse = await response.json();
      
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token || null;
      
      // Guardar tokens en localStorage
      localStorage.setItem('google_tokens', JSON.stringify(tokens));
      
      console.log('✅ Tokens obtenidos y guardados correctamente');
    } catch (error) {
      console.error('❌ Error al intercambiar código por tokens:', error);
      throw error;
    }
  }

  private async exchangeCodeForTokensInternal(code: string): Promise<void> {
    if (!this.credentials) {
      throw new Error('Credenciales no cargadas');
    }

    const tokenUrl = this.credentials.installed.token_uri;
    const params = new URLSearchParams({
      client_id: this.credentials.installed.client_id,
      client_secret: this.credentials.installed.client_secret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: this.credentials.installed.redirect_uris[0]
    });

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      });

      if (!response.ok) {
        throw new Error(`Error al obtener tokens: ${response.status}`);
      }

      const tokens: TokenResponse = await response.json();
      
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token || null;
      
      // Guardar tokens en localStorage
      localStorage.setItem('google_tokens', JSON.stringify(tokens));
      
      console.log('✅ Tokens obtenidos y guardados correctamente');
    } catch (error) {
      console.error('❌ Error al intercambiar código por tokens:', error);
      throw error;
    }
  }

  private generateAuthUrl(): string {
    if (!this.credentials) {
      throw new Error('Credenciales no cargadas');
    }

    const params = new URLSearchParams({
      client_id: this.credentials.installed.client_id,
      redirect_uri: this.credentials.installed.redirect_uris[0],
      scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata',
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `${this.credentials.installed.auth_uri}?${params.toString()}`;
  }

  isReady(): boolean {
    const ready = this.isInitialized && this.accessToken !== null;
    console.log(`🔍 GoogleAuth isReady check:`, {
      isInitialized: this.isInitialized,
      hasAccessToken: this.accessToken !== null,
      ready: ready
    });
    return ready;
  }

  // Método de debug para verificar el estado
  getDebugInfo(): any {
    const savedTokens = localStorage.getItem('google_tokens');
    return {
      isInitialized: this.isInitialized,
      hasAccessToken: this.accessToken !== null,
      hasRefreshToken: this.refreshToken !== null,
      hasCredentials: this.credentials !== null,
      savedTokensInStorage: savedTokens !== null,
      savedTokensPreview: savedTokens ? savedTokens.substring(0, 50) + '...' : null
    };
  }
}

export const googleAuthService = GoogleAuthService.getInstance();
