/**
 * Servicio de Sincronización Cross-Device para BondApp
 * Sincroniza datos entre diferentes dispositivos usando Firebase Firestore
 */

import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

interface SyncData {
  data: any;
  timestamp: any;
  deviceId: string;
  userId: string;
}

class SyncService {
  private deviceId: string;
  private userId: string;
  private listeners: Map<string, () => void> = new Map();

  constructor() {
    // Generar ID único del dispositivo
    this.deviceId = this.getOrCreateDeviceId();
    this.userId = 'admin'; // Por ahora usamos un usuario fijo
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('bondapp_device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('bondapp_device_id', deviceId);
    }
    return deviceId;
  }

  /**
   * Guardar datos localmente Y sincronizar con Firebase
   */
  async saveData(key: string, data: any): Promise<void> {
    try {
      // Guardar localmente
      localStorage.setItem(key, JSON.stringify(data));

      // Sincronizar con Firebase
      const docRef = doc(db, 'bondapp_sync', `${this.userId}_${key}`);
      await setDoc(docRef, {
        data: data,
        timestamp: serverTimestamp(),
        deviceId: this.deviceId,
        userId: this.userId,
        key: key
      });

      console.log(`✅ Datos sincronizados: ${key}`);
    } catch (error) {
      console.warn(`⚠️ Error sincronizando ${key}:`, error);
      // Los datos se guardan localmente aunque falle Firebase
    }
  }

  /**
   * Cargar datos priorizando Firebase sobre localStorage
   */
  async loadData(key: string): Promise<any> {
    try {
      // Intentar cargar desde Firebase primero
      const docRef = doc(db, 'bondapp_sync', `${this.userId}_${key}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const firebaseData = docSnap.data() as SyncData;
        const localData = localStorage.getItem(key);

        if (localData) {
          const localTimestamp = JSON.parse(localData)?.lastModified || 0;
          const firebaseTimestamp = firebaseData.timestamp?.toMillis() || 0;

          // Si Firebase tiene datos más recientes
          if (firebaseTimestamp > localTimestamp) {
            console.log(`🔄 Actualizando ${key} desde Firebase`);
            localStorage.setItem(key, JSON.stringify({
              ...firebaseData.data,
              lastModified: firebaseTimestamp
            }));
            return firebaseData.data;
          }
        } else {
          // No hay datos locales, usar Firebase
          console.log(`📥 Cargando ${key} desde Firebase`);
          localStorage.setItem(key, JSON.stringify({
            ...firebaseData.data,
            lastModified: firebaseData.timestamp?.toMillis() || Date.now()
          }));
          return firebaseData.data;
        }
      }

      // Fallback a localStorage
      const localData = localStorage.getItem(key);
      return localData ? JSON.parse(localData) : null;

    } catch (error) {
      console.warn(`⚠️ Error cargando ${key} desde Firebase:`, error);
      // Fallback a localStorage
      const localData = localStorage.getItem(key);
      return localData ? JSON.parse(localData) : null;
    }
  }

  /**
   * Escuchar cambios en tiempo real
   */
  listenToChanges(key: string, callback: (data: any) => void): void {
    try {
      const docRef = doc(db, 'bondapp_sync', `${this.userId}_${key}`);
      
      const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          const firebaseData = doc.data() as SyncData;
          
          // Solo actualizar si no fue este dispositivo el que hizo el cambio
          if (firebaseData.deviceId !== this.deviceId) {
            console.log(`🔄 Cambio remoto detectado en ${key}`);
            
            // Actualizar localStorage
            localStorage.setItem(key, JSON.stringify({
              ...firebaseData.data,
              lastModified: firebaseData.timestamp?.toMillis() || Date.now()
            }));
            
            // Notificar al callback
            callback(firebaseData.data);
          }
        }
      });

      // Guardar el listener para poder limpiarlo después
      this.listeners.set(key, unsubscribe);

    } catch (error) {
      console.warn(`⚠️ Error configurando listener para ${key}:`, error);
    }
  }

  /**
   * Detener escucha de cambios
   */
  stopListening(key: string): void {
    const unsubscribe = this.listeners.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(key);
    }
  }

  /**
   * Sincronizar todos los datos de BondApp
   */
  async syncAllData(): Promise<void> {
    const keys = [
      'bondapp-performances',
      'bondapp-components', 
      'bondapp-contracts',
      'bondapp-finances',
      'bondapp-inventory',
      'bondapp-tasks',
      'bondapp-scores',
      'bondapp-instruments'
    ];

    console.log('🔄 Iniciando sincronización completa...');

    for (const key of keys) {
      try {
        const data = await this.loadData(key);
        if (data) {
          console.log(`✅ ${key}: sincronizado`);
        }
      } catch (error) {
        console.warn(`⚠️ Error sincronizando ${key}:`, error);
      }
    }

    console.log('✅ Sincronización completa terminada');
  }

  /**
   * Obtener estado de sincronización
   */
  async getSyncStatus(): Promise<{
    lastSync: Date | null;
    deviceId: string;
    isOnline: boolean;
  }> {
    return {
      lastSync: new Date(),
      deviceId: this.deviceId,
      isOnline: navigator.onLine
    };
  }

  /**
   * Forzar push de datos locales a Firebase
   */
  async pushAllLocalData(): Promise<void> {
    const keys = [
      'bondapp-performances',
      'bondapp-components', 
      'bondapp-contracts',
      'bondapp-finances',
      'bondapp-inventory',
      'bondapp-tasks',
      'bondapp-scores',
      'bondapp-instruments'
    ];

    console.log('📤 Enviando todos los datos locales a Firebase...');

    for (const key of keys) {
      const localData = localStorage.getItem(key);
      if (localData) {
        try {
          const data = JSON.parse(localData);
          await this.saveData(key, data);
          console.log(`✅ ${key}: enviado`);
        } catch (error) {
          console.warn(`⚠️ Error enviando ${key}:`, error);
        }
      }
    }

    console.log('✅ Envío completo terminado');
  }
}

// Instancia singleton
export const syncService = new SyncService();

// Hook para usar en componentes React
export const useBondAppSync = () => {
  return {
    saveData: syncService.saveData.bind(syncService),
    loadData: syncService.loadData.bind(syncService),
    listenToChanges: syncService.listenToChanges.bind(syncService),
    stopListening: syncService.stopListening.bind(syncService),
    syncAllData: syncService.syncAllData.bind(syncService),
    getSyncStatus: syncService.getSyncStatus.bind(syncService),
    pushAllLocalData: syncService.pushAllLocalData.bind(syncService),
  };
};
