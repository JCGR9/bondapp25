// Tipos de instrumentos para la banda de música
export interface Instrument {
  id: string;
  name: string;
  category: InstrumentCategory;
  description?: string;
  hasVoices: boolean; // Si el instrumento puede tener diferentes voces (1º, 2º)
  createdAt: Date;
  updatedAt: Date;
}

export interface Voice {
  id: string;
  instrumentId: string;
  voiceName: string; // "1º", "2º", "Solista", etc.
  difficulty: VoiceDifficulty;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const InstrumentCategory = {
  VIENTO_METAL: 'VIENTO_METAL',
  VIENTO_MADERA: 'VIENTO_MADERA',
  PERCUSION: 'PERCUSION',
  AUXILIARES: 'AUXILIARES'
} as const;

export type InstrumentCategory = typeof InstrumentCategory[keyof typeof InstrumentCategory];

export const VoiceDifficulty = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
  PROFESSIONAL: 'PROFESSIONAL'
} as const;

export type VoiceDifficulty = typeof VoiceDifficulty[keyof typeof VoiceDifficulty];

// Datos predefinidos de instrumentos de la banda
export const DEFAULT_INSTRUMENTS: Omit<Instrument, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Viento Metal
  { name: 'Trompeta', category: InstrumentCategory.VIENTO_METAL, hasVoices: true, description: 'Instrumento de viento metal agudo' },
  { name: 'Trombón', category: InstrumentCategory.VIENTO_METAL, hasVoices: true, description: 'Instrumento de viento metal con vara' },
  { name: 'Bombardino', category: InstrumentCategory.VIENTO_METAL, hasVoices: false, description: 'Instrumento de viento metal tenor' },
  { name: 'Tuba', category: InstrumentCategory.VIENTO_METAL, hasVoices: false, description: 'Instrumento de viento metal grave' },
  { name: 'Corneta', category: InstrumentCategory.VIENTO_METAL, hasVoices: false, description: 'Instrumento de viento metal pequeño' },
  { name: 'Lira', category: InstrumentCategory.VIENTO_METAL, hasVoices: false, description: 'Instrumento melódico de percusión' },
  
  // Percusión
  { name: 'Caja', category: InstrumentCategory.PERCUSION, hasVoices: false, description: 'Tambor pequeño de percusión' },
  { name: 'Bombo', category: InstrumentCategory.PERCUSION, hasVoices: false, description: 'Tambor grande de percusión' },
  { name: 'Platillos', category: InstrumentCategory.PERCUSION, hasVoices: false, description: 'Discos metálicos de percusión' },
  { name: 'Tambor', category: InstrumentCategory.PERCUSION, hasVoices: false, description: 'Tambor mediano de percusión' },
  { name: 'Campanas', category: InstrumentCategory.PERCUSION, hasVoices: false, description: 'Campanas tubulares o de concierto' },
  
  // Auxiliares (Bandera y otros)
  { name: 'Bandera', category: InstrumentCategory.AUXILIARES, hasVoices: false, description: 'Bandera ceremonial' },
];

// Voces predefinidas para instrumentos que las requieren
export const DEFAULT_VOICES: Omit<Voice, 'id' | 'createdAt' | 'updatedAt' | 'instrumentId'>[] = [
  // Voces para Trompeta
  { voiceName: '1º', difficulty: VoiceDifficulty.ADVANCED, description: 'Primera voz - melodía principal y solos' },
  { voiceName: '2º', difficulty: VoiceDifficulty.INTERMEDIATE, description: 'Segunda voz - armonías y acompañamiento' },
  
  // Voces para Trombón
  { voiceName: '1º', difficulty: VoiceDifficulty.ADVANCED, description: 'Primera voz - melodía y partes solistas' },
  { voiceName: '2º', difficulty: VoiceDifficulty.INTERMEDIATE, description: 'Segunda voz - armonías y bajo' },
];
