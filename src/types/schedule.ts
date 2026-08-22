export interface TimetableSlot {
  aula: string;
  horario: [string, string];
  dias: string[]; // 5 days: Seg, Ter, Qua, Qui, Sex
  isInterval?: boolean;
}

export interface SubjectMetadata {
  name: string;
  color: string;
}
