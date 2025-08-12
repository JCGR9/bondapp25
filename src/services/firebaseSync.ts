import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Tipos para los datos
interface SyncData {
  id: string;
  data: any;
  lastModified: Timestamp;
  deviceId: string;
}

export class FirebaseSyncService {
  private deviceId: string | null;
  private listeners: Map<string, () => void> = new Map();

  constructor() {
    // Generar ID único del dispositivo/sesión
    this.deviceId = this.getOrCreateDeviceId();
  }

  private getOrCreateDeviceId(): string | null {
    // Eliminado: localStorage.getItem('bondapp_device_id');
    // Eliminado: lógica de deviceId y localStorage
    return null;
  }

  // Sincronizar datos con Firebase
  async syncCollection(collectionName: string, localData: any[]): Promise<void> {
    try {
      console.log(`🔄 Sincronizando ${collectionName} con Firebase...`);
      
      const collectionRef = collection(db, collectionName);
      const batch = writeBatch(db);

      // Crear documento principal para la colección
      const mainDocRef = doc(collectionRef, 'main');
      const syncData: SyncData = {
        id: 'main',
        data: localData,
        lastModified: serverTimestamp() as Timestamp,
        deviceId: this.deviceId || ''
      };

      batch.set(mainDocRef, syncData);
      await batch.commit();

      console.log(`✅ ${collectionName} sincronizado exitosamente`);
    } catch (error) {
      console.error(`❌ Error sincronizando ${collectionName}:`, error);
      throw error;
    }
  }

  // Obtener datos desde Firebase
  async getCollection(collectionName: string): Promise<any[]> {
    try {
      console.log(`📥 Obteniendo ${collectionName} desde Firebase...`);
      
      const docRef = doc(db, collectionName, 'main');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const syncData = docSnap.data() as SyncData;
        console.log(`✅ ${collectionName} obtenido desde Firebase`);
        return syncData.data || [];
      } else {
        console.log(`📋 No hay datos de ${collectionName} en Firebase`);
        return [];
      }
    } catch (error) {
      console.error(`❌ Error obteniendo ${collectionName}:`, error);
      return [];
    }
  }

  // Escuchar cambios en tiempo real
  subscribeToCollection(
    collectionName: string, 
    callback: (data: any[]) => void
  ): () => void {
    console.log(`👂 Suscribiéndose a cambios en ${collectionName}...`);
    
    const docRef = doc(db, collectionName, 'main');
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const syncData = doc.data() as SyncData;
        // Solo actualizar si el cambio viene de otro dispositivo
        if (syncData.deviceId !== this.deviceId) {
          console.log(`📱 Actualizando ${collectionName} desde otro dispositivo`);
          callback(syncData.data || []);
        }
      }
    }, (error) => {
      console.error(`❌ Error en subscripción de ${collectionName}:`, error);
    });

    this.listeners.set(collectionName, unsubscribe);
    return unsubscribe;
  }

  // Desuscribirse de todos los listeners
  unsubscribeAll(): void {
    this.listeners.forEach((unsubscribe, collectionName) => {
      console.log(`🔇 Desuscribiéndose de ${collectionName}`);
      unsubscribe();
    });
    this.listeners.clear();
  }

  // Método para sincronizar todos los datos locales a Firebase
  async syncAllLocalDataToFirebase(): Promise<void> {
    const collections = [
      'bondapp-performances',
      'bondapp-components', 
      'bondapp-contracts',
      'bondapp-inventory',
      'bondapp-finances',
      'bondapp_scores',
      'bondapp-tasks'
    ];

    console.log('🚀 Iniciando sincronización completa con Firebase...');

    for (const localKey of collections) {
      try {
        const localData = localStorage.getItem(localKey);
        if (localData) {
          const parsedData = JSON.parse(localData);
          const firebaseCollectionName = localKey.replace('bondapp-', '').replace('bondapp_', '');
          await this.syncCollection(firebaseCollectionName, parsedData);
        }
      } catch (error) {
        console.error(`❌ Error sincronizando ${localKey}:`, error);
      }
    }

    console.log('✅ Sincronización completa finalizada');
  }

  // Método para obtener todos los datos desde Firebase
  async loadAllDataFromFirebase(): Promise<{[key: string]: any[]}> {
    const collections = [
      'performances',
      'components', 
      'contracts',
      'inventory',
      'finances',
      'scores',
      'tasks'
    ];

    const allData: {[key: string]: any[]} = {};

    console.log('📥 Cargando todos los datos desde Firebase...');

    for (const collectionName of collections) {
      try {
        const data = await this.getCollection(collectionName);
        allData[collectionName] = data;
        
        // Eliminado: Actualizar localStorage con datos de Firebase
        // Eliminado: localStorage.setItem(localKey, JSON.stringify(data));
      } catch (error) {
        console.error(`❌ Error cargando ${collectionName}:`, error);
        allData[collectionName] = [];
      }
    }

    console.log('✅ Todos los datos cargados desde Firebase');
    return allData;
  }

  // Verificar estado de conexión con Firebase
  async checkConnection(): Promise<boolean> {
    try {
      const testDoc = doc(db, 'connection-test', 'test');
      await setDoc(testDoc, { 
        timestamp: serverTimestamp(),
        deviceId: this.deviceId 
      });
      console.log('✅ Conexión con Firebase OK');
      return true;
    } catch (error) {
      console.error('❌ Error de conexión con Firebase:', error);
      return false;
    }
  }
}

// Instancia singleton
export const firebaseSyncService = new FirebaseSyncService();
