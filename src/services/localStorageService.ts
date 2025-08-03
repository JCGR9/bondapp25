/**
 * Servicio de almacenamiento local para BondApp
 * NO requiere Firebase, funciona 100% en el navegador
 */

export class LocalStorageService {
  private getKey(collection: string): string {
    return `bondapp_${collection}`;
  }

  // Obtener datos
  get<T>(collection: string): T[] {
    try {
      const data = localStorage.getItem(this.getKey(collection));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  // Guardar datos
  set<T>(collection: string, data: T[]): void {
    try {
      localStorage.setItem(this.getKey(collection), JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  // Añadir elemento
  add<T extends { id: string }>(collection: string, item: T): void {
    const items = this.get<T>(collection);
    items.push(item);
    this.set(collection, items);
  }

  // Actualizar elemento
  update<T extends { id: string }>(collection: string, id: string, updates: Partial<T>): void {
    const items = this.get<T>(collection);
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      this.set(collection, items);
    }
  }

  // Eliminar elemento
  delete(collection: string, id: string): void {
    const items = this.get(collection);
    const filtered = items.filter((item: any) => item.id !== id);
    this.set(collection, filtered);
  }

  // Limpiar colección
  clear(collection: string): void {
    localStorage.removeItem(this.getKey(collection));
  }

  // Exportar todos los datos
  exportData(): string {
    const allData: Record<string, any> = {};
    const collections = [
      'members', 'performances', 'inventory', 'contracts', 
      'finances', 'scores', 'tasks', 'statistics'
    ];
    
    collections.forEach(collection => {
      allData[collection] = this.get(collection);
    });
    
    return JSON.stringify(allData, null, 2);
  }

  // Importar datos
  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      Object.keys(data).forEach(collection => {
        this.set(collection, data[collection]);
      });
    } catch (error) {
      console.error('Error importing data:', error);
    }
  }
}

// Instancia singleton
export const localDB = new LocalStorageService();
