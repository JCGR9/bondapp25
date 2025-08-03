/**
 * Hook personalizado para gestión de datos con sincronización automática
 * Reemplaza el uso directo de localStorage con sincronización en Firebase
 */

import { useState, useEffect, useCallback } from 'react';
import { useBondAppSync } from '../services/syncService';

interface UseStorageOptions {
  autoSync?: boolean;
  listenToChanges?: boolean;
}

export function useBondAppStorage<T>(
  key: string, 
  defaultValue: T,
  options: UseStorageOptions = { autoSync: true, listenToChanges: true }
) {
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { saveData, loadData, listenToChanges, stopListening } = useBondAppSync();

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const savedData = await loadData(key);
        if (savedData !== null) {
          setData(savedData);
        }
      } catch (err) {
        console.error(`Error loading ${key}:`, err);
        setError(`Error cargando ${key}`);
        
        // Fallback a localStorage directo
        try {
          const localData = localStorage.getItem(key);
          if (localData) {
            setData(JSON.parse(localData));
          }
        } catch (localErr) {
          console.error(`Error loading from localStorage for ${key}:`, localErr);
        }
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [key, loadData]);

  // Escuchar cambios remotos
  useEffect(() => {
    if (!options.listenToChanges) return;

    const handleRemoteChange = (newData: T) => {
      console.log(`🔄 Remote change detected for ${key}`);
      setData(newData);
    };

    listenToChanges(key, handleRemoteChange);

    return () => {
      stopListening(key);
    };
  }, [key, options.listenToChanges, listenToChanges, stopListening]);

  // Función para actualizar datos
  const updateData = useCallback(async (newData: T | ((prev: T) => T)) => {
    try {
      setError(null);
      
      const finalData = typeof newData === 'function' 
        ? (newData as (prev: T) => T)(data)
        : newData;
      
      // Actualizar estado local inmediatamente
      setData(finalData);
      
      if (options.autoSync) {
        // Sincronizar con Firebase
        await saveData(key, finalData);
      } else {
        // Solo guardar localmente
        localStorage.setItem(key, JSON.stringify(finalData));
      }
      
    } catch (err) {
      console.error(`Error updating ${key}:`, err);
      setError(`Error guardando ${key}`);
      
      // Fallback a localStorage
      try {
        const finalData = typeof newData === 'function' 
          ? (newData as (prev: T) => T)(data)
          : newData;
        localStorage.setItem(key, JSON.stringify(finalData));
        setData(finalData);
      } catch (localErr) {
        console.error(`Error saving to localStorage for ${key}:`, localErr);
      }
    }
  }, [data, key, options.autoSync, saveData]);

  // Función para refrescar datos desde Firebase
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const refreshedData = await loadData(key);
      if (refreshedData !== null) {
        setData(refreshedData);
      }
    } catch (err) {
      console.error(`Error refreshing ${key}:`, err);
      setError(`Error actualizando ${key}`);
    } finally {
      setLoading(false);
    }
  }, [key, loadData]);

  // Función para forzar sincronización
  const sync = useCallback(async () => {
    try {
      setError(null);
      await saveData(key, data);
    } catch (err) {
      console.error(`Error syncing ${key}:`, err);
      setError(`Error sincronizando ${key}`);
    }
  }, [key, data, saveData]);

  return {
    data,
    setData: updateData,
    loading,
    error,
    refresh,
    sync
  };
}

// Hook especializado para cada tipo de datos de BondApp
export const useBondAppPerformances = () => 
  useBondAppStorage('bondapp-performances', []);

export const useBondAppComponents = () => 
  useBondAppStorage('bondapp-components', []);

export const useBondAppContracts = () => 
  useBondAppStorage('bondapp-contracts', []);

export const useBondAppFinances = () => 
  useBondAppStorage('bondapp-finances', []);

export const useBondAppInventory = () => 
  useBondAppStorage('bondapp-inventory', []);

export const useBondAppTasks = () => 
  useBondAppStorage('bondapp-tasks', []);

export const useBondAppScores = () => 
  useBondAppStorage('bondapp-scores', []);

export const useBondAppInstruments = () => 
  useBondAppStorage('bondapp-instruments', []);
