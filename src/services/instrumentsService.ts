import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { 
  Instrument, 
  Voice, 
  InstrumentCategory 
} from '../types/instruments';
import { 
  DEFAULT_INSTRUMENTS,
  DEFAULT_VOICES
} from '../types/instruments';

const INSTRUMENTS_COLLECTION = 'instruments';
const VOICES_COLLECTION = 'voices';

// Servicios para Instrumentos
export const instrumentsService = {
  // Obtener todos los instrumentos
  async getAll(): Promise<Instrument[]> {
    const querySnapshot = await getDocs(
      query(collection(db, INSTRUMENTS_COLLECTION), orderBy('name'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Instrument[];
  },

  // Obtener instrumentos por categoría
  async getByCategory(category: InstrumentCategory): Promise<Instrument[]> {
    const q = query(
      collection(db, INSTRUMENTS_COLLECTION), 
      where('category', '==', category),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Instrument[];
  },

  // Crear un nuevo instrumento
  async create(instrumentData: Omit<Instrument, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, INSTRUMENTS_COLLECTION), {
      ...instrumentData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  // Actualizar un instrumento
  async update(id: string, updates: Partial<Instrument>): Promise<void> {
    const docRef = doc(db, INSTRUMENTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  // Eliminar un instrumento
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, INSTRUMENTS_COLLECTION, id));
    // También eliminar las voces asociadas
    const voices = await voicesService.getByInstrument(id);
    for (const voice of voices) {
      await voicesService.delete(voice.id);
    }
  },

  // Inicializar instrumentos por defecto
  async initializeDefaultInstruments(): Promise<void> {
    const existingInstruments = await this.getAll();
    if (existingInstruments.length === 0) {
      for (const instrument of DEFAULT_INSTRUMENTS) {
        const instrumentId = await this.create(instrument);
        
        // Si el instrumento tiene voces, crear las voces por defecto
        if (instrument.hasVoices && (instrument.name === 'Trompeta' || instrument.name === 'Trombón')) {
          for (const voice of DEFAULT_VOICES) {
            await voicesService.create({
              ...voice,
              instrumentId,
            });
          }
        }
      }
    }
  }
};

// Servicios para Voces
export const voicesService = {
  // Obtener todas las voces
  async getAll(): Promise<Voice[]> {
    const querySnapshot = await getDocs(collection(db, VOICES_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Voice[];
  },

  // Obtener voces por instrumento
  async getByInstrument(instrumentId: string): Promise<Voice[]> {
    const q = query(
      collection(db, VOICES_COLLECTION), 
      where('instrumentId', '==', instrumentId),
      orderBy('voiceName')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Voice[];
  },

  // Crear una nueva voz
  async create(voiceData: Omit<Voice, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, VOICES_COLLECTION), {
      ...voiceData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  // Actualizar una voz
  async update(id: string, updates: Partial<Voice>): Promise<void> {
    const docRef = doc(db, VOICES_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  // Eliminar una voz
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, VOICES_COLLECTION, id));
  }
};
