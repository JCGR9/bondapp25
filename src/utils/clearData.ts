// Script para limpiar todos los datos de prueba de BondApp
// Ejecutar en la consola del navegador: clearAllBondAppData()

function clearAllBondAppData() {
  console.log('🧹 Iniciando limpieza de datos de prueba de BondApp...');
  
  // Lista de todas las claves de localStorage que usa BondApp
  const bondAppKeys = [
    // Datos principales
    'bondapp-performances',
    'bondapp-components', 
    'bondapp-contracts',
    'bondapp-inventory',
    'bondapp-finances',
    'bondapp_scores',
    'bondapp-tasks',
    'bondapp_marches',
    
    // Datos alternativos o legacy
    'bondapp_contracts',
    'bondapp_financial_entries',
    'bondapp_performances',
    'bondapp_components',
    'bondapp_inventory',
    
    // Configuraciones y cache
    'bondapp_google_drive_config',
    'bondapp_last_sync',
    'bondapp_device_id',
    
    // Datos temporales o de debug
    'bondapp_debug',
    'bondapp_temp'
  ];

  let removedCount = 0;
  
  // Mostrar datos actuales antes de eliminar
  console.log('📊 Estado actual del localStorage:');
  bondAppKeys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        const count = Array.isArray(parsed) ? parsed.length : 'N/A';
        console.log(`  ${key}: ${count} elementos`);
      } catch {
        console.log(`  ${key}: Datos no JSON`);
      }
    }
  });
  
  // Eliminar datos
  bondAppKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      removedCount++;
      console.log(`✅ Eliminado: ${key}`);
    }
  });
  
  // Limpiar cualquier otra clave que empiece con 'bondapp'
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.toLowerCase().includes('bondapp') && !bondAppKeys.includes(key)) {
      localStorage.removeItem(key);
      removedCount++;
      console.log(`✅ Eliminado (extra): ${key}`);
    }
  });
  
  console.log(`\n🎉 Limpieza completada: ${removedCount} elementos eliminados`);
  console.log('📱 Al recargar la página, la app iniciará con datos limpios y se sincronizará con Firebase');
  
  // Verificar que todo esté limpio
  const remaining = Object.keys(localStorage).filter(key => 
    key.toLowerCase().includes('bondapp')
  );
  
  if (remaining.length === 0) {
    console.log('✅ Verificación: localStorage completamente limpio');
  } else {
    console.warn('⚠️ Quedan algunas claves:', remaining);
  }
  
  return {
    removed: removedCount,
    remaining: remaining
  };
}

// Función específica para limpiar solo datos de prueba (mantener configuraciones)
function clearBondAppTestData() {
  console.log('🧹 Limpiando solo datos de prueba (manteniendo configuraciones)...');
  
  const testDataKeys = [
    'bondapp-performances',
    'bondapp-components', 
    'bondapp-contracts',
    'bondapp-inventory',
    'bondapp-finances',
    'bondapp_scores',
    'bondapp-tasks',
    'bondapp_marches'
  ];

  let removedCount = 0;
  
  testDataKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      removedCount++;
      console.log(`✅ Eliminado: ${key}`);
    }
  });
  
  console.log(`\n🎉 Datos de prueba eliminados: ${removedCount} elementos`);
  console.log('🔧 Configuraciones mantenidas (Google Drive, device ID, etc.)');
  
  return { removed: removedCount };
}

// Función para verificar el estado actual
function checkBondAppData() {
  console.log('📊 Estado actual de datos BondApp:');
  
  const dataKeys = [
    'bondapp-performances',
    'bondapp-components', 
    'bondapp-contracts',
    'bondapp-inventory',
    'bondapp-finances',
    'bondapp_scores'
  ];
  
  const status: {[key: string]: number | string} = {};
  
  dataKeys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        const count = Array.isArray(parsed) ? parsed.length : 'N/A';
        status[key] = count;
        console.log(`  ${key}: ${count} elementos`);
      } catch {
        status[key] = 'Error';
        console.log(`  ${key}: Error al parsear`);
      }
    } else {
      status[key] = 0;
      console.log(`  ${key}: Vacío`);
    }
  });
  
  return status;
}

// Exponer funciones globalmente
if (typeof window !== 'undefined') {
  (window as any).clearAllBondAppData = clearAllBondAppData;
  (window as any).clearBondAppTestData = clearBondAppTestData;
  (window as any).checkBondAppData = checkBondAppData;
}

export { clearAllBondAppData, clearBondAppTestData, checkBondAppData };
