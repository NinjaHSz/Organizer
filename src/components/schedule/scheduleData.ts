import { TimetableSlot, SubjectMetadata } from '../../types/schedule';

export const DAYS_OF_WEEK = ['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA'];

export const TIMETABLE_DATA: TimetableSlot[] = [
  {
    aula: '1ª AULA',
    horario: ['07:10', '07:55'],
    dias: ['MAT', 'BIO', 'ED.FIS', 'FIS', 'QUI'],
  },
  {
    aula: '2ª AULA',
    horario: ['07:55', '08:40'],
    dias: ['ING', 'ING', 'GRAM', 'FIS', 'QUI'],
  },
  {
    aula: '3ª AULA',
    horario: ['08:40', '09:25'],
    dias: ['FIL', 'MAT', 'ETC', 'GEO', 'LIT'],
  },
  {
    aula: '4ª AULA',
    horario: ['09:25', '10:10'],
    dias: ['RED', 'MAT', 'GEO', 'GRAM', 'LIT'],
  },
  {
    aula: 'INTERVALO',
    horario: ['10:10', '10:30'],
    dias: ['INTERVALO', 'INTERVALO', 'INTERVALO', 'INTERVALO', 'INTERVALO'],
    isInterval: true,
  },
  {
    aula: '5ª AULA',
    horario: ['10:30', '11:15'],
    dias: ['BIO', 'SOC', 'HIS', 'ESP', 'FIS'],
  },
  {
    aula: '6ª AULA',
    horario: ['11:15', '12:00'],
    dias: ['ART', 'QUI', 'BIO', 'MAT', 'HIS'],
  },
  {
    aula: '7ª AULA',
    horario: ['12:00', '12:45'],
    dias: ['', '', '', '', ''],
  },
];

export const SUBJECT_METADATA: Record<string, SubjectMetadata> = {
  MAT: { name: 'Matemática', color: '#4285F4' },
  BIO: { name: 'Biologia', color: '#34A853' },
  QUI: { name: 'Química', color: '#009688' },
  FIS: { name: 'Física', color: '#0284C7' },
  ING: { name: 'Inglês', color: '#6366F1' },
  FIL: { name: 'Filosofia', color: '#64748B' },
  SOC: { name: 'Sociologia', color: '#F97316' },
  LIT: { name: 'Literatura', color: '#EC4899' },
  GEO: { name: 'Geografia', color: '#854D0E' },
  HIS: { name: 'História', color: '#EF4444' },
  ART: { name: 'Artes', color: '#F59E0B' },
  RED: { name: 'Redação', color: '#E11D48' },
  GRAM: { name: 'Gramática', color: '#06B6D4' },
  ESP: { name: 'Espanhol', color: '#D97706' },
  'ED.FIS': { name: 'Ed. Física', color: '#84CC16' },
  ETC: { name: 'Etc', color: '#9CA3AF' },
  INTERVALO: { name: 'Intervalo / Recreio', color: '#FBBC05' },
};

export const isTimeInRange = (timeRange: [string, string]): boolean => {
  const now = new Date();
  const [h1, m1] = timeRange[0].split(':').map(Number);
  const [h2, m2] = timeRange[1].split(':').map(Number);
  const start = new Date().setHours(h1, m1, 0);
  const end = new Date().setHours(h2, m2, 0);
  const current = now.getTime();
  return current >= start && current <= end;
};
