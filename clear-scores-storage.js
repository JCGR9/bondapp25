// Script para limpiar el localStorage de partituras si está corrupto
// Ejecutar en la consola del navegador si hay problemas de carga

console.log('🧹 Limpiando localStorage de partituras...');

// Remover datos de partituras
localStorage.removeItem('bondapp_scores');
localStorage.removeItem('bondapp_marches');

console.log('✅ localStorage de partituras limpiado');
console.log('🔄 Recarga la página para reinicializar los datos');

// Mostrar el contenido actual del localStorage
console.log('📋 Contenido actual del localStorage:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.startsWith('bondapp')) {
    console.log(`- ${key}: ${localStorage.getItem(key)?.length || 0} caracteres`);
  }
}
