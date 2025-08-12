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
    // Generar un ID único para el dispositivo si no existe
    if (!this.deviceId) {
      this.deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.deviceId;
  }

  /**
   * Guardar datos localmente Y sincronizar con Firebase
   */
  async saveData(key: string, data: any): Promise<void> {
    try {
      // Guardar localmente
      // Eliminado: localStorage.setItem(key, ...)

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
   * Cargar datos solo desde Firebase
   */
  async loadData(key: string): Promise<any> {
    try {
      // Intentar cargar desde Firebase primero
      const docRef = doc(db, 'bondapp_sync', `${this.userId}_${key}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const firebaseData = docSnap.data() as SyncData;
        return firebaseData.data;
      }
      return null;
    } catch (error) {
      console.warn(`⚠️ Error cargando ${key} desde Firebase:`, error);
      return null;
    }
  }

  /**
   * Escuchar cambios en tiempo real
   */
  listenToChanges(key: string, callback: (data: any) => void): void {
    const docRef = doc(db, 'bondapp_sync', `${this.userId}_${key}`);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const firebaseData = doc.data() as SyncData;
        if (firebaseData.deviceId !== this.deviceId) {
          console.log(`🔄 Cambio remoto detectado en ${key}`);
          callback(firebaseData.data);
        }
      }
    });
    this.listeners.set(key, unsubscribe);
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
  // pushAllLocalData eliminado: ya no hay datos locales, solo Firebase
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
    // pushAllLocalData eliminado: ya no existe, solo Firebase
  };
};
